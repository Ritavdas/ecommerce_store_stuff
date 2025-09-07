import { test as base, expect } from "@playwright/test";
import { resetStore } from "@/lib/store";
import { TEST_CONSTANTS } from "./test-data";
import {
	Product,
	Cart,
	CartItem,
	Order,
	DiscountCode,
	AdminStats,
} from "@/lib/types";

// Extend Playwright test with custom fixtures
export const test = base.extend<{ cleanStore: void }>({
	// Custom fixture to reset store before each test
	cleanStore: async ({}, use) => {
		// Reset store via API call to ensure server state is clean
		try {
			await fetch(`${TEST_CONSTANTS.BASE_URL}/api/admin/reset`, {
				method: "POST",
			});
		} catch {
			// If reset endpoint doesn't exist, fall back to direct reset
			resetStore();
		}
		await use(undefined);
	},
});

export { expect };

// API Helper class for making HTTP requests
export class ApiHelper {
	private baseUrl: string;

	constructor(baseUrl: string = TEST_CONSTANTS.BASE_URL) {
		this.baseUrl = baseUrl;
	}

	// Generic request helper
	async makeRequest(
		endpoint: string,
		options: {
			method?: string;
			body?: unknown;
			headers?: Record<string, string>;
		} = {}
	) {
		const { method = "GET", body, headers = {} } = options;

		const requestOptions: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
		};

		if (body && method !== "GET") {
			requestOptions.body = JSON.stringify(body);
		}

		const response = await fetch(
			`${this.baseUrl}${endpoint}`,
			requestOptions
		);
		const data = await response.json();

		return {
			status: response.status,
			data,
			ok: response.ok,
		};
	}

	// Products API helpers
	async getProducts() {
		return this.makeRequest(TEST_CONSTANTS.API_ENDPOINTS.PRODUCTS);
	}

	// Cart API helpers
	async createCart() {
		return this.makeRequest(TEST_CONSTANTS.API_ENDPOINTS.CART, {
			method: "POST",
		});
	}

	async getCart(cartId: string) {
		return this.makeRequest(`${TEST_CONSTANTS.API_ENDPOINTS.CART}/${cartId}`);
	}

	async addToCart(cartId: string, productId: string, quantity: number) {
		return this.makeRequest(
			`${TEST_CONSTANTS.API_ENDPOINTS.CART}/${cartId}/items`,
			{
				method: "POST",
				body: { productId, quantity },
			}
		);
	}

	async removeFromCart(cartId: string, productId: string) {
		return this.makeRequest(
			`${TEST_CONSTANTS.API_ENDPOINTS.CART}/${cartId}/items/${productId}`,
			{
				method: "DELETE",
			}
		);
	}

	// Checkout API helpers
	async checkout(cartId: string, discountCode?: string) {
		return this.makeRequest(TEST_CONSTANTS.API_ENDPOINTS.CHECKOUT, {
			method: "POST",
			body: { cartId, discountCode },
		});
	}

	// Admin API helpers
	async getAdminStats() {
		return this.makeRequest(TEST_CONSTANTS.API_ENDPOINTS.ADMIN_STATS);
	}

	async generateAdminDiscount() {
		return this.makeRequest(TEST_CONSTANTS.API_ENDPOINTS.ADMIN_DISCOUNT, {
			method: "POST",
			body: { forceGenerate: true },
		});
	}

	// Discount codes API helpers
	async getDiscountCodes() {
		return this.makeRequest(TEST_CONSTANTS.API_ENDPOINTS.DISCOUNT_CODES);
	}
}

// Test assertion helpers
export class TestAssertions {
	static expectSuccessResponse(
		response: {
			status: number;
			ok: boolean;
			data: { error?: string; data?: unknown };
		},
		expectedStatus: number = 200
	) {
		expect(response.status).toBe(expectedStatus);
		expect(response.ok).toBe(true);
		expect(response.data.error).toBeUndefined();
		expect(response.data.data).toBeDefined();
	}

	static expectErrorResponse(
		response: {
			status: number;
			ok: boolean;
			data: { error?: string; code?: string };
		},
		expectedStatus: number,
		expectedCode?: string
	) {
		expect(response.status).toBe(expectedStatus);
		expect(response.ok).toBe(false);
		expect(response.data.error).toBeDefined();
		if (expectedCode) {
			expect(response.data.code).toBe(expectedCode);
		}
	}

	static expectProduct(product: Product) {
		expect(product).toHaveProperty("id");
		expect(product).toHaveProperty("name");
		expect(product).toHaveProperty("price");
		expect(product).toHaveProperty("description");
		expect(product).toHaveProperty("stock");
		expect(typeof product.price).toBe("number");
		expect(typeof product.stock).toBe("number");
		expect(product.price).toBeGreaterThan(0);
		expect(product.stock).toBeGreaterThanOrEqual(0);
	}

	static expectCart(cart: Cart) {
		expect(cart).toHaveProperty("id");
		expect(cart).toHaveProperty("items");
		expect(cart).toHaveProperty("createdAt");
		expect(cart).toHaveProperty("updatedAt");
		expect(Array.isArray(cart.items)).toBe(true);
	}

	static expectCartItem(item: CartItem) {
		expect(item).toHaveProperty("productId");
		expect(item).toHaveProperty("quantity");
		expect(item).toHaveProperty("price");
		expect(typeof item.quantity).toBe("number");
		expect(typeof item.price).toBe("number");
		expect(item.quantity).toBeGreaterThan(0);
		expect(item.price).toBeGreaterThan(0);
	}

	static expectOrder(order: Order) {
		expect(order).toHaveProperty("id");
		expect(order).toHaveProperty("orderNumber");
		expect(order).toHaveProperty("cartId");
		expect(order).toHaveProperty("items");
		expect(order).toHaveProperty("subtotal");
		expect(order).toHaveProperty("discountAmount");
		expect(order).toHaveProperty("total");
		expect(order).toHaveProperty("createdAt");
		expect(Array.isArray(order.items)).toBe(true);
		expect(typeof order.orderNumber).toBe("number");
		expect(typeof order.subtotal).toBe("number");
		expect(typeof order.discountAmount).toBe("number");
		expect(typeof order.total).toBe("number");
		expect(order.orderNumber).toBeGreaterThan(0);
		expect(order.subtotal).toBeGreaterThan(0);
		expect(order.total).toBeGreaterThan(0);
	}

	static expectDiscountCode(discountCode: DiscountCode) {
		expect(discountCode).toHaveProperty("code");
		expect(discountCode).toHaveProperty("discount");
		expect(discountCode).toHaveProperty("isUsed");
		expect(discountCode).toHaveProperty("createdForOrderNumber");
		expect(discountCode).toHaveProperty("createdAt");
		expect(typeof discountCode.discount).toBe("number");
		expect(typeof discountCode.isUsed).toBe("boolean");
		expect(typeof discountCode.createdForOrderNumber).toBe("number");
		expect(discountCode.discount).toBeGreaterThan(0);
		expect(discountCode.discount).toBeLessThanOrEqual(1);
	}

	static expectAdminStats(stats: AdminStats) {
		expect(stats).toHaveProperty("totalOrders");
		expect(stats).toHaveProperty("totalItemsPurchased");
		expect(stats).toHaveProperty("totalRevenue");
		expect(stats).toHaveProperty("totalDiscountAmount");
		expect(stats).toHaveProperty("discountCodes");
		expect(stats).toHaveProperty("unusedDiscountCodes");
		expect(stats).toHaveProperty("orders");
		expect(typeof stats.totalOrders).toBe("number");
		expect(typeof stats.totalItemsPurchased).toBe("number");
		expect(typeof stats.totalRevenue).toBe("number");
		expect(typeof stats.totalDiscountAmount).toBe("number");
		expect(typeof stats.unusedDiscountCodes).toBe("number");
		expect(Array.isArray(stats.discountCodes)).toBe(true);
		expect(Array.isArray(stats.orders)).toBe(true);
	}
}

// Utility functions for tests
export function calculateExpectedSubtotal(
	items: Array<{ price: number; quantity: number }>
) {
	return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateExpectedDiscount(
	subtotal: number,
	discountRate: number = 0.1
) {
	return subtotal * discountRate;
}

export function isNthOrder(orderNumber: number, n: number = 3) {
	return orderNumber % n === 0;
}

// Wait helper for async operations
export async function waitForCondition(
	condition: () => Promise<boolean>,
	timeout: number = 5000,
	interval: number = 100
) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		if (await condition()) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(`Condition not met within ${timeout}ms`);
}
