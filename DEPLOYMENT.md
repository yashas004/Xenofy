# Xenofy Multi-Tenant Shopify Analytics Platform - Deployment Guide

## Deployment Overview

This platform consists of two main components:
1. **Frontend**: Next.js React application (Deploy to Vercel)
2. **Backend**: Node.js Express API (Deploy to Render)

## Prerequisites

### Required Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=https://your-render-backend-url.onrender.com
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secure-jwt-secret-here
```

### Shopify Admin API Access Token

Each tenant must provide their Shopify Admin API access token, which should have these scopes:
- `read_customers`
- `read_orders`
- `read_products`
- `read_inventory`
- `read_content`

## Backend Deployment (Render)

### Step 1: Prepare Database
1. Create PostgreSQL database on Railway, Vercel Postgres, or any PostgreSQL provider
2. Copy the connection URL to your backend `.env` file

### Step 2: Deploy to Render

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: xenofy-backend
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: DATABASE_URL
           sync: false
         - key: JWT_SECRET
           sync: false
   ```

3. **Environment Variables**
   - Add `NODE_ENV: production`
   - Add your `DATABASE_URL`
   - Add `JWT_SECRET` (generate a secure secret)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend

### Step 3: Verify Backend
```bash
curl https://your-backend-name.onrender.com/health
```

## Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Select the `/frontend` directory

2. **Configure Build**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Environment Variables

```yaml
# Frontend Environment Variables
NEXT_PUBLIC_BACKEND_URL=https://xenofy-backend.onrender.com
```

### Step 3: Deploy

1. Click "Deploy"
2. Vercel will automatically detect the Next.js configuration
3. Wait for build completion
4. Access your deployed application at `your-project-name.vercel.app`

## Post-Deployment Configuration

### Tenant Setup

1. **Create Tenants**
   ```bash
   # The backend will automatically create tenants based on API keys
   # Tenant onboarding is handled through the frontend auth flow
   ```

2. **Admin API Token Verification**
   - Users provide their Shopify Admin API token through the frontend
   - Backend validates token permissions
   - Store data is extracted and stored in tenant-specific database

### Data Ingestion

1. **Initial Data Sync**
   ```bash
   # After tenant onboarding, the ingestion service runs automatically
   curl -X POST https://your-backend-url.ingest/trigger \
     -H "x-api-key: xenofy-store-1-api" \
     -H "x-tenant-domain: xenofy-store-1.myshopify.com"
   ```

2. **Scheduled Sync (Optional)**
   ```bash
   # Set up cron job for regular data synchronization
   # Every 6 hours: curl -X POST https://your-backend-url.ingest/trigger
   ```

## Database Schema

The platform uses Prisma ORM with PostgreSQL:

### Core Models
- **Tenant**: Multi-tenant isolation
- **Customer**: Shopify customer data
- **Product**: Product catalog with inventory
- **Order**: Order details with line items
- **OrderAddress**: Shipping/billing addresses

### Analytics Models
- **StoreInfo**: Store metadata
- **AbandonedCart**: Cart abandonment tracking
- **StoreEvent**: Store activity logs
- **AnalyticsData**: Advanced analytics

## Security Considerations

### API Security
- JWT-based authentication
- API key validation per tenant
- Rate limiting implemented
- HTTPS enforced

### Data Security
- Tenant data isolation at database level
- Encrypted sensitive information
- Regular security updates
- Comprehensive logging

## Performance Optimization

### Backend
- Database query optimization
- Caching for frequently accessed data
- Horizontal scaling support
- Optimized Shopify API calls

### Frontend
- Static generation for fast loading
- Dynamic rendering for real-time data
- Progressive Web App features
- Optimized bundle size

## Monitoring & Maintenance

### Application Monitoring
- Health check endpoints: `/health`
- Error logging with timestamps
- Performance monitoring
- Automatic restarts on failures

### Database Maintenance
- Regular schema migrations
- Data backup strategies
- Query performance monitoring
- Database connection pooling

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connection
   curl https://your-backend-url/db/health
   ```

2. **Shopify API Limits**
   - Implement rate limiting
   - Handle API quota errors gracefully
   - Schedule data sync during off-peak hours

3. **Frontend Backend Communication**
   ```bash
   # Verify CORS configuration
   # Check NEXT_PUBLIC_BACKEND_URL environment variable
   ```

### Logs and Debugging

1. **Backend Logs**
   - Available in Render dashboard
   - API request/response logging
   - Shopify API call tracking

2. **Frontend Logs**
   - Browser developer console
   - Vercel deployment logs
   - Error boundary monitoring

## Support

### Issues
1. Check deployment logs
2. Verify environment variables
3. Test API connectivity
4. Review database connections

### Emergency Contacts
- Render Support: [support.render.com](https://support.render.com)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

---

## Deployment Checklist

- [ ] PostgreSQL database provisioned
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Monitoring alerts configured
- [ ] Backup strategies implemented

Your **Xenofy Multi-Tenant Shopify Analytics Platform** is now ready for production use!
