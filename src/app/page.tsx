import { getProducts } from "@/lib/store";
import ClientHomePage from "./components/ClientHomePage";

// Server Component - fetches data at build time/request time
export default async function Home() {
	// Fetch products on the server side for optimal performance
	const products = getProducts();

	return (
		<div className="min-h-screen bg-gray-100">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">
							🛒 Apple Store
						</h1>
						<nav className="flex space-x-4">
							<a
								href="/admin"
								className="text-blue-600 hover:text-blue-800 font-medium"
							>
								Admin Dashboard
							</a>
						</nav>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<ClientHomePage initialProducts={products} />
				</div>
			</main>
		</div>
	);
}
