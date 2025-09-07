# Ecommerce Store with Discount System

This is a [Next.js](https://nextjs.org) ecommerce store with an automated discount system. Built with TypeScript, Tailwind CSS, and Playwright testing.

## Features

✅ **Complete Ecommerce API** - Products, cart, checkout, orders
✅ **Automated Discount System** - Every 3rd order gets 10% discount coupon  
✅ **Admin Dashboard** - Analytics, discount management, order tracking
✅ **Full UI Implementation** - Responsive design with cart and checkout
✅ **Comprehensive Testing** - 15 unit tests with 100% pass rate
✅ **CI/CD Pipeline** - GitHub Actions with automated testing

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Main Store**: Browse products, add to cart, checkout with discounts
- **Admin Dashboard**: Visit `/admin` for analytics and discount management

## Testing

Run the comprehensive test suite:

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode  
npm run test:watch

# View test report
npx playwright show-report
```

## CI/CD Pipeline

This project includes a complete GitHub Actions CI/CD pipeline:

- ✅ **Automated Testing** - All tests run on push/PR
- ✅ **Code Quality** - ESLint and TypeScript checks  
- ✅ **Build Validation** - Production build verification
- ✅ **Test Reports** - Detailed HTML test reports
- ✅ **Vercel Deployment** - Optional auto-deployment

See [docs/CI-CD.md](docs/CI-CD.md) for detailed pipeline documentation.

## API Documentation

### Customer APIs
- `GET /api/products` - List all products
- `POST /api/cart` - Create new cart  
- `POST /api/cart/{id}/items` - Add items to cart
- `DELETE /api/cart/{id}/items/{productId}` - Remove items
- `POST /api/checkout` - Process checkout with optional discount

### Admin APIs  
- `GET /api/admin/stats` - Get comprehensive analytics
- `POST /api/admin/discount` - Generate discount code manually
- `GET /api/discount-codes` - List available discount codes

See [docs/PRD.md](docs/PRD.md) for complete API specification.

## Project Structure

```
src/
├── app/
│   ├── api/           # Next.js API routes
│   ├── components/    # React components  
│   ├── admin/         # Admin dashboard
│   └── page.tsx       # Main store page
├── lib/
│   ├── store.ts       # In-memory data store
│   ├── types.ts       # TypeScript interfaces
│   └── utils.ts       # Helper functions
tests/
├── unit/              # Unit tests (15 tests)
└── fixtures/          # Test data and helpers
docs/                  # Documentation
```

## Documentation

- 📋 **[PRD.md](docs/PRD.md)** - Complete product requirements
- 🧪 **[TESTING.md](docs/TESTING.md)** - Testing strategy and coverage
- 🔄 **[CI-CD.md](docs/CI-CD.md)** - GitHub Actions pipeline guide
- 📝 **[assignment.md](docs/assignment.md)** - Original assignment requirements

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
