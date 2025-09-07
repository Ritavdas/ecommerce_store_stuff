"use client";

import { useState, useEffect } from "react";
import { Product, Cart as CartType, CheckoutResponse } from "@/lib/types";
import Cart from "./Cart";
import ClientProductCard from "./ClientProductCard";

interface ClientHomePageProps {
	initialProducts: Product[];
}

export default function ClientHomePage({
	initialProducts,
}: ClientHomePageProps) {
	const [cart, setCart] = useState<CartType | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		createCart();
	}, []);

	const createCart = async () => {
		try {
			const response = await fetch("/api/cart", { method: "POST" });
			const data = await response.json();
			if (data.data) {
				setCart(data.data);
			}
		} catch (error) {
			console.error("Failed to create cart:", error);
			setError("Failed to create cart");
		}
	};

	const addToCart = async (productId: string, quantity: number) => {
		if (!cart) return;

		setIsLoading(true);
		try {
			const response = await fetch(`/api/cart/${cart.id}/items`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productId, quantity }),
			});

			const data = await response.json();
			if (data.data) {
				setCart(data.data);
			} else if (data.error) {
				setError(data.error);
			}
		} catch (error) {
			console.error("Failed to add to cart:", error);
			setError("Failed to add item to cart");
		} finally {
			setIsLoading(false);
		}
	};

	const removeFromCart = async (productId: string) => {
		if (!cart) return;

		try {
			const response = await fetch(
				`/api/cart/${cart.id}/items/${productId}`,
				{
					method: "DELETE",
				}
			);

			const data = await response.json();
			if (data.data) {
				setCart(data.data);
			} else if (data.error) {
				setError(data.error);
			}
		} catch (error) {
			console.error("Failed to remove from cart:", error);
			setError("Failed to remove item from cart");
		}
	};

	const handleCheckout = async (
		discountCode?: string
	): Promise<CheckoutResponse> => {
		if (!cart) throw new Error("No cart available");

		const response = await fetch("/api/checkout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				cartId: cart.id,
				discountCode,
			}),
		});

		const data = await response.json();
		if (data.error) {
			throw new Error(data.error);
		}

		createCart();
		return data.data;
	};

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-800">{error}</p>
				<button
					onClick={() => {
						setError(null);
						createCart();
					}}
					className="mt-2 text-red-600 hover:text-red-800 underline"
				>
					Try again
				</button>
			</div>
		);
	}

	return (
		<>
			{/* Products Section - spans 2 columns on large screens */}
			<div className="lg:col-span-2">
				<h2 className="text-xl font-semibold mb-6">Products</h2>
				{initialProducts.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500">No products available</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{initialProducts.map((product) => (
							<ClientProductCard
								key={product.id}
								product={product}
								onAddToCart={addToCart}
								isLoading={isLoading}
							/>
						))}
					</div>
				)}
			</div>

			{/* Cart Section - spans 1 column on large screens */}
			<div className="lg:col-span-1">
				<Cart
					cart={cart}
					onRemoveItem={removeFromCart}
					onCheckout={handleCheckout}
					isLoading={isLoading}
				/>
			</div>
		</>
	);
}
