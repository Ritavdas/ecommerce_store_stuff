"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminStats, DiscountCode } from "@/lib/types";

export default function AdminPage() {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/admin/stats");
			const data = await response.json();
			if (data.data) {
				setStats(data.data);
			} else if (data.error) {
				setError(data.error);
			}
		} catch (error) {
			console.error("Failed to fetch stats:", error);
			setError("Failed to load statistics");
		}
	};

	const generateDiscountCode = async () => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const response = await fetch("/api/admin/discount", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ forceGenerate: true }),
			});

			const data = await response.json();
			if (data.data) {
				setSuccessMessage(`Generated discount code: ${data.data.code}`);
				fetchStats(); // Refresh stats
			} else if (data.error) {
				setError(data.error);
			}
		} catch (error) {
			console.error("Failed to generate discount code:", error);
			setError("Failed to generate discount code");
		} finally {
			setIsLoading(false);
		}
	};

	if (!stats && !error) {
		return (
			<div className="min-h-screen bg-gray-100 p-8">
				<div className="max-w-4xl mx-auto">
					<p className="text-center text-gray-500">
						Loading admin dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">
							📊 Admin Dashboard
						</h1>
						<nav className="flex space-x-4">
							<Link
								href="/"
								className="text-blue-600 hover:text-blue-800 font-medium"
							>
								← Back to Store
							</Link>
						</nav>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				{successMessage && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
						<p className="text-green-800">{successMessage}</p>
					</div>
				)}

				{stats && (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<StatsCard
								title="Total Orders"
								value={stats.totalOrders}
								icon="📦"
								color="blue"
							/>
							<StatsCard
								title="Items Sold"
								value={stats.totalItemsPurchased}
								icon="📱"
								color="green"
							/>
							<StatsCard
								title="Total Revenue"
								value={`$${stats.totalRevenue.toFixed(2)}`}
								icon="💰"
								color="yellow"
							/>
							<StatsCard
								title="Total Discounts"
								value={`$${stats.totalDiscountAmount.toFixed(2)}`}
								icon="🎫"
								color="purple"
							/>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="bg-white rounded-lg shadow-md p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">
										Discount Management
									</h2>
									<button
										onClick={generateDiscountCode}
										disabled={isLoading}
										className={`px-4 py-2 rounded-md font-medium transition-colors ${
											isLoading
												? "bg-gray-300 text-gray-500 cursor-not-allowed"
												: "bg-blue-600 text-white hover:bg-blue-700"
										}`}
									>
										{isLoading ? "Generating..." : "Generate Code"}
									</button>
								</div>

								<div className="mb-4">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="bg-gray-50 p-3 rounded">
											<p className="text-gray-600">
												Total Codes Created
											</p>
											<p className="text-2xl font-bold text-blue-600">
												{stats.discountCodes.length}
											</p>
										</div>
										<div className="bg-gray-50 p-3 rounded">
											<p className="text-gray-600">Unused Codes</p>
											<p className="text-2xl font-bold text-green-600">
												{stats.unusedDiscountCodes}
											</p>
										</div>
									</div>
								</div>

								<div className="text-sm text-gray-600">
									<p>
										• Discount codes are automatically generated every
										3rd order
									</p>
									<p>
										• Each code provides 10% discount on entire order
									</p>
									<p>• Codes can only be used once</p>
								</div>
							</div>

							<div className="bg-white rounded-lg shadow-md p-6">
								<h2 className="text-xl font-semibold mb-4">
									Discount Codes
								</h2>

								{stats.discountCodes.length === 0 ? (
									<p className="text-gray-500">
										No discount codes generated yet.
									</p>
								) : (
									<div className="space-y-2 max-h-80 overflow-y-auto">
										{stats.discountCodes
											.sort(
												(a, b) =>
													new Date(b.createdAt).getTime() -
													new Date(a.createdAt).getTime()
											)
											.map((code) => (
												<DiscountCodeItem
													key={code.code}
													discountCode={code}
												/>
											))}
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: string;
	color: "blue" | "green" | "yellow" | "purple";
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
	const colorClasses = {
		blue: "bg-blue-50 border-blue-200 text-blue-800",
		green: "bg-green-50 border-green-200 text-green-800",
		yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
		purple: "bg-purple-50 border-purple-200 text-purple-800",
	};

	return (
		<div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
			<div className="flex items-center justify-between mb-2">
				<span className="text-2xl">{icon}</span>
				<span className="text-2xl font-bold">{value}</span>
			</div>
			<p className="font-medium">{title}</p>
		</div>
	);
}

function DiscountCodeItem({ discountCode }: { discountCode: DiscountCode }) {
	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div
			className={`p-3 rounded border ${
				discountCode.isUsed
					? "bg-gray-50 border-gray-200"
					: "bg-green-50 border-green-200"
			}`}
		>
			<div className="flex items-center justify-between">
				<div>
					<code
						className={`font-mono text-sm ${
							discountCode.isUsed ? "text-gray-600" : "text-green-800"
						}`}
					>
						{discountCode.code}
					</code>
					<p className="text-xs text-gray-500">
						Created: {formatDate(discountCode.createdAt)}
						{discountCode.createdForOrderNumber > 0 &&
							` (Order #${discountCode.createdForOrderNumber})`}
					</p>
					{discountCode.usedAt && (
						<p className="text-xs text-gray-500">
							Used: {formatDate(discountCode.usedAt)}
						</p>
					)}
				</div>
				<span
					className={`px-2 py-1 rounded text-xs font-medium ${
						discountCode.isUsed
							? "bg-gray-200 text-gray-700"
							: "bg-green-200 text-green-800"
					}`}
				>
					{discountCode.isUsed ? "Used" : "Available"}
				</span>
			</div>
		</div>
	);
}
