<!-- Xenofy - By Yashas Yadav -->
# Xenofy

## Multi-Tenant Shopify Analytics Platform

Xenofy is a comprehensive Shopify data ingestion and analytics service designed for multi-tenant deployments. It provides secure data isolation, real-time analytics dashboards, and automated reporting for e-commerce businesses.

**Status**: Production Ready | **License**: MIT | **Node.js**: 18+ Required

## Architecture Overview

```
                    ┌─────────────────┐
                    │   Shopify Store │
                    │                 │
                    │ • Customers     │
                    │ • Orders        │
                    │ • Products      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Webhook Events  │
                    │ (Shopify API)   │
                    └─────────────────┘
                             │
                             ▼
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────│     Backend      │────│    Database     │
│   (Next.js)     │    │   (Express.js)   │    │  (PostgreSQL)   │
│                 │    │                  │    │                 │
│ • React Dashboard│   │ • API Routes     │    │ • Users         │
│ • Analytics UI  │    │ • JWT Auth       │    │ • Tenants       │
│ • Charts        │    │ • Shopify API    │    │ • Customers     │
│ • Real-time Data│    │ • Data Processing│    │ • Orders        │
└─────────────────┘    └─────────────────┘     └─────────────────┘
        │                     │                        │
        └─────────────────────┴────────────────────────┘
                                 │
               ┌─────────────────┐    ┌─────────────────┐
               │   Vercel        │    │    Render       │
               │ (Frontend)      │    │ (Backend + DB)  │
               └─────────────────┘    └─────────────────┘
                        │                     │
                        └─────────────────────┘
                              GitHub Actions
                              (CI/CD Pipeline)
```

## Features

- **Multi-tenant Architecture**: Secure data isolation using tenant-specific API keys
- **Real-time Shop Insights**: Live data extraction from Shopify stores
- **Advanced Analytics**: Customer segmentation, CLV analysis, and business intelligence
- **Automated Data Sync**: Scheduled webhooks and ingestion services
- **Modern Tech Stack**: Next.js frontend with Express.js backend and PostgreSQL
- **Deployment Ready**: Pre-configured for Vercel, Render, and GitHub

## Project Structure

```
xenofy/
├── backend/                 # Express.js API server
│   ├── controllers/         # API route handlers (auth, data, ingestion)
│   ├── prisma/             # Database schema and migrations
│   ├── services/           # Business logic (Shopify API, scheduler)
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/                # Next.js dashboard application
│   ├── src/app/            # Next.js App Router pages
│   ├── .env.local          # Frontend environment variables
│   └── package.json
├── DEPLOYMENT.md           # Detailed deployment instructions
├── render.yaml             # Render deployment configuration
├── vercel.json             # Vercel deployment configuration
├── .gitignore             # Git ignore patterns
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- GitHub account
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashas004/xenofy.git
   cd xenofy
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend && npm install && cd ..

   # Frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Configure environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Update values with your database URL and others

4. **Set up database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   cd ..
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```
   

## Deploy to GitHub

### Initial Setup

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Xenofy Multi-Tenant Shopify Analytics"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Run linting and tests
   - Build both frontend and backend
   - Report any issues

## Deploy Frontend to Vercel

### Method 1: Automatic (Recommended)

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your `xenofy` repository

2. **Configure Build Settings**
   ```json
   {
     "name": "xenofy-frontend",
     "version": 2,
     "builds": [{"src": "frontend/package.json", "use": "@vercel/next"}],
     "routes": [{"src": "/(.*)", "dest": "/frontend/$1"}],
     "installCommand": "npm install",
     "buildCommand": "cd frontend && npm run build",
     "outputDirectory": "frontend/.next",
     "env": {"NEXT_PUBLIC_BACKEND_URL": "@next_public_backend_url"}
   }
   ```

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://xenofy-backend.onrender.com
   ```

4. **Deploy**: Vercel handles build and deployment automatically

### Method 2: Manual

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy manually
vercel --prod
```

## Deploy Backend to Render

### Method 1: Automatic with Blueprints

1. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New Blueprint"
   - Import your repository

2. **Automatically configure services from `render.yaml`**
   ```
   - Web Service: xenofy-backend (Node.js)
   - PostgreSQL: xenofy-postgres (Database)
   ```

### Method 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → "New" → "PostgreSQL"
   - Name: `xenofy-postgres`
   - Choose your plan (Starter recommended)

2. **Create Web Service**
   - "New" → "Web Service"
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command:
     ```bash
     npm install && npx prisma generate && npx prisma db push --force-build
     ```
   - Start Command:
     ```bash
     npm start
     ```

3. **Set Environment Variables**
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_secure_jwt_secret
   SHOPIFY_API_VERSION=2023-10
   FRONTEND_URL=https://xenofy-frontend.vercel.app
   NODE_ENV=production
   ```

### Database Setup

```bash
# Login to Render CLI
render dlx login

# Push database schema
cd backend
render dlx prisma db push
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication
JWT_SECRET=your_super_secure_secret_minimum_32_chars

# Shopify Integration
SHOPIFY_API_VERSION=2023-10

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=https://xenofy-frontend.vercel.app
```

### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://xenofy-backend.onrender.com
```

### Production Environment Variables

#### Render (Backend):
```
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your_super_secure_secret_minimum_32_chars
SHOPIFY_API_VERSION=2023-10
FRONTEND_URL=https://xenofy-frontend.vercel.app
NODE_ENV=production
```

#### Vercel (Frontend):
```
NEXT_PUBLIC_BACKEND_URL=https://xenofy-backend.onrender.com
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/register` | Registers new tenant | `{ email, password, name, domain, apiKey }` | `{ token, user, tenant }` |
| POST | `/auth/login` | Authenticates tenant | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Returns current user info | - | `{ user, tenant }` |
| POST | `/auth/logout` | Logs out user | - | `{ message: 'Logged out' }` |

### Data Retrieval Endpoints

| Method | Endpoint | Description | Headers | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/data/dashboard` | Aggregated dashboard data | `Authorization: Bearer <token>` | `{ customers, orders, products }` |
| GET | `/api/data/customers/stats` | Customer statistics | `Authorization: Bearer <token>` | `{ totalCustomers, newCustomersThisMonth, customersByEmail }` |
| GET | `/api/data/orders/stats` | Order statistics | `Authorization: Bearer <token>` | `{ totalOrders, totalRevenue, recentOrders, ordersByMonth }` |
| GET | `/api/data/products/stats` | Product statistics | `Authorization: Bearer <token>` | `{ totalProducts, products, bestSellingProducts }` |
| GET | `/api/data/customers/detailed` | Detailed customer data | `Authorization: Bearer <token>` | Customer list with relations |
| GET | `/api/data/orders/detailed` | Detailed order data | `Authorization: Bearer <token>` | Order list with items |
| GET | `/api/data/orders/filtered` | Orders with date filtering | `Authorization: Bearer <token>` | `{ ordersByDate, orders, totalOrders, totalRevenue }` |
| GET | `/api/data/customers/top-spenders` | Top spending customers | `Authorization: Bearer <token>` | Top 5 customers by spend |

### Analytics Endpoints

| Method | Endpoint | Description | Headers | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/data/analytics/insights` | Comprehensive analytics | `Authorization: Bearer <token>` | Business insights, revenue data |
| GET | `/api/data/analytics/abandoned-carts` | Abandoned carts analysis | `Authorization: Bearer <token>` | Cart abandonment stats |
| GET | `/api/data/analytics/events` | Store events log | `Authorization: Bearer <token>` | Recent events and types |
| GET | `/api/data/analytics/inventory` | Inventory analysis | `Authorization: Bearer <token>` | Stock levels and value |
| GET | `/api/data/analytics/fulfillment` | Order fulfillment status | `Authorization: Bearer <token>` | Status breakdown |
| GET | `/api/data/analytics/customer-segments` | Customer segmentation | `Authorization: Bearer <token>` | Segment analysis |

### Ingestion Endpoints

| Method | Endpoint | Description | Headers | Response |
|--------|----------|-------------|---------|----------|
| POST | `/api/webhooks/shopify/customers/create` | Create customer webhook | Shop API key | Success confirmation |
| POST | `/api/webhooks/shopify/customers/update` | Update customer webhook | Shop API key | Success confirmation |
| POST | `/api/webhooks/shopify/orders/create` | Create order webhook | Shop API key | Success confirmation |
| POST | `/api/webhooks/shopify/orders/paid` | Order paid webhook | Shop API key | Success confirmation |
| POST | `/api/webhooks/shopify/products/create` | Create product webhook | Shop API key | Success confirmation |
| POST | `/api/webhooks/shopify/products/update` | Update product webhook | Shop API key | Success confirmation |

### Health Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Server health check | `{ status: 'OK', timestamp }` |

## Database Schema

### Core Models

#### User
- `id`: String (Primary Key, CUID)
- `email`: String (Unique)
- `password`: String (Hashed)
- `tenantId`: String (Foreign Key to Tenant)
- `createdAt`, `updatedAt`: DateTime

#### Tenant
- `id`: String (Primary Key, CUID, Unique)
- `name`: String
- `domain`: String (Unique)
- `apiKey`: String (Unique, Shopify API Key)
- `createdAt`, `updatedAt`: DateTime
- Relations: Users, Customers, Orders, Products, StoreInfo, AbandonedCarts, StoreEvents

#### Customer (Mirrors Shopify Customer API)
- `id`: String (Primary Key, CUID)
- `tenantId`: String (Foreign Key to Tenant)
- `shopifyId`: String (Unique within tenant)
- `email`, `firstName`, `lastName`: String
- `createdAt`, `updatedAt`: DateTime
- Unique: (shopifyId, tenantId)
- Relations: Orders

#### Product (Mirrors Shopify Product API)
- `id`: String (Primary Key, CUID)
- `tenantId`: String (Foreign Key to Tenant)
- `shopifyId`: String (Unique within tenant)
- `title`: String
- `handle`, `inventoryPolicy`: String
- `price`: Float
- `inventoryQuantity`: Int
- `createdAt`, `updatedAt`: DateTime
- Unique: (shopifyId, tenantId)
- Relations: OrderItems

#### Order (Mirrors Shopify Order API)
- `id`: String (Primary Key, CUID)
- `tenantId`: String (Foreign Key to Tenant)
- `shopifyId`: String (Unique within tenant)
- `customerId`: String (Foreign Key to Customer, Nullable)
- `totalPrice`, `subtotalPrice`: Float
- `totalTax`, `totalDiscounts`: Float
- `financialStatus`, `fulfillmentStatus`: String
- `createdAt`, `updatedAt`: DateTime
- Unique: (shopifyId, tenantId)
- Relations: Customer, OrderItems, OrderAddresses

#### OrderItem (Order Line Items)
- `id`: String (Primary Key, CUID)
- `orderId`: String (Foreign Key to Order)
- `productId`: String (Foreign Key to Product, Nullable)
- `variantId`: String
- `title`, `variantTitle`, `sku`: String
- `quantity`: Int
- `price`, `linePrice`: Float
- Relations: Order, Product

#### OrderAddress (Shipping/Billing Addresses)
- `id`: String (Primary Key, CUID)
- `orderId`: String (Foreign Key to Order)
- `addressType`: String ('shipping', 'billing')
- `firstName`, `lastName`, `company`: String
- `address`, `city`, `province`, `country`, `zip`, `phone`: String
- Unique: (orderId, addressType)
- Relations: Order

#### StoreInfo (Extended Store Metadata)
- `id`: String (Primary Key, CUID)
- `tenantId`: String (Unique, Foreign Key to Tenant)
- `name`, `domain`, `shopOwner`, `email`: String
- `planName`, `currency`, `country`, `province`, `city`: String
- `createdAt`, `updatedAt`: DateTime
- Relations: Tenant

#### AbandonedCart (Cart Abandonment Tracking)
- `id`: String (Primary Key, CUID)
- `tenantId`: String (Foreign Key to Tenant)
- `checkoutId`: String (Unique within tenant)
- `totalPrice`: Float
- `createdAt`, `updatedAt`: DateTime
- Unique: (checkoutId, tenantId)
- Relations: Tenant

#### StoreEvent (Webhook Event Logging)
- `id`: String (Primary Key, CUID)
- `tenantId`: String (Foreign Key to Tenant)
- `eventId`: String (Shopify Event ID, Unique within tenant)
- `eventType`, `verb`, `description`: String
- `createdAt`, `updatedAt`: DateTime
- Unique: (eventId, tenantId)
- Relations: Tenant

### Relationships Summary
- **Tenant** (1) → (N) **User**, **Customer**, **Order**, **Product**, **StoreInfo**, **AbandonedCart**, **StoreEvent**
- **Customer** (1) → (N) **Order**
- **Order** (1) → (N) **OrderItem**, **OrderAddress**
- **Product** (1) → (N) **OrderItem**
- **OrderItem** → (1) **Order**, (1) **Product** (nullable)
- **OrderAddress** → (1) **Order**

### Indexing Strategy
- Primary Keys on `id` fields (CUID for collision resistance)
- Unique constraints on Shopify IDs within tenant scope
- Foreign key indexing for JOIN performance
- Composite unique constraints for data integrity

## Known Limitations and Assumptions

### Current Limitations

1. **Single Shopify Store per Tenant**
   - Each tenant can connect only one Shopify store
   - Assumption: One domain = One Shopify store = One tenant

2. **PostgreSQL Dependency**
   - Database optimized for PostgreSQL specific features
   - Migration to other databases requires schema adjustments

3. **Webhook Reliability**
   - Assumes stable Shopify webhook delivery
   - Occasional webhook failures require manual resyncing

4. **Currency Support**
   - Primarily designed for INR (Indian Rupee) display
   - Other currencies may require additional formatting logic

5. **API Rate Limits**
   - No built-in rate limiting beyond Shopify's limits
   - High-volume stores may encounter Shopify API throttling

### 🔍 Key Assumptions

1. **Data Completeness**
   - Assumes foundational data (customers, orders, products) is available in Shopify
   - Missing data requires manual intervention

2. **Network Reliability**
   - Assumes stable internet connectivity for webhook processing
   - Offline scenarios require custom implementation

3. **Security Model**
   - API key-based tenant isolation is sufficient for initial rollout
   - Additional authentication layers may be added later

4. **Performance**
   - Designed for moderate-sized Shopify stores (up to 50K monthly orders)
   - Very large stores may require pagination optimizations

5. **Migration Compatibility**
   - Schema changes require backward-compatible migrations
   - Breaking changes impact existing tenants

### Future Enhancements

- Multi-store support per tenant
- Real-time data streaming
- Advanced caching layer
- Custom webhook retry mechanisms
- Multi-currency support
- Horizontal scaling architecture

## Security Features

- **Tenant Isolation**: Complete data separation using API keys
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for production domains
- **Environment Variables**: Sensitive data never in codebase
- **Health Checks**: Automated monitoring and alerts

## Shop Integration Guide

1. **Get Shopify Admin API Token**
   - Shop Admin → Settings → Apps and channels
   - Develop apps for your store
   - Create new app with required permissions
   - Copy Admin API access token

2. **Required Permissions**
   ```
   - read_customers
   - read_orders
   - read_products
   - read_analytics
   ```

## Monitoring & Maintenance

### Health Checks
- Automated health monitoring
- Database connectivity checks
- Redis cache status (if used)
- API endpoint response times

### Logs
- Application events
- Error tracking
- Performance metrics
- User activity logs

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License. See below for the full license text:

```
MIT License

Copyright (c) 2025 Yashas Yadav

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Support

For support and questions:
- Create an issue on GitHub
- Check documentation in `/docs` folder
- Review deployment guide in `DEPLOYMENT.md`

---

**Built with:**
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, Prisma ORM
- **Database**: PostgreSQL with connection pooling
- **Deployment**: Vercel (Frontend), Render (Backend), GitHub Actions CI/CD
- **Analytics**: Chart.js, Framer Motion for animations
