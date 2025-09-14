const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: function (origin, callback) {
    // Define allowed origins as strings only (avoid regex for now)
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL || 'https://xenofy-git-main-yashas004s-projects.vercel.app',
      'https://xenofy-frontend.vercel.app',
      'https://xenofy.vercel.app', // Custom domain
      'https://xenofy-dykiog368-yashas004s-projects.vercel.app',
      'https://xenofy-git-main-yashas004s-projects.vercel.app',
      'https://xenofy-c4h9fsxf9-yashas004s-projects.vercel.app', // Latest deployment
      'https://xenofy-backend.onrender.com'
    ].filter(Boolean);

    // Allow if no origin (e.g., Postman requests, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      // Handle regex patterns (if any in future)
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type', 'x-api-key', 'Accept', 'Origin', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Controllers
const authRoutes = require('./controllers/auth').router;
const dataRoutes = require('./controllers/data');
const ingestionRoutes = require('./controllers/ingestion');

app.use('/auth', authRoutes);
// Apply token verification to all /api routes
const { verifyToken } = require('./controllers/auth');
app.use('/api', verifyToken);
app.use('/api/data', dataRoutes);
app.use('/api/ingestion', ingestionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Xenofy Backend API' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Server shutting down gracefully');
  process.exit(0);
});
