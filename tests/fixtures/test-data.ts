import { Product, Cart, Order, DiscountCode, CartItem } from "@/lib/types";

// Sample products matching the store implementation
export const SAMPLE_PRODUCTS: Product[] = [
	{
		id: "prod_001",
		name: "iPhone 15 Pro",
		price: 999,
		description: "Latest iPhone with advanced camera",
		stock: 25,
	},
	{
		id: "prod_002",
		name: "MacBook Air M3",
		price: 1299,
		description: "13-inch laptop with M3 chip",
		stock: 15,
	},
	{
		id: "prod_003",
		name: "AirPods Pro",
		price: 249,
		description: "Noise cancelling wireless earbuds",
		stock: 50,
	},
	{
		id: "prod_004",
		name: "Apple Watch Series 9",
		price: 399,
		description: "Advanced smartwatch with health features",
		stock: 30,
	},
	{
		id: "prod_005",
		name: 'iPad Pro 11"',
		price: 799,
		description: "Professional tablet with M2 chip",
		stock: 20,
	},
];

// Sample cart items for testing
export const SAMPLE_CART_ITEMS: CartItem[] = [
	{
		productId: "prod_001",
		quantity: 1,
		price: 999,
	},
	{
		productId: "prod_003",
		quantity: 2,
		price: 249,
	},
];

// Sample cart for testing
export const SAMPLE_CART: Cart = {
	id: "cart_test_123",
	items: SAMPLE_CART_ITEMS,
	createdAt: new Date("2024-01-01T00:00:00Z"),
	updatedAt: new Date("2024-01-01T00:00:00Z"),
};

// Empty cart for testing
export const EMPTY_CART: Cart = {
	id: "cart_empty_456",
	items: [],
	createdAt: new Date("2024-01-01T00:00:00Z"),
	updatedAt: new Date("2024-01-01T00:00:00Z"),
};

// Sample orders for testing
export const SAMPLE_ORDERS: Order[] = [
	{
		id: "order_001",
		orderNumber: 1,
		cartId: "cart_test_123",
		items: [
			{
				productId: "prod_001",
				quantity: 1,
				price: 999,
			},
		],
		subtotal: 999,
		discountAmount: 0,
		total: 999,
		createdAt: new Date("2024-01-01T00:00:00Z"),
	},
	{
		id: "order_002",
		orderNumber: 2,
		cartId: "cart_test_456",
		items: [
			{
				productId: "prod_002",
				quantity: 1,
				price: 1299,
			},
		],
		subtotal: 1299,
		discountAmount: 0,
		total: 1299,
		createdAt: new Date("2024-01-01T01:00:00Z"),
	},
	{
		id: "order_003",
		orderNumber: 3,
		cartId: "cart_test_789",
		items: [
			{
				productId: "prod_003",
				quantity: 2,
				price: 249,
			},
		],
		subtotal: 498,
		discountCode: "SAVE10_003",
		discountAmount: 49.8,
		total: 448.2,
		createdAt: new Date("2024-01-01T02:00:00Z"),
	},
];

// Sample discount codes for testing
export const SAMPLE_DISCOUNT_CODES: DiscountCode[] = [
	{
		code: "SAVE10_003",
		discount: 0.1,
		isUsed: false,
		createdForOrderNumber: 3,
		createdAt: new Date("2024-01-01T00:00:00Z"),
	},
	{
		code: "SAVE10_006",
		discount: 0.1,
		isUsed: true,
		createdForOrderNumber: 6,
		createdAt: new Date("2024-01-01T01:00:00Z"),
		usedAt: new Date("2024-01-01T02:00:00Z"),
	},
	{
		code: "SAVE10_009",
		discount: 0.1,
		isUsed: false,
		createdForOrderNumber: 9,
		createdAt: new Date("2024-01-01T02:00:00Z"),
	},
];

// Test constants
export const TEST_CONSTANTS = {
	DISCOUNT_PERCENTAGE: 0.1,
	DISCOUNT_EVERY_N_ORDERS: 3,
	BASE_URL: "http://localhost:3000",
	API_ENDPOINTS: {
		PRODUCTS: "/api/products",
		CART: "/api/cart",
		CHECKOUT: "/api/checkout",
		ADMIN_STATS: "/api/admin/stats",
		ADMIN_DISCOUNT: "/api/admin/discount",
		DISCOUNT_CODES: "/api/discount-codes",
	},
};

// Helper function to create test cart with specific items
export function createTestCart(items: CartItem[] = []): Cart {
	return {
		id: `cart_test_${Date.now()}`,
		items,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

// Helper function to create test order
export function createTestOrder(
	orderNumber: number,
	items: CartItem[],
	discountCode?: string
): Order {
	const subtotal = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const discountAmount = discountCode ? subtotal * 0.1 : 0;
	const total = subtotal - discountAmount;

	return {
		id: `order_test_${orderNumber}`,
		orderNumber,
		cartId: `cart_test_${orderNumber}`,
		items,
		subtotal,
		discountCode,
		discountAmount,
		total,
		createdAt: new Date(),
	};
}

// Helper function to create test discount code
export function createTestDiscountCode(
	orderNumber: number,
	isUsed: boolean = false
): DiscountCode {
	return {
		code: `SAVE10_${orderNumber.toString().padStart(3, "0")}`,
		discount: 0.1,
		isUsed,
		createdForOrderNumber: orderNumber,
		createdAt: new Date(),
		...(isUsed && { usedAt: new Date() }),
	};
}
