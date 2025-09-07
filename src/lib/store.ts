import { Product, Cart, Order, DiscountCode, Store } from "./types";

const SAMPLE_PRODUCTS: Product[] = [
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

const store: Store = {
	products: new Map(),
	carts: new Map(),
	orders: new Map(),
	discountCodes: new Map(),
	orderCounter: 0,
};

function initializeProducts() {
	SAMPLE_PRODUCTS.forEach((product) => {
		store.products.set(product.id, product);
	});
}

initializeProducts();

export function getProducts(): Product[] {
	return Array.from(store.products.values());
}

export function getProduct(id: string): Product | undefined {
	return store.products.get(id);
}

export function createCart(): Cart {
	const cartId = `cart_${Date.now()}_${Math.random()
		.toString(36)
		.substring(2, 11)}`;
	const cart: Cart = {
		id: cartId,
		items: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	store.carts.set(cartId, cart);
	return cart;
}

export function getCart(cartId: string): Cart | undefined {
	return store.carts.get(cartId);
}

export function updateCart(cart: Cart): Cart {
	cart.updatedAt = new Date();
	store.carts.set(cart.id, cart);
	return cart;
}

export function deleteCart(cartId: string): boolean {
	return store.carts.delete(cartId);
}

export function createOrder(order: Omit<Order, "orderNumber" | "createdAt">): Order {
	store.orderCounter += 1;
	const fullOrder: Order = {
		...order,
		orderNumber: store.orderCounter,
		createdAt: new Date(),
	};

	store.orders.set(fullOrder.id, fullOrder);
	return fullOrder;
}

export function getOrder(orderId: string): Order | undefined {
	return store.orders.get(orderId);
}

export function getOrders(): Order[] {
	return Array.from(store.orders.values());
}

export function getOrderCounter(): number {
	return store.orderCounter;
}

export function createDiscountCode(discountCode: DiscountCode): DiscountCode {
	store.discountCodes.set(discountCode.code, discountCode);
	return discountCode;
}

export function getDiscountCode(code: string): DiscountCode | undefined {
	return store.discountCodes.get(code);
}

export function getDiscountCodes(): DiscountCode[] {
	return Array.from(store.discountCodes.values());
}

export function markDiscountAsUsed(code: string): DiscountCode | undefined {
	const discount = store.discountCodes.get(code);
	if (discount) {
		discount.isUsed = true;
		discount.usedAt = new Date();
		store.discountCodes.set(code, discount);
	}
	return discount;
}

export function getStats() {
	const orders = getOrders();
	const discountCodes = getDiscountCodes();

	return {
		totalOrders: orders.length,
		totalItemsPurchased: orders.reduce(
			(sum, order) =>
				sum +
				order.items.reduce(
					(itemSum, item) => itemSum + item.quantity,
					0
				),
			0
		),
		totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
		totalDiscountAmount: orders.reduce(
			(sum, order) => sum + order.discountAmount,
			0
		),
		discountCodes,
		unusedDiscountCodes: discountCodes.filter((code) => !code.isUsed).length,
		orders,
	};
}

export function resetStore() {
	store.carts.clear();
	store.orders.clear();
	store.discountCodes.clear();
	store.orderCounter = 0;
	// Keep products as they should always be available
}