"use client";

import { Product } from "@/lib/types";
import { useState } from "react";

interface ClientProductCardProps {
	product: Product;
	onAddToCart: (productId: string, quantity: number) => void;
	isLoading?: boolean;
}

export default function ClientProductCard({
	product,
	onAddToCart,
	isLoading,
}: ClientProductCardProps) {
	const handleAddToCart = () => {
		onAddToCart(product.id, 1);
	};

	return (
		<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					{product.name}
				</h3>
				<p className="text-gray-600 text-sm mb-4">{product.description}</p>

				<div className="flex items-center justify-between mb-4">
					<span className="text-2xl font-bold text-blue-600">
						${product.price.toFixed(2)}
					</span>
					<span
						className={`text-sm px-2 py-1 rounded ${
							product.stock > 0
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{product.stock > 0
							? `${product.stock} in stock`
							: "Out of stock"}
					</span>
				</div>
			</div>

			<button
				onClick={handleAddToCart}
				disabled={product.stock === 0 || isLoading}
				className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
					product.stock === 0 || isLoading
						? "bg-gray-300 text-gray-500 cursor-not-allowed"
						: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
				}`}
			>
				{isLoading
					? "Adding..."
					: product.stock === 0
					? "Out of Stock"
					: "Add to Cart"}
			</button>
		</div>
	);
}
