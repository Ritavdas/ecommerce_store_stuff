import {
	test,
	expect,
	ApiHelper,
	TestAssertions,
} from "../../fixtures/test-helpers";
import { SAMPLE_PRODUCTS, TEST_CONSTANTS } from "../../fixtures/test-data";

test.describe("Checkout API - Core Business Logic", () => {
	let api: ApiHelper;

	test.beforeEach(async ({}) => {
		api = new ApiHelper();
	});

	test("should generate discount code for every 3rd order (nth order discount)", async () => {
		// Create a cart and add items
		const cartResponse = await api.createCart();
		TestAssertions.expectSuccessResponse(cartResponse, 201);
		const cartId = cartResponse.data.data.id;

		await api.addToCart(cartId, SAMPLE_PRODUCTS[0].id, 1);

		// Process first order (order #1) - should not generate discount
		const firstCheckout = await api.checkout(cartId);
		TestAssertions.expectSuccessResponse(firstCheckout, 201);
		expect(firstCheckout.data.data.order.orderNumber).toBe(1);
		expect(firstCheckout.data.data.newDiscountCode).toBeUndefined();

		// Create second cart and checkout (order #2) - should not generate discount
		const cart2Response = await api.createCart();
		const cart2Id = cart2Response.data.data.id;
		await api.addToCart(cart2Id, SAMPLE_PRODUCTS[1].id, 1);

		const secondCheckout = await api.checkout(cart2Id);
		TestAssertions.expectSuccessResponse(secondCheckout, 201);
		expect(secondCheckout.data.data.order.orderNumber).toBe(2);
		expect(secondCheckout.data.data.newDiscountCode).toBeUndefined();

		// Create third cart and checkout (order #3) - should generate discount
		const cart3Response = await api.createCart();
		const cart3Id = cart3Response.data.data.id;
		await api.addToCart(cart3Id, SAMPLE_PRODUCTS[2].id, 1);

		const thirdCheckout = await api.checkout(cart3Id);
		TestAssertions.expectSuccessResponse(thirdCheckout, 201);
		expect(thirdCheckout.data.data.order.orderNumber).toBe(3);
		expect(thirdCheckout.data.data.newDiscountCode).toBeDefined();

		const newDiscountCode = thirdCheckout.data.data.newDiscountCode;
		TestAssertions.expectDiscountCode(newDiscountCode);
		expect(newDiscountCode.code).toBe("SAVE10_003");
		expect(newDiscountCode.discount).toBe(TEST_CONSTANTS.DISCOUNT_PERCENTAGE);
		expect(newDiscountCode.isUsed).toBe(false);
		expect(newDiscountCode.createdForOrderNumber).toBe(3);
	});

	test("should apply valid discount code correctly (10% discount)", async () => {
		// Create a discount code via admin API first
		const discountResponse = await api.generateAdminDiscount();
		TestAssertions.expectSuccessResponse(discountResponse, 201);
		const discountCode = discountResponse.data.data.discountCode.code;

		// Create cart and add items
		const cartResponse = await api.createCart();
		const cartId = cartResponse.data.data.id;
		await api.addToCart(cartId, SAMPLE_PRODUCTS[0].id, 1); // $999

		// Checkout with valid discount code
		const checkoutResponse = await api.checkout(cartId, discountCode);
		TestAssertions.expectSuccessResponse(checkoutResponse, 201);

		const order = checkoutResponse.data.data.order;
		TestAssertions.expectOrder(order);

		expect(order.subtotal).toBe(999);
		expect(order.discountCode).toBe(discountCode);
		expect(order.discountAmount).toBe(99.9); // 10% of 999
		expect(order.total).toBe(899.1); // 999 - 99.9
	});

	test("should reject invalid discount code", async () => {
		// Create cart and add items
		const cartResponse = await api.createCart();
		const cartId = cartResponse.data.data.id;
		await api.addToCart(cartId, SAMPLE_PRODUCTS[0].id, 1);

		// Try to checkout with invalid discount code
		const checkoutResponse = await api.checkout(cartId, "INVALID_CODE");
		TestAssertions.expectErrorResponse(
			checkoutResponse,
			400,
			"INVALID_DISCOUNT_CODE"
		);
		expect(checkoutResponse.data.error).toBe("Invalid discount code");
	});

	test("should reject already used discount code", async () => {
		// Create a discount code via admin API first
		const discountResponse = await api.generateAdminDiscount();
		const discountCode = discountResponse.data.data.discountCode.code;

		// Create first cart and use the discount code
		const cart1Response = await api.createCart();
		const cart1Id = cart1Response.data.data.id;
		await api.addToCart(cart1Id, SAMPLE_PRODUCTS[0].id, 1);
		await api.checkout(cart1Id, discountCode); // This should use the discount code

		// Create second cart and try to use the same discount code
		const cart2Response = await api.createCart();
		const cart2Id = cart2Response.data.data.id;
		await api.addToCart(cart2Id, SAMPLE_PRODUCTS[1].id, 1);

		// Try to checkout with already used discount code
		const checkoutResponse = await api.checkout(cart2Id, discountCode);
		TestAssertions.expectErrorResponse(
			checkoutResponse,
			400,
			"DISCOUNT_CODE_USED"
		);
		expect(checkoutResponse.data.error).toBe(
			"Discount code has already been used"
		);
	});

	test("should assign sequential order numbers (1, 2, 3...)", async () => {
		const orderNumbers: number[] = [];

		// Create and checkout multiple orders
		for (let i = 0; i < 5; i++) {
			const cartResponse = await api.createCart();
			const cartId = cartResponse.data.data.id;
			await api.addToCart(
				cartId,
				SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length].id,
				1
			);

			const checkoutResponse = await api.checkout(cartId);
			TestAssertions.expectSuccessResponse(checkoutResponse, 201);

			const orderNumber = checkoutResponse.data.data.order.orderNumber;
			orderNumbers.push(orderNumber);
		}

		// Verify sequential numbering
		expect(orderNumbers).toEqual([1, 2, 3, 4, 5]);

		// Verify each order number is unique and incremental
		for (let i = 0; i < orderNumbers.length; i++) {
			expect(orderNumbers[i]).toBe(i + 1);
		}
	});

	test("should reject checkout of empty cart", async () => {
		// Create an empty cart
		const cartResponse = await api.createCart();
		const cartId = cartResponse.data.data.id;

		// Try to checkout empty cart
		const checkoutResponse = await api.checkout(cartId);
		TestAssertions.expectErrorResponse(checkoutResponse, 400, "EMPTY_CART");
		expect(checkoutResponse.data.error).toBe("Cart is empty");
	});
});
