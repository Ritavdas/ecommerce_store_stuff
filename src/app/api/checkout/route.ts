import { NextRequest, NextResponse } from "next/server";
import {
	getCart,
	deleteCart,
	createOrder,
	getDiscountCode,
	markDiscountAsUsed,
	createDiscountCode,
} from "@/lib/store";
import {
	createSuccessResponse,
	createErrorResponse,
	generateUuid,
	shouldGenerateDiscount,
	generateDiscountCode,
	calculateDiscount,
} from "@/lib/utils";
import { CheckoutRequest, CheckoutResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
	try {
		const body: CheckoutRequest = await request.json();
		const { cartId, discountCode } = body;

		if (!cartId) {
			return NextResponse.json(
				createErrorResponse("Cart ID is required", "MISSING_CART_ID"),
				{ status: 400 }
			);
		}

		const cart = getCart(cartId);
		if (!cart) {
			return NextResponse.json(
				createErrorResponse("Cart not found", "CART_NOT_FOUND"),
				{ status: 404 }
			);
		}

		if (cart.items.length === 0) {
			return NextResponse.json(
				createErrorResponse("Cart is empty", "EMPTY_CART"),
				{ status: 400 }
			);
		}

		const subtotal = cart.items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		);

		let discountAmount = 0;
		let validDiscountCode: string | undefined;

		if (discountCode) {
			const discount = getDiscountCode(discountCode);

			if (!discount) {
				return NextResponse.json(
					createErrorResponse(
						"Invalid discount code",
						"INVALID_DISCOUNT_CODE"
					),
					{ status: 400 }
				);
			}

			if (discount.isUsed) {
				return NextResponse.json(
					createErrorResponse(
						"Discount code has already been used",
						"DISCOUNT_CODE_USED"
					),
					{ status: 400 }
				);
			}

			discountAmount = calculateDiscount(subtotal, discount.discount);
			validDiscountCode = discountCode;
			markDiscountAsUsed(discountCode);
		}

		const total = subtotal - discountAmount;

		const orderId = `order_${generateUuid()}`;
		const order = createOrder({
			id: orderId,
			cartId,
			items: cart.items,
			subtotal,
			discountCode: validDiscountCode,
			discountAmount,
			total,
		});

		deleteCart(cartId);

		let newDiscountCode;
		if (shouldGenerateDiscount(order.orderNumber)) {
			const generatedCode = generateDiscountCode(order.orderNumber);
			newDiscountCode = createDiscountCode(generatedCode);
		}

		const response: CheckoutResponse = {
			order,
			newDiscountCode,
		};

		return NextResponse.json(createSuccessResponse(response), {
			status: 201,
		});
	} catch (error) {
		console.error("Error processing checkout:", error);
		return NextResponse.json(
			createErrorResponse("Failed to process checkout", "CHECKOUT_ERROR"),
			{ status: 500 }
		);
	}
}
