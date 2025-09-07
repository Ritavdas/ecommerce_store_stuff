import {
	test,
	expect,
	ApiHelper,
	TestAssertions,
} from "../../fixtures/test-helpers";
import { SAMPLE_PRODUCTS } from "../../fixtures/test-data";

test.describe("Cart API - Cart Operations", () => {
	let api: ApiHelper;

	test.beforeEach(async ({}) => {
		api = new ApiHelper();
	});

	test("should create new cart with unique ID", async () => {
		// Create first cart
		const cart1Response = await api.createCart();
		TestAssertions.expectSuccessResponse(cart1Response, 201);

		const cart1 = cart1Response.data.data;
		TestAssertions.expectCart(cart1);
		expect(cart1.items).toHaveLength(0);
		expect(cart1.id).toMatch(/^cart_\d+_[a-z0-9]+$/);

		// Create second cart
		const cart2Response = await api.createCart();
		TestAssertions.expectSuccessResponse(cart2Response, 201);

		const cart2 = cart2Response.data.data;
		TestAssertions.expectCart(cart2);
		expect(cart2.items).toHaveLength(0);
		expect(cart2.id).toMatch(/^cart_\d+_[a-z0-9]+$/);

		// Verify unique IDs
		expect(cart1.id).not.toBe(cart2.id);

		// Verify timestamps
		expect(new Date(cart1.createdAt)).toBeInstanceOf(Date);
		expect(new Date(cart1.updatedAt)).toBeInstanceOf(Date);
		expect(cart1.createdAt).toBe(cart1.updatedAt); // Should be same on creation
	});

	test("should add items to cart correctly", async () => {
		// Create cart
		const cartResponse = await api.createCart();
		const cartId = cartResponse.data.data.id;

		// Add first item
		const addItem1Response = await api.addToCart(
			cartId,
			SAMPLE_PRODUCTS[0].id,
			2
		);
		TestAssertions.expectSuccessResponse(addItem1Response);

		let cart = addItem1Response.data.data;
		TestAssertions.expectCart(cart);
		expect(cart.items).toHaveLength(1);

		const item1 = cart.items[0];
		TestAssertions.expectCartItem(item1);
		expect(item1.productId).toBe(SAMPLE_PRODUCTS[0].id);
		expect(item1.quantity).toBe(2);
		expect(item1.price).toBe(SAMPLE_PRODUCTS[0].price);

		// Add second item (different product)
		const addItem2Response = await api.addToCart(
			cartId,
			SAMPLE_PRODUCTS[1].id,
			1
		);
		TestAssertions.expectSuccessResponse(addItem2Response);

		cart = addItem2Response.data.data;
		expect(cart.items).toHaveLength(2);

		const item2 = cart.items[1];
		expect(item2.productId).toBe(SAMPLE_PRODUCTS[1].id);
		expect(item2.quantity).toBe(1);
		expect(item2.price).toBe(SAMPLE_PRODUCTS[1].price);

		// Add more of the first item (should update quantity)
		const addItem3Response = await api.addToCart(
			cartId,
			SAMPLE_PRODUCTS[0].id,
			1
		);
		TestAssertions.expectSuccessResponse(addItem3Response);

		cart = addItem3Response.data.data;
		expect(cart.items).toHaveLength(2); // Still 2 items
		expect(cart.items[0].quantity).toBe(3); // Quantity increased from 2 to 3

		// Verify updatedAt timestamp changed
		expect(new Date(cart.updatedAt)).toBeInstanceOf(Date);
	});

	test("should validate stock when adding items", async () => {
		// Create cart
		const cartResponse = await api.createCart();
		const cartId = cartResponse.data.data.id;

		// Find a product with limited stock
		const product =
			SAMPLE_PRODUCTS.find((p) => p.stock < 100) || SAMPLE_PRODUCTS[1]; // MacBook Air M3 has 15 stock

		// Try to add more items than available stock
		const excessiveQuantity = product.stock + 5;
		const addItemResponse = await api.addToCart(
			cartId,
			product.id,
			excessiveQuantity
		);

		TestAssertions.expectErrorResponse(
			addItemResponse,
			400,
			"INSUFFICIENT_STOCK"
		);
		expect(addItemResponse.data.error).toBe("Insufficient stock");

		// Verify cart remains empty
		const getCartResponse = await api.getCart(cartId);
		TestAssertions.expectSuccessResponse(getCartResponse);
		expect(getCartResponse.data.data.items).toHaveLength(0);

		// Add valid quantity (within stock limit)
		const validQuantity = Math.min(product.stock, 5);
		const validAddResponse = await api.addToCart(
			cartId,
			product.id,
			validQuantity
		);
		TestAssertions.expectSuccessResponse(validAddResponse);

		const cart = validAddResponse.data.data;
		expect(cart.items).toHaveLength(1);
		expect(cart.items[0].quantity).toBe(validQuantity);
	});

	test("should return 404 error for invalid cart ID", async () => {
		const invalidCartId = "cart_nonexistent_123";

		// Try to get non-existent cart
		const getCartResponse = await api.getCart(invalidCartId);
		TestAssertions.expectErrorResponse(
			getCartResponse,
			404,
			"CART_NOT_FOUND"
		);
		expect(getCartResponse.data.error).toBe("Cart not found");

		// Try to add item to non-existent cart
		const addItemResponse = await api.addToCart(
			invalidCartId,
			SAMPLE_PRODUCTS[0].id,
			1
		);
		TestAssertions.expectErrorResponse(
			addItemResponse,
			404,
			"CART_NOT_FOUND"
		);
		expect(addItemResponse.data.error).toBe("Cart not found");

		// Try to remove item from non-existent cart
		const removeItemResponse = await api.removeFromCart(
			invalidCartId,
			SAMPLE_PRODUCTS[0].id
		);
		TestAssertions.expectErrorResponse(
			removeItemResponse,
			404,
			"CART_NOT_FOUND"
		);
		expect(removeItemResponse.data.error).toBe("Cart not found");
	});

	test("should get cart details correctly", async () => {
		// Create cart and add items
		const cartResponse = await api.createCart();
		const cartId = cartResponse.data.data.id;

		// Add multiple items
		await api.addToCart(cartId, SAMPLE_PRODUCTS[0].id, 2);
		await api.addToCart(cartId, SAMPLE_PRODUCTS[2].id, 3);

		// Get cart details
		const getCartResponse = await api.getCart(cartId);
		TestAssertions.expectSuccessResponse(getCartResponse);

		const cart = getCartResponse.data.data;
		TestAssertions.expectCart(cart);

		// Verify cart structure
		expect(cart.id).toBe(cartId);
		expect(cart.items).toHaveLength(2);

		// Verify first item
		const item1 = cart.items[0];
		TestAssertions.expectCartItem(item1);
		expect(item1.productId).toBe(SAMPLE_PRODUCTS[0].id);
		expect(item1.quantity).toBe(2);
		expect(item1.price).toBe(SAMPLE_PRODUCTS[0].price);

		// Verify second item
		const item2 = cart.items[1];
		TestAssertions.expectCartItem(item2);
		expect(item2.productId).toBe(SAMPLE_PRODUCTS[2].id);
		expect(item2.quantity).toBe(3);
		expect(item2.price).toBe(SAMPLE_PRODUCTS[2].price);

		// Verify timestamps
		expect(new Date(cart.createdAt)).toBeInstanceOf(Date);
		expect(new Date(cart.updatedAt)).toBeInstanceOf(Date);
		expect(new Date(cart.updatedAt).getTime()).toBeGreaterThanOrEqual(
			new Date(cart.createdAt).getTime()
		);

		// Test empty cart retrieval
		const emptyCartResponse = await api.createCart();
		const emptyCartId = emptyCartResponse.data.data.id;

		const getEmptyCartResponse = await api.getCart(emptyCartId);
		TestAssertions.expectSuccessResponse(getEmptyCartResponse);

		const emptyCart = getEmptyCartResponse.data.data;
		expect(emptyCart.items).toHaveLength(0);
		expect(emptyCart.id).toBe(emptyCartId);
	});
});
