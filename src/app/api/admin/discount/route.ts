import { NextRequest, NextResponse } from "next/server";
import { createDiscountCode, getOrderCounter } from "@/lib/store";
import {
	createSuccessResponse,
	createErrorResponse,
	generateDiscountCode,
} from "@/lib/utils";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { forceGenerate } = body;

		if (!forceGenerate) {
			return NextResponse.json(
				createErrorResponse(
					"This endpoint is for admin testing only. Set forceGenerate: true",
					"ADMIN_ONLY"
				),
				{ status: 400 }
			);
		}

		const orderCounter = getOrderCounter();
		const generatedCode = generateDiscountCode(orderCounter + 1);
		const discountCode = createDiscountCode(generatedCode);

		return NextResponse.json(createSuccessResponse({ discountCode }), {
			status: 201,
		});
	} catch (error) {
		console.error("Error generating discount code:", error);
		return NextResponse.json(
			createErrorResponse(
				"Failed to generate discount code",
				"DISCOUNT_GENERATION_ERROR"
			),
			{ status: 500 }
		);
	}
}
