# Product Requirements Document (PRD)

## Ecommerce Store with Discount System

### 1. Project Overview

#### Assignment Requirements

Build an ecommerce store where clients can:

- Add items to cart and checkout to place orders
- Every *nth* order gets a 10% discount coupon
- Apply discount codes during checkout

#### Core Features

- **Customer APIs**: Add to cart, checkout with discount validation
- **Admin APIs**: Generate discount codes, view analytics
- **UI**: Showcase functionality (stretch goal)
- **Storage**: In-memory store (no persistent database required)

#### Success Criteria

- Functional code with proper discount logic
- Clean API design and implementation
- Working UI demonstrating the flow
- Comprehensive unit tests
- Quality documentation

#### Evaluation Criteria

1. Functional code ✅
2. Code quality ✅
3. UI framework implementation ✅
4. Code comments & README docs ✅
5. Unit tests ✅

### 2. Technical Architecture

#### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **API**: Next.js API Routes
- **Storage**: In-memory JavaScript objects

#### Project Structure

``` bash
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── products/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── store.ts          # In-memory data store
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   └── utils.ts          # Helper functions
│   │   └── page.tsx              # Main store UI
├── docs/
├── __tests__/
└── README.md
```

#### In-Memory Data Store Design

- **Global store object** with collections for products, carts, orders, discounts
- **Atomic operations** for data consistency
- **Simple UUID generation** for IDs

### 3. Data Models & Interfaces

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Snapshot at add time
}

interface Cart {
  id: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  orderNumber: number; // Sequential order number for nth logic
  cartId: string;
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  createdAt: Date;
}

interface DiscountCode {
  code: string;
  discount: number; // 0.1 for 10%
  isUsed: boolean;
  createdForOrderNumber: number;
  createdAt: Date;
  usedAt?: Date;
}

interface Store {
  products: Map<string, Product>;
  carts: Map<string, Cart>;
  orders: Map<string, Order>;
  discountCodes: Map<string, DiscountCode>;
  orderCounter: number;
}
```

### 4. API Specification

#### Customer APIs

##### GET /api/products

**Purpose**: List all available products
**Response**:

```json
{
  "products": [
    {
      "id": "prod_001",
      "name": "iPhone 15",
      "price": 999,
      "description": "Latest iPhone model",
      "stock": 50
    }
  ]
}
```

##### POST /api/cart

**Purpose**: Create a new cart
**Response**:

```json
{
  "cartId": "cart_uuid",
  "items": [],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

##### POST /api/cart/[cartId]/items

**Purpose**: Add item to cart
**Request**:

```json
{
  "productId": "prod_001",
  "quantity": 2
}
```

**Response**:

```json
{
  "cart": {
    "id": "cart_uuid",
    "items": [
      {
        "productId": "prod_001",
        "quantity": 2,
        "price": 999
      }
    ],
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

##### DELETE /api/cart/[cartId]/items/[productId]

**Purpose**: Remove item from cart
**Response**: Updated cart object

##### GET /api/cart/[cartId]

**Purpose**: Get cart details
**Response**: Cart object with items

##### POST /api/checkout

**Purpose**: Process checkout and create order
**Request**:

```json
{
  "cartId": "cart_uuid",
  "discountCode": "SAVE10_001" // Optional
}
```

**Response**:

```json
{
  "order": {
    "id": "order_uuid",
    "orderNumber": 15,
    "subtotal": 1998,
    "discountAmount": 199.8,
    "total": 1798.2,
    "discountCode": "SAVE10_001"
  },
  "newDiscountCode": "SAVE10_002" // If this was nth order
}
```

#### Admin APIs

##### GET /api/admin/stats

**Purpose**: Get comprehensive analytics
**Response**:

```json
{
  "totalOrders": 45,
  "totalItemsPurchased": 123,
  "totalRevenue": 25670,
  "totalDiscountAmount": 2567,
  "discountCodes": [
    {
      "code": "SAVE10_001",
      "isUsed": true,
      "createdForOrderNumber": 10,
      "usedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "unusedDiscountCodes": 3
}
```

##### POST /api/admin/discount

**Purpose**: Manually generate discount code (for testing)
**Request**:

```json
{
  "forceGenerate": true // Admin override
}
```

**Response**:

```json
{
  "discountCode": {
    "code": "SAVE10_003",
    "discount": 0.1,
    "createdForOrderNumber": 0
  }
}
```

#### Error Handling

All APIs return consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:

- 200: Success
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error

### 5. Business Logic

#### nth Order Discount Logic

- **Default n = 3** (configurable)
- **Sequential order numbering** starting from 1
- **Automatic discount generation** when order number % n === 0
- **One-time use** discount codes
- **10% discount** applies to entire order total

#### Cart Operations

- **Add items**: Validate product exists, update quantity if item already in cart
- **Remove items**: Remove completely from cart
- **Cart persistence**: No expiration, carts persist in memory
- **Price snapshots**: Capture product price when added to cart

#### Checkout Validation

1. Validate cart exists and has items
2. Validate discount code (if provided)
3. Calculate totals
4. Create order with sequential number
5. Generate new discount if nth order
6. Clear cart after successful checkout

### 6. UI Components & Flow

#### Page Structure

- **Home Page** (`/`): Product catalog + cart summary
- **Cart Page** (`/cart`): Cart details + checkout
- **Admin Page** (`/admin`): Analytics dashboard

#### Component Hierarchy

```
App
├── ProductCatalog
│   └── ProductCard
├── Cart
│   ├── CartItem
│   └── CheckoutForm
├── AdminDashboard
│   ├── StatsCard
│   └── DiscountCodeList
└── Layout
    ├── Header
    └── Footer
```

#### User Journey Flows

1. **Shopping Flow**: Browse → Add to Cart → Checkout
2. **Discount Flow**: Checkout → Apply Code → Complete Order
3. **Admin Flow**: View Stats → Generate Codes → Monitor Usage

### 7. Sample Data

#### Hard-coded Products

```typescript
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'iPhone 15 Pro',
    price: 999,
    description: 'Latest iPhone with advanced camera',
    stock: 25
  },
  {
    id: 'prod_002',
    name: 'MacBook Air M3',
    price: 1299,
    description: '13-inch laptop with M3 chip',
    stock: 15
  },
  {
    id: 'prod_003',
    name: 'AirPods Pro',
    price: 249,
    description: 'Noise cancelling wireless earbuds',
    stock: 50
  },
  {
    id: 'prod_004',
    name: 'Apple Watch Series 9',
    price: 399,
    description: 'Advanced smartwatch with health features',
    stock: 30
  },
  {
    id: 'prod_005',
    name: 'iPad Pro 11"',
    price: 799,
    description: 'Professional tablet with M2 chip',
    stock: 20
  }
];
```

### 8. Implementation Plan

#### Phase 1: Core Backend (Priority: High)

1. Set up Next.js project with TypeScript
2. Create in-memory data store
3. Implement product APIs
4. Implement cart APIs
5. Implement checkout with discount logic

#### Phase 2: Admin Features (Priority: High)

1. Implement admin stats API
2. Implement discount generation API
3. Add comprehensive error handling

#### Phase 3: Frontend UI (Priority: Medium)

1. Create product catalog page
2. Build cart functionality
3. Implement checkout flow
4. Build admin dashboard

#### Phase 4: Testing & Documentation (Priority: Medium)

1. Write unit tests for all APIs
2. Add integration tests
3. Create comprehensive README
4. Add API documentation

#### Phase 5: Polish & Deploy (Priority: Low)

1. Add loading states and error handling in UI
2. Improve styling and UX
3. Add form validation
4. Deploy to Vercel

### 9. Configuration

#### Environment Variables

```
# Application settings
NEXT_PUBLIC_DISCOUNT_EVERY_N_ORDERS=3
NEXT_PUBLIC_DISCOUNT_PERCENTAGE=10

# Development
NODE_ENV=development
```

#### Key Configuration

- **Discount frequency**: Every 3rd order (configurable)
- **Discount amount**: 10% (configurable)
- **Cart expiration**: None
- **Order numbering**: Sequential starting from 1

### 10. Testing Strategy

#### Unit Tests

- All API endpoints
- Business logic functions
- Data store operations
- Discount calculation logic

#### Integration Tests

- Complete checkout flow
- nth order discount generation
- Admin analytics accuracy

#### Test Scenarios

1. **Happy Path**: Add items → Checkout → Apply discount
2. **Edge Cases**: Empty cart, invalid discount codes, out of stock
3. **nth Order Logic**: Verify discount generation on exactly nth orders
4. **Admin Features**: Stats accuracy, manual discount generation

### 11. Success Metrics

#### Functional Requirements ✅

- [ ] Add items to cart
- [ ] Remove items from cart
- [ ] Checkout process
- [ ] Discount code validation
- [ ] nth order discount generation
- [ ] Admin analytics

#### Quality Requirements ✅

- [ ] TypeScript interfaces
- [ ] Error handling
- [ ] Input validation
- [ ] Unit test coverage >80%
- [ ] Clean, readable code
- [ ] Comprehensive documentation

---

This PRD serves as the complete specification for implementing the ecommerce store with discount system. All development should follow this document to ensure requirements are met and evaluation criteria are satisfied.
