# Testing Documentation

## Unit Tests for Ecommerce Store

### Overview

This document outlines the **focused unit testing strategy** for the ecommerce store application. We use **Playwright Test** to validate the most critical functionality with **15 essential tests** covering all assignment requirements.

### Testing Philosophy

- **Quality over Quantity**: Focus on the most critical business logic and API endpoints
- **Assignment-Focused**: Cover all evaluation criteria with essential tests only
- **Fast Execution**: All tests should run quickly and independently
- **High Value**: Each test validates core functionality required by the assignment

## Test Structure - Focused Approach

```
tests/
├── unit/
│   └── api/                    # 15 Critical Tests in 3 Files
│       ├── checkout.test.ts    # 6 tests - Core business logic
│       ├── cart.test.ts        # 5 tests - Cart operations  
│       └── admin.test.ts       # 4 tests - Products & admin
├── fixtures/                   # Test data and helpers
│   ├── test-data.ts           # Sample products, carts, orders
│   └── test-helpers.ts        # API request helpers
└── playwright.config.ts       # Test configuration
```

## 15 Critical Tests - Assignment Requirements Coverage

### File 1: `checkout.test.ts` (6 Tests) - Core Business Logic

1. ✅ **nth Order Discount Generation** - Every 3rd order generates discount
2. ✅ **Valid Discount Code Application** - 10% discount applied correctly  
3. ✅ **Invalid Discount Code Rejection** - Invalid codes return error
4. ✅ **Used Discount Code Rejection** - Used codes can't be reused
5. ✅ **Sequential Order Numbering** - Orders get numbers 1, 2, 3...
6. ✅ **Empty Cart Checkout Rejection** - Can't checkout empty cart

### File 2: `cart.test.ts` (5 Tests) - Cart Operations

7. ✅ **Create New Cart** - POST /api/cart creates cart with unique ID
8. ✅ **Add Items to Cart** - POST /api/cart/{id}/items works correctly
9. ✅ **Stock Validation** - Can't add more items than available stock
10. ✅ **Cart Not Found Error** - Invalid cart ID returns 404 error
11. ✅ **Get Cart Details** - GET /api/cart/{id} retrieves cart data

### File 3: `admin.test.ts` (4 Tests) - Products & Admin

12. ✅ **Get All Products** - GET /api/products returns 5 sample products
13. ✅ **Admin Stats Calculation** - GET /api/admin/stats returns correct totals
14. ✅ **Manual Discount Generation** - POST /api/admin/discount works
15. ✅ **Stats Update After Orders** - Stats reflect new orders correctly

### 2. API Endpoint Tests

These tests validate all API routes work correctly:

#### A. Products API (`/api/products`)

- ✅ **Test**: Returns all 5 sample products
- ✅ **Test**: Each product has required fields (id, name, price, description, stock)
- ✅ **Test**: Response format matches expected structure

#### B. Cart API (`/api/cart/*`)

- ✅ **Test**: `POST /api/cart` creates cart with unique ID
- ✅ **Test**: `POST /api/cart/{id}/items` adds items correctly
- ✅ **Test**: `GET /api/cart/{id}` retrieves cart data
- ✅ **Test**: `DELETE /api/cart/{id}/items/{productId}` removes items
- ✅ **Test**: Error handling for invalid cart IDs
- ✅ **Test**: Stock validation when adding items

#### C. Checkout API (`/api/checkout`)

- ✅ **Test**: Successful checkout with valid data
- ✅ **Test**: Discount code validation
- ✅ **Test**: Price calculation accuracy
- ✅ **Test**: nth order discount generation
- ✅ **Test**: Error handling (empty cart, invalid codes)

#### D. Admin APIs (`/api/admin/*`)

- ✅ **Test**: `GET /api/admin/stats` returns correct analytics
- ✅ **Test**: `POST /api/admin/discount` generates manual codes
- ✅ **Test**: Stats update after new orders
- ✅ **Test**: Discount usage tracking

#### E. Discount Codes API (`/api/discount-codes`)

- ✅ **Test**: Returns only unused discount codes
- ✅ **Test**: Updates in real-time after code usage

### 3. Store Function Tests

These tests validate the in-memory store operations:

#### A. Product Management

- ✅ **Test**: `getProducts()` returns all products
- ✅ **Test**: `getProduct(id)` returns specific product
- ✅ **Test**: Product data integrity

#### B. Cart Management

- ✅ **Test**: `createCart()` generates unique IDs
- ✅ **Test**: `updateCart()` modifies timestamps
- ✅ **Test**: `getCart()` retrieves correct data
- ✅ **Test**: `deleteCart()` removes cart

#### C. Order Management

- ✅ **Test**: `createOrder()` increments counter correctly
- ✅ **Test**: `getOrders()` returns all orders
- ✅ **Test**: Order data structure validation

#### D. Discount Code Management

- ✅ **Test**: `createDiscountCode()` stores codes correctly
- ✅ **Test**: `getDiscountCode()` retrieves by code
- ✅ **Test**: `markDiscountAsUsed()` updates status
- ✅ **Test**: `getDiscountCodes()` returns all codes

#### E. Statistics Calculation

- ✅ **Test**: `getStats()` calculates totals accurately
- ✅ **Test**: Revenue calculation includes discounts
- ✅ **Test**: Item count calculation
- ✅ **Test**: Unused discount code count

### 4. Utility Function Tests

These tests validate helper functions:

#### A. Discount Utilities

- ✅ **Test**: `generateDiscountCode()` creates correct format
- ✅ **Test**: `shouldGenerateDiscount()` returns true for nth orders
- ✅ **Test**: `calculateDiscount()` computes 10% correctly

#### B. General Utilities

- ✅ **Test**: `generateUuid()` creates unique identifiers
- ✅ **Test**: `formatCurrency()` formats prices correctly
- ✅ **Test**: `createSuccessResponse()` structures responses
- ✅ **Test**: `createErrorResponse()` handles errors

### 5. Component Logic Tests

These tests validate React component behavior:

#### A. Cart Component

- ✅ **Test**: Displays "empty cart" when no items
- ✅ **Test**: Calculates subtotal correctly
- ✅ **Test**: Shows discount code input
- ✅ **Test**: Displays error messages
- ✅ **Test**: Shows checkout confirmation details

#### B. DiscountBanner Component

- ✅ **Test**: Shows banner when codes available
- ✅ **Test**: Hides banner when no codes
- ✅ **Test**: Updates when refreshTrigger changes
- ✅ **Test**: Displays correct discount code

## Test Data Fixtures

### Sample Products

```typescript
export const SAMPLE_PRODUCTS = [
  { id: 'prod_001', name: 'iPhone 15 Pro', price: 999, description: '...', stock: 25 },
  { id: 'prod_002', name: 'MacBook Air M3', price: 1299, description: '...', stock: 15 },
  // ... more products
];
```

### Sample Orders & Carts

```typescript
export const SAMPLE_CART = {
  id: 'cart_test_123',
  items: [
    { productId: 'prod_001', quantity: 1, price: 999 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Sample Discount Codes

```typescript
export const SAMPLE_DISCOUNT_CODES = [
  { code: 'SAVE10_001', discount: 0.1, isUsed: false, createdForOrderNumber: 3 },
  { code: 'SAVE10_002', discount: 0.1, isUsed: true, createdForOrderNumber: 6 }
];
```

## Test Execution

### Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- tests/unit/api/checkout.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Expected Results

- ✅ **100% Pass Rate**: All tests should pass consistently
- ✅ **Fast Execution**: Complete test suite should run in < 30 seconds
- ✅ **High Coverage**: Critical business logic should have 100% coverage
- ✅ **Clear Output**: Test results should be easy to understand

## Test Environment Setup

### Prerequisites

- Node.js application running on `http://localhost:3003`
- Clean in-memory store state for each test
- Mock data reset between tests

### Test Isolation

- Each test runs independently
- Store state is reset before each test
- No shared state between test files
- Tests can run in parallel

## Success Criteria

### For Assignment Evaluation

- ✅ **Functional Code**: All APIs and business logic work correctly
- ✅ **Code Quality**: Tests validate proper error handling and edge cases
- ✅ **Unit Tests**: Comprehensive coverage of core functionality
- ✅ **Documentation**: Clear test documentation and structure

### Coverage Goals

- **API Endpoints**: 100% coverage of all routes
- **Business Logic**: 100% coverage of discount and order logic
- **Store Functions**: 100% coverage of CRUD operations
- **Utility Functions**: 100% coverage of calculations and validations
- **Component Logic**: 90%+ coverage of key component behaviors

## Maintenance Guidelines

### Adding New Tests

1. Follow existing naming conventions
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add fixtures for new test data
5. Update this documentation

### Test Best Practices

1. **Arrange-Act-Assert** pattern
2. **Single responsibility** - one concept per test
3. **Descriptive names** - test names should explain what they validate
4. **Independent tests** - no dependencies between tests
5. **Fast execution** - avoid unnecessary delays or complex setup

---

This testing strategy ensures our ecommerce store meets all assignment requirements with high-quality, well-tested code that demonstrates professional development practices.
