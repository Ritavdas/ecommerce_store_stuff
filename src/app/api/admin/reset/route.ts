import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";

export async function POST() {
	try {
		// Only allow reset in development/test environment
		if (process.env.NODE_ENV === "production") {
			return NextResponse.json(
				createErrorResponse("Reset not allowed in production", "PRODUCTION_RESET_DENIED"),
				{ status: 403 }
			);
		}

		resetStore();

		return NextResponse.json(createSuccessResponse({ message: "Store reset successfully" }));
	} catch (error) {
		console.error("Error resetting store:", error);
		return NextResponse.json(
			createErrorResponse("Failed to reset store", "RESET_ERROR"),
			{ status: 500 }
		);
	}
}
