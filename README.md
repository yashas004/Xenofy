# Xenofy

## Multi-Tenant Shopify Analytics Platform

Xenofy is a comprehensive Shopify data ingestion and analytics service designed for multi-tenant deployments. It provides secure data isolation, real-time analytics dashboards, and automated reporting for e-commerce businesses.

**Status**: Production Ready | **License**: MIT | **Node.js**: 18+ Required

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

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health check: http://localhost:3001/health

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
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
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

### Authentication
```
POST /auth/register
- Registers new tenant with Shopify API key
- Returns JWT token

POST /auth/login
- Authenticates tenant
- Returns JWT token

GET /auth/me
- Returns current user and tenant information

POST /auth/logout
- Logs out user (client-side)
```

### Data Retrieval
```
GET /api/data/dashboard
- Requires: x-api-key header
- Returns: Aggregated dashboard data for tenant
```

### Health Check
```
GET /health
- Returns server status and health information
```

## Database Schema

### Tenants
- Secure API key-based tenant isolation
- Encrypted data storage
- Access control per tenant

### Shopify Data Tables
- customers, orders, products
- Real-time synchronization
- Historical data retention

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

This project is licensed under the MIT License - see the LICENSE file for details.

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
