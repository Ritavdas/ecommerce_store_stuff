import { DiscountCode } from "./types";

export const DISCOUNT_EVERY_N_ORDERS = 3;
export const DISCOUNT_PERCENTAGE = 0.1;

export function generateUuid(): string {
	return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateDiscountCode(orderNumber: number): DiscountCode {
	const code = `SAVE10_${orderNumber.toString().padStart(3, "0")}`;

	return {
		code,
		discount: DISCOUNT_PERCENTAGE,
		isUsed: false,
		createdForOrderNumber: orderNumber,
		createdAt: new Date(),
	};
}

export function shouldGenerateDiscount(orderNumber: number): boolean {
	return orderNumber % DISCOUNT_EVERY_N_ORDERS === 0;
}

export function calculateDiscount(
	subtotal: number,
	discountPercentage: number
): number {
	return Math.round(subtotal * discountPercentage * 100) / 100;
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function createErrorResponse(
	message: string,
	code?: string,
	details?: unknown
) {
	return {
		error: message,
		code: code || "UNKNOWN_ERROR",
		details: details || {},
	};
}

export function createSuccessResponse<T>(data: T) {
	return {
		data,
	};
}
