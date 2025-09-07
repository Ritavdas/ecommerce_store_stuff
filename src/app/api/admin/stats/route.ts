import { NextResponse } from "next/server";
import { getStats } from "@/lib/store";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";

export async function GET() {
	try {
		const stats = getStats();

		return NextResponse.json(createSuccessResponse(stats));
	} catch (error) {
		console.error("Error fetching admin stats:", error);
		return NextResponse.json(
			createErrorResponse("Failed to fetch statistics", "STATS_ERROR"),
			{ status: 500 }
		);
	}
}
