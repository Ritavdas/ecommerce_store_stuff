import { NextRequest, NextResponse } from "next/server";
import { getCart, updateCart, getProduct } from "@/lib/store";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";
import { AddToCartRequest } from "@/lib/types";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ cartId: string }> }
) {
	try {
		const { cartId } = await params;
		const body: AddToCartRequest = await request.json();
		const { productId, quantity } = body;

		if (!cartId) {
			return NextResponse.json(
				createErrorResponse("Cart ID is required", "MISSING_CART_ID"),
				{ status: 400 }
			);
		}

		if (!productId || quantity <= 0) {
			return NextResponse.json(
				createErrorResponse(
					"Valid product ID and quantity are required",
					"INVALID_INPUT"
				),
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

		const product = getProduct(productId);
		if (!product) {
			return NextResponse.json(
				createErrorResponse("Product not found", "PRODUCT_NOT_FOUND"),
				{ status: 404 }
			);
		}

		if (product.stock < quantity) {
			return NextResponse.json(
				createErrorResponse("Insufficient stock", "INSUFFICIENT_STOCK"),
				{ status: 400 }
			);
		}

		const existingItemIndex = cart.items.findIndex(
			(item) => item.productId === productId
		);

		if (existingItemIndex >= 0) {
			cart.items[existingItemIndex].quantity += quantity;
		} else {
			cart.items.push({
				productId,
				quantity,
				price: product.price,
			});
		}

		const updatedCart = updateCart(cart);

		return NextResponse.json(createSuccessResponse(updatedCart));
	} catch (error) {
		console.error("Error adding item to cart:", error);
		return NextResponse.json(
			createErrorResponse("Failed to add item to cart", "ADD_TO_CART_ERROR"),
			{ status: 500 }
		);
	}
}
