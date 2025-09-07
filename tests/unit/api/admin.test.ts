import {
	test,
	expect,
	ApiHelper,
	TestAssertions,
} from "../../fixtures/test-helpers";
import { SAMPLE_PRODUCTS, TEST_CONSTANTS } from "../../fixtures/test-data";
import { Product, DiscountCode } from "@/lib/types";

test.describe("Admin API - Products & Admin Functionality", () => {
	let api: ApiHelper;

	test.beforeEach(async ({ cleanStore }) => {
		// Use cleanStore fixture to reset state before each test
		void cleanStore;
		api = new ApiHelper();
	});

	test("should get all products (5 sample products)", async () => {
		const response = await api.getProducts();
		TestAssertions.expectSuccessResponse(response);

		const products = response.data.data.products;
		expect(Array.isArray(products)).toBe(true);
		expect(products).toHaveLength(5);

		// Verify each product has correct structure and matches sample data
		products.forEach((product: Product, index: number) => {
			TestAssertions.expectProduct(product);

			// Verify against sample data
			const expectedProduct = SAMPLE_PRODUCTS[index];
			expect(product.id).toBe(expectedProduct.id);
			expect(product.name).toBe(expectedProduct.name);
			expect(product.price).toBe(expectedProduct.price);
			expect(product.description).toBe(expectedProduct.description);
			expect(product.stock).toBe(expectedProduct.stock);
		});

		// Verify specific products exist
		const productIds = products.map((p: Product) => p.id);
		expect(productIds).toContain("prod_001"); // iPhone 15 Pro
		expect(productIds).toContain("prod_002"); // MacBook Air M3
		expect(productIds).toContain("prod_003"); // AirPods Pro
		expect(productIds).toContain("prod_004"); // Apple Watch Series 9
		expect(productIds).toContain("prod_005"); // iPad Pro 11"

		// Verify price ranges are reasonable
		const prices = products.map((p: Product) => p.price);
		expect(Math.min(...prices)).toBeGreaterThan(0);
		expect(Math.max(...prices)).toBeLessThan(2000); // Reasonable upper bound
	});

	test("should calculate admin stats correctly", async () => {
		// Initially, stats should show no orders
		const initialStatsResponse = await api.getAdminStats();
		TestAssertions.expectSuccessResponse(initialStatsResponse);

		const initialStats = initialStatsResponse.data.data;
		TestAssertions.expectAdminStats(initialStats);
		expect(initialStats.totalOrders).toBe(0);
		expect(initialStats.totalItemsPurchased).toBe(0);
		expect(initialStats.totalRevenue).toBe(0);
		expect(initialStats.totalDiscountAmount).toBe(0);
		expect(initialStats.unusedDiscountCodes).toBe(0);
		expect(initialStats.orders).toHaveLength(0);
		expect(initialStats.discountCodes).toHaveLength(0);

		// Create and checkout some orders to generate stats
		// Order 1: iPhone 15 Pro x1 = $999
		const cart1Response = await api.createCart();
		const cart1Id = cart1Response.data.data.id;
		await api.addToCart(cart1Id, SAMPLE_PRODUCTS[0].id, 1);
		await api.checkout(cart1Id);

		// Order 2: MacBook Air M3 x1 = $1299
		const cart2Response = await api.createCart();
		const cart2Id = cart2Response.data.data.id;
		await api.addToCart(cart2Id, SAMPLE_PRODUCTS[1].id, 1);
		await api.checkout(cart2Id);

		// Order 3: AirPods Pro x2 = $498 (should generate discount code)
		const cart3Response = await api.createCart();
		const cart3Id = cart3Response.data.data.id;
		await api.addToCart(cart3Id, SAMPLE_PRODUCTS[2].id, 2);
		await api.checkout(cart3Id);

		// Get updated stats
		const updatedStatsResponse = await api.getAdminStats();
		TestAssertions.expectSuccessResponse(updatedStatsResponse);

		const updatedStats = updatedStatsResponse.data.data;
		TestAssertions.expectAdminStats(updatedStats);

		// Verify calculated stats
		expect(updatedStats.totalOrders).toBe(3);
		expect(updatedStats.totalItemsPurchased).toBe(4); // 1 + 1 + 2
		expect(updatedStats.totalRevenue).toBe(2796); // 999 + 1299 + 498
		expect(updatedStats.totalDiscountAmount).toBe(0); // No discounts applied
		expect(updatedStats.orders).toHaveLength(3);

		// Verify discount code was generated for 3rd order
		expect(updatedStats.unusedDiscountCodes).toBe(1);
		expect(updatedStats.discountCodes).toHaveLength(1);

		const generatedCode = updatedStats.discountCodes[0];
		TestAssertions.expectDiscountCode(generatedCode);
		expect(generatedCode.code).toBe("SAVE10_003");
		expect(generatedCode.isUsed).toBe(false);
		expect(generatedCode.createdForOrderNumber).toBe(3);
	});

	test("should generate manual discount code for admin", async () => {
		const response = await api.generateAdminDiscount();
		TestAssertions.expectSuccessResponse(response, 201);

		const discountCode = response.data.data.discountCode;
		TestAssertions.expectDiscountCode(discountCode);

		// Verify discount code properties
		expect(discountCode.code).toMatch(/^SAVE10_\d{3}$/);
		expect(discountCode.discount).toBe(TEST_CONSTANTS.DISCOUNT_PERCENTAGE);
		expect(discountCode.isUsed).toBe(false);
		expect(discountCode.createdForOrderNumber).toBeGreaterThan(0);
		expect(new Date(discountCode.createdAt)).toBeInstanceOf(Date);

		// Verify the discount code is now available in the system
		const statsResponse = await api.getAdminStats();
		const stats = statsResponse.data.data;
		expect(stats.discountCodes).toHaveLength(1);
		expect(stats.unusedDiscountCodes).toBe(1);
		expect(stats.discountCodes[0].code).toBe(discountCode.code);

		// Verify the discount code appears in discount codes endpoint
		const discountCodesResponse = await api.getDiscountCodes();
		TestAssertions.expectSuccessResponse(discountCodesResponse);
		const availableCodes = discountCodesResponse.data.data;
		expect(availableCodes).toHaveLength(1);
		expect(availableCodes[0].code).toBe(discountCode.code);
	});

	test("should update stats correctly after new orders", async () => {
		// Generate a manual discount code first
		const discountResponse = await api.generateAdminDiscount();
		const discountCode = discountResponse.data.data.discountCode.code;

		// Get initial stats
		const initialStatsResponse = await api.getAdminStats();
		const initialStats = initialStatsResponse.data.data;
		expect(initialStats.totalOrders).toBe(0);
		expect(initialStats.unusedDiscountCodes).toBe(1);

		// Create order without discount
		const cart1Response = await api.createCart();
		const cart1Id = cart1Response.data.data.id;
		await api.addToCart(cart1Id, SAMPLE_PRODUCTS[0].id, 1); // $999
		await api.checkout(cart1Id);

		// Check stats after first order
		const stats1Response = await api.getAdminStats();
		const stats1 = stats1Response.data.data;
		expect(stats1.totalOrders).toBe(1);
		expect(stats1.totalRevenue).toBe(999);
		expect(stats1.totalDiscountAmount).toBe(0);
		expect(stats1.unusedDiscountCodes).toBe(1); // Discount still unused

		// Create order with discount
		const cart2Response = await api.createCart();
		const cart2Id = cart2Response.data.data.id;
		await api.addToCart(cart2Id, SAMPLE_PRODUCTS[1].id, 1); // $1299
		await api.checkout(cart2Id, discountCode);

		// Check stats after second order with discount
		const stats2Response = await api.getAdminStats();
		const stats2 = stats2Response.data.data;
		expect(stats2.totalOrders).toBe(2);
		expect(stats2.totalRevenue).toBe(2168.1); // 999 + (1299 - 129.9)
		expect(stats2.totalDiscountAmount).toBe(129.9); // 10% of 1299
		expect(stats2.unusedDiscountCodes).toBe(0); // Discount now used

		// Verify the used discount code is marked as used
		const usedDiscountCode = stats2.discountCodes.find(
			(code: DiscountCode) => code.code === discountCode
		);
		expect(usedDiscountCode).toBeDefined();
		expect(usedDiscountCode.isUsed).toBe(true);
		expect(usedDiscountCode.usedAt).toBeDefined();

		// Create third order (should generate new discount)
		const cart3Response = await api.createCart();
		const cart3Id = cart3Response.data.data.id;
		await api.addToCart(cart3Id, SAMPLE_PRODUCTS[2].id, 1); // $249
		await api.checkout(cart3Id);

		// Check final stats
		const finalStatsResponse = await api.getAdminStats();
		const finalStats = finalStatsResponse.data.data;
		expect(finalStats.totalOrders).toBe(3);
		expect(finalStats.totalRevenue).toBe(2417.1); // Previous + 249
		expect(finalStats.totalDiscountAmount).toBe(129.9); // Same as before
		expect(finalStats.unusedDiscountCodes).toBe(1); // New discount generated for 3rd order
		expect(finalStats.discountCodes).toHaveLength(2); // Original + new generated
	});
});
