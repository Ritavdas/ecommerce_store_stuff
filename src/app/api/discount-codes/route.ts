import { NextResponse } from "next/server";
import { getDiscountCodes } from "@/lib/store";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";

export async function GET() {
	try {
		const allDiscountCodes = getDiscountCodes();
		const availableDiscountCodes = allDiscountCodes.filter(
			(code) => !code.isUsed
		);

		return NextResponse.json(createSuccessResponse(availableDiscountCodes));
	} catch (error) {
		console.error("Error fetching discount codes:", error);
		return NextResponse.json(
			createErrorResponse(
				"Failed to fetch discount codes",
				"DISCOUNT_CODES_FETCH_ERROR"
			),
			{ status: 500 }
		);
	}
}
