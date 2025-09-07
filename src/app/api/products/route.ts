import { NextResponse } from "next/server";
import { getProducts } from "@/lib/store";
import { createSuccessResponse } from "@/lib/utils";

export async function GET() {
	try {
		const products = getProducts();

		return NextResponse.json(createSuccessResponse({ products }));
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}
