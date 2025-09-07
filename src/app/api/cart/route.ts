import { NextResponse } from "next/server";
import { createCart } from "@/lib/store";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";

export async function POST() {
	try {
		const cart = createCart();

		return NextResponse.json(createSuccessResponse({ cart }), {
			status: 201,
		});
	} catch (error) {
		console.error("Error creating cart:", error);
		return NextResponse.json(
			createErrorResponse("Failed to create cart", "CART_CREATION_ERROR"),
			{ status: 500 }
		);
	}
}
