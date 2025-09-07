export interface Product {
	id: string;
	name: string;
	price: number;
	description: string;
	stock: number;
}

export interface CartItem {
	productId: string;
	quantity: number;
	price: number;
}

export interface Cart {
	id: string;
	items: CartItem[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Order {
	id: string;
	orderNumber: number;
	cartId: string;
	items: CartItem[];
	subtotal: number;
	discountCode?: string;
	discountAmount: number;
	total: number;
	createdAt: Date;
}

export interface DiscountCode {
	code: string;
	discount: number;
	isUsed: boolean;
	createdForOrderNumber: number;
	createdAt: Date;
	usedAt?: Date;
}

export interface Store {
	products: Map<string, Product>;
	carts: Map<string, Cart>;
	orders: Map<string, Order>;
	discountCodes: Map<string, DiscountCode>;
	orderCounter: number;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
	code?: string;
	details?: unknown;
}

export interface CheckoutRequest {
	cartId: string;
	discountCode?: string;
}

export interface CheckoutResponse {
	order: Order;
	newDiscountCode?: DiscountCode;
}

export interface AdminStats {
	totalOrders: number;
	totalItemsPurchased: number;
	totalRevenue: number;
	totalDiscountAmount: number;
	discountCodes: DiscountCode[];
	unusedDiscountCodes: number;
	orders: Order[];
}

export interface AddToCartRequest {
	productId: string;
	quantity: number;
}
