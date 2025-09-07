"use client";

import { useState } from "react";
import { Cart as CartType, CartItem, CheckoutResponse } from "@/lib/types";

interface CartProps {
	cart: CartType | null;
	onRemoveItem: (productId: string) => void;
	onCheckout: (discountCode?: string) => Promise<CheckoutResponse>;
	isLoading?: boolean;
	onContinueShopping?: () => void;
	checkoutResult?: CheckoutResponse | null;
	checkoutError?: string | null;
}

export default function Cart({
	cart,
	onRemoveItem,
	onCheckout,
	isLoading,
	onContinueShopping,
	checkoutResult,
	checkoutError,
}: CartProps) {
	const [discountCode, setDiscountCode] = useState("");
	const [isCheckingOut, setIsCheckingOut] = useState(false);

	// Debug logging
	console.log("Cart component render - cart state:", cart);
	console.log("Cart component render - checkoutResult:", checkoutResult);

	// Declare functions before any conditional rendering
	const handleCheckout = async () => {
		setIsCheckingOut(true);

		try {
			await onCheckout(discountCode || undefined);
			console.log("Checkout successful");
		} catch (error) {
			console.error("Checkout failed:", error);
			// Error handling is now managed by parent component
		} finally {
			setIsCheckingOut(false);
		}
	};

	const handleContinueShopping = () => {
		console.log("Continue shopping clicked");
		setDiscountCode("");

		// Call parent's continue shopping handler if provided
		if (onContinueShopping) {
			onContinueShopping();
		}
	};

	// Check for checkout result first, before any other conditions
	if (checkoutResult) {
		return (
			<div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6">
				<div className="text-center">
					<div className="mb-6">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-green-800 mb-2">
							🎉 Order Confirmed!
						</h2>
						<p className="text-gray-600 mb-2">
							Thank you for your purchase! Your order has been
							successfully processed.
						</p>
						<div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
							<p className="text-green-800 font-semibold">
								Order #{checkoutResult.order.orderNumber}
							</p>
							<p className="text-green-600 text-sm">
								{new Date(
									checkoutResult.order.createdAt
								).toLocaleString()}
							</p>
						</div>
					</div>

					{/* Order Details Section */}
					<div className="bg-gray-50 rounded-lg p-4 mb-4">
						<h3 className="font-semibold text-gray-800 mb-3">
							📦 Order Details
						</h3>

						{/* Item List */}
						<div className="mb-4">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Items Purchased:
							</h4>
							<div className="space-y-2">
								{checkoutResult.order.items.map((item, index) => (
									<div
										key={index}
										className="flex justify-between items-center text-sm bg-white rounded p-2"
									>
										<span className="font-medium">
											Product {item.productId}
										</span>
										<div className="text-right">
											<span className="text-gray-600">
												${item.price.toFixed(2)} × {item.quantity}
											</span>
											<div className="font-medium">
												${(item.price * item.quantity).toFixed(2)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Price Summary */}
						<div className="border-t pt-3">
							<div className="flex justify-between items-center mb-2">
								<span>Subtotal:</span>
								<span>${checkoutResult.order.subtotal.toFixed(2)}</span>
							</div>
							{checkoutResult.order.discountAmount > 0 && (
								<div className="flex justify-between items-center mb-2 text-green-600">
									<span>
										Discount ({checkoutResult.order.discountCode}):
									</span>
									<span>
										-${checkoutResult.order.discountAmount.toFixed(2)}
									</span>
								</div>
							)}
							<div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
								<span>Total Paid:</span>
								<span className="text-green-600">
									${checkoutResult.order.total.toFixed(2)}
								</span>
							</div>
						</div>

						{/* Order Info */}
						<div className="mt-4 pt-3 border-t text-sm text-gray-600">
							<div className="grid grid-cols-2 gap-2">
								<div>
									<span className="font-medium">Order ID:</span>
									<div className="font-mono text-xs">
										{checkoutResult.order.id}
									</div>
								</div>
								<div>
									<span className="font-medium">Order Date:</span>
									<div>
										{new Date(
											checkoutResult.order.createdAt
										).toLocaleDateString()}
									</div>
								</div>
							</div>
						</div>
					</div>

					{checkoutResult.newDiscountCode && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
							<h3 className="font-semibold text-blue-800 mb-2">
								🎉 Congratulations!
							</h3>
							<p className="text-blue-700 mb-2">
								You&apos;ve earned a discount code for your next order:
							</p>
							<div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-3">
								<code className="text-lg font-mono text-blue-800">
									{checkoutResult.newDiscountCode.code}
								</code>
							</div>
							<p className="text-sm text-blue-600 mt-2">
								Save 10% on your next order!
							</p>
						</div>
					)}

					<button
						onClick={handleContinueShopping}
						className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
					>
						Continue Shopping
					</button>
				</div>
			</div>
		);
	}

	if (!cart) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4">Your Cart</h2>
				<p className="text-gray-500">Loading cart...</p>
			</div>
		);
	}

	if (!cart.items || cart.items.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4">Your Cart</h2>
				<p className="text-gray-500">Your cart is empty</p>
				<p className="text-xs text-gray-400 mt-2">Cart ID: {cart.id}</p>
			</div>
		);
	}

	const subtotal = cart.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-semibold mb-4">
				Your Cart ({cart.items.length} items)
			</h2>

			<div className="space-y-4 mb-6">
				{cart.items.map((item) => (
					<CartItemRow
						key={item.productId}
						item={item}
						onRemove={() => onRemoveItem(item.productId)}
					/>
				))}
			</div>

			<div className="border-t pt-4">
				<div className="mb-4">
					<label
						htmlFor="discountCode"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Discount Code (Optional)
					</label>
					<input
						type="text"
						id="discountCode"
						value={discountCode}
						onChange={(e) => {
							setDiscountCode(e.target.value.toUpperCase());
						}}
						placeholder="Enter discount code"
						className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
							checkoutError
								? "border-red-300 focus:ring-red-500"
								: "border-gray-300 focus:ring-blue-500"
						}`}
					/>
				</div>

				<div className="bg-gray-50 rounded-lg p-4 mb-4">
					<div className="flex justify-between items-center font-semibold text-lg">
						<span>Subtotal:</span>
						<span>${subtotal.toFixed(2)}</span>
					</div>
				</div>

				{checkoutError && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
						<div className="flex items-center">
							<svg
								className="w-5 h-5 text-red-500 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="text-red-800 text-sm">{checkoutError}</p>
						</div>
					</div>
				)}

				<button
					onClick={handleCheckout}
					disabled={isCheckingOut || isLoading}
					className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
						isCheckingOut || isLoading
							? "bg-gray-300 text-gray-500 cursor-not-allowed"
							: "bg-green-600 text-white hover:bg-green-700"
					}`}
				>
					{isCheckingOut ? "Processing..." : "Checkout"}
				</button>
			</div>
		</div>
	);
}

function CartItemRow({
	item,
	onRemove,
}: {
	item: CartItem;
	onRemove: () => void;
}) {
	return (
		<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
			<div className="flex-1">
				<h4 className="font-medium">Product ID: {item.productId}</h4>
				<p className="text-sm text-gray-600">
					${item.price.toFixed(2)} × {item.quantity} = $
					{(item.price * item.quantity).toFixed(2)}
				</p>
			</div>
			<button
				onClick={onRemove}
				className="text-red-600 hover:text-red-800 p-2"
				title="Remove item"
			>
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</button>
		</div>
	);
}
