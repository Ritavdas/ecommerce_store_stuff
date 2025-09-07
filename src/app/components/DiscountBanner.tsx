"use client";

import { useState, useEffect } from "react";
import { DiscountCode } from "@/lib/types";

interface DiscountBannerProps {
	refreshTrigger?: number; // Increment this to trigger refresh
}

export default function DiscountBanner({
	refreshTrigger,
}: DiscountBannerProps) {
	const [availableDiscounts, setAvailableDiscounts] = useState<DiscountCode[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchAvailableDiscounts();
	}, [refreshTrigger]); // Re-fetch when refreshTrigger changes

	const fetchAvailableDiscounts = async () => {
		try {
			const response = await fetch("/api/discount-codes");
			const data = await response.json();

			if (data.data) {
				setAvailableDiscounts(data.data);
			} else if (data.error) {
				setError(data.error);
			}
		} catch (error) {
			console.error("Failed to fetch discount codes:", error);
			setError("Failed to load discount codes");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return null; // Don't show anything while loading
	}

	if (error || availableDiscounts.length === 0) {
		return null; // Don't show banner if no codes or error
	}

	// Show only the most recent available discount code
	const latestDiscount = availableDiscounts[0];

	return (
		<div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
							<span className="text-xl">🎉</span>
						</div>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-green-800">
							You have a discount code available!
						</h3>
						<p className="text-green-700">
							Save 10% on your next order with code:
						</p>
					</div>
				</div>
				<div className="text-right">
					<div
						className="bg-white border-2 border-dashed border-green-300 rounded-lg px-4 py-2 mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
						onClick={() => {
							navigator.clipboard.writeText(latestDiscount.code);
							// You could add a toast notification here
						}}
						title="Click to copy discount code"
					>
						<code className="text-xl font-mono font-bold text-green-800">
							{latestDiscount.code}
						</code>
					</div>
					<p className="text-sm text-green-600">
						Click to copy and use at checkout! 📋
					</p>
				</div>
			</div>

			{availableDiscounts.length > 1 && (
				<div className="mt-3 pt-3 border-t border-green-200">
					<p className="text-sm text-green-600">
						+ {availableDiscounts.length - 1} more discount code
						{availableDiscounts.length - 1 > 1 ? "s" : ""} available
					</p>
				</div>
			)}
		</div>
	);
}
