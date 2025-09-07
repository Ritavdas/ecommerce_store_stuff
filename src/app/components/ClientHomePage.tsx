"use client";

import { useState, useEffect } from "react";
import { Product, Cart as CartType, CheckoutResponse } from "@/lib/types";
import Cart from "./Cart";
import ClientProductCard from "./ClientProductCard";
import DiscountBanner from "./DiscountBanner";

interface ClientHomePageProps {
	initialProducts: Product[];
}

export default function ClientHomePage({
	initialProducts,
}: ClientHomePageProps) {
	const [cart, setCart] = useState<CartType | null>(null);
	const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());
	const [error, setError] = useState<string | null>(null);
	const [discountRefreshTrigger, setDiscountRefreshTrigger] = useState(0);

	useEffect(() => {
		createCart();
	}, []);

	const createCart = async () => {
		try {
			console.log("Creating cart...");
			const response = await fetch("/api/cart", { method: "POST" });
			const data = await response.json();
			console.log("Create cart response:", data);

			if (data.data) {
				setCart(data.data);
				console.log("Cart created successfully:", data.data);
				setError(null); // Clear any previous errors
				return data.data;
			} else {
				console.error("No cart data in response:", data);
				const errorMsg = "Failed to create cart - no data returned";
				setError(errorMsg);
				throw new Error(errorMsg);
			}
		} catch (error) {
			console.error("Failed to create cart:", error);
			const errorMsg = error instanceof Error ? error.message : "Failed to create cart";
			setError(errorMsg);
			throw error;
		}
	};

	const addToCart = async (productId: string, quantity: number) => {
		if (!cart) {
			console.error("No cart available for adding items");
			return;
		}

		console.log(`Adding to cart: productId=${productId}, quantity=${quantity}, cartId=${cart.id}`);

		// Set loading state for this specific product
		setLoadingProducts(prev => new Set(prev).add(productId));

		try {
			const requestBody = { productId, quantity };
			console.log("Add to cart request body:", requestBody);

			const response = await fetch(`/api/cart/${cart.id}/items`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			console.log("Add to cart response status:", response.status);
			const data = await response.json();
			console.log("Add to cart response data:", data);

			if (data.data) {
				setCart(data.data);
				console.log("Cart updated successfully:", data.data);
				setError(null); // Clear any previous errors
			} else if (data.error) {
				console.error("API returned error:", data.error);
				setError(data.error);
			} else {
				console.error("Unexpected response format:", data);
				setError("Unexpected response from server");
			}
		} catch (error) {
			console.error("Failed to add to cart:", error);
			setError("Failed to add item to cart");
		} finally {
			// Remove loading state for this specific product
			setLoadingProducts(prev => {
				const newSet = new Set(prev);
				newSet.delete(productId);
				return newSet;
			});
		}
	};

	const removeFromCart = async (productId: string) => {
		if (!cart) return;

		console.log(`Removing from cart: productId=${productId}, cartId=${cart.id}`);
		
		try {
			const response = await fetch(
				`/api/cart/${cart.id}/items/${productId}`,
				{
					method: "DELETE",
				}
			);

			console.log("Remove from cart response status:", response.status);
			const data = await response.json();
			console.log("Remove from cart response data:", data);

			if (data.data) {
				setCart(data.data);
				console.log("Item removed, cart updated:", data.data);
				setError(null);
			} else if (data.error) {
				console.error("API returned error:", data.error);
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

		console.log("Starting checkout process for cart:", cart.id);

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

		console.log("Checkout successful, creating new cart...");

		// Clear current cart immediately to prevent further operations
		setCart(null);

		// Create new cart for future purchases
		try {
			await createCart();
			console.log("New cart created successfully after checkout");
		} catch (error) {
			console.error("Failed to create new cart after checkout:", error);
			// Don't throw here as checkout was successful
		}

		// Trigger discount banner refresh after checkout
		setDiscountRefreshTrigger(prev => prev + 1);

		return data.data;
	};

	const handleContinueShopping = async () => {
		console.log("Continue shopping requested, ensuring cart is available");

		// If no cart exists, create one
		if (!cart) {
			try {
				await createCart();
				console.log("New cart created for continued shopping");
			} catch (error) {
				console.error("Failed to create cart for continued shopping:", error);
				setError("Failed to create cart. Please refresh the page.");
			}
		}
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
			{/* Discount Banner - spans full width */}
			<div className="lg:col-span-3 mb-6">
				<DiscountBanner refreshTrigger={discountRefreshTrigger} />
			</div>

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
								isLoading={loadingProducts.has(product.id)}
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
					isLoading={loadingProducts.size > 0}
					onContinueShopping={handleContinueShopping}
				/>
			</div>
		</>
	);
}
