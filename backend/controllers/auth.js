/* Xenofy - By Yashas Yadav */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const Shopify = require('shopify-api-node');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.tenantId = decoded.tenantId;
    req.userId = decoded.userId;

    // Fetch tenant data and attach to request
    const prisma = new PrismaClient();
    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    req.tenant = tenant;
    req.user = decoded;
    await prisma.$disconnect();
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// User registration with email/password and Shopify API key
router.post('/register', async (req, res) => {
  const { email, password, name, domain, apiKey } = req.body;

  if (!email || !password || !name || !domain || !apiKey) {
    return res.status(400).json({ error: 'Email, password, name, domain, and API key are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if domain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { domain }
    });

    if (existingTenant) {
      return res.status(409).json({ error: 'Domain already registered' });
    }

    // Check if API key already exists
    const existingApiKey = await prisma.tenant.findUnique({
      where: { apiKey }
    });

    if (existingApiKey) {
      return res.status(409).json({ error: 'API key already in use' });
    }

    // Skip API validation for demo accounts (accounts with demo in name or specific domains)
    const isDemoAccount = name.toLowerCase().includes('demo') ||
                         domain.includes('xenofy-store-1') ||
                         apiKey.includes('shpat_example_demo_key');

    if (!isDemoAccount) {
      try {
        console.log('Validating Shopify API key for domain:', domain);
        const testShopify = new Shopify({
          shopName: domain.split('.')[0],
          accessToken: apiKey.trim(),
          apiVersion: '2023-10'
        });

        // Test the connection by attempting to get shop info
        await testShopify.shop.get();
        console.log('Shopify API key validation successful');
      } catch (shopifyError) {
        console.error('Shopify API validation failed:', shopifyError.message);

        if (shopifyError.message.includes('Unauthorized')) {
          return res.status(400).json({
            error: 'Invalid Shopify Admin API access token. Please check your API key and ensure it has the required permissions.'
          });
        } else if (shopifyError.message.includes('shop not found')) {
          return res.status(400).json({
            error: 'Shop not found. Please verify your Shopify domain is correct (e.g., mystore.myshopify.com).'
          });
        } else {
          return res.status(400).json({
            error: `Failed to connect to Shopify: ${shopifyError.message}. Please ensure your API key has read access to your store.`
          });
        }
      }
    } else {
      console.log('Skipping validation for demo account:', name, domain);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          domain,
          apiKey
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          tenantId: tenant.id
        }
      });

      return { tenant, user };
    });

    // Generate JWT token
    const token = jwt.sign(
      { tenantId: result.tenant.id, userId: result.user.id, email: result.user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Trigger automatic data ingestion in the background
    triggerAutoIngestion(result.tenant);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        domain: result.tenant.domain
      },
      user: {
        id: result.user.id,
        email: result.user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login with email/password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    let user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    // If demo user doesn't exist, create it on-the-fly
    if (!user && email === 'demo@xenofy.com' && password === 'demo123') {
      console.log('Demo user not found, creating one...');
      const hashedPassword = await bcrypt.hash('demo123', 10);

      const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: 'Xenofy Demo Store',
            domain: 'xenofy-store-1.myshopify.com',
            apiKey: 'shpat_example_demo_key_format_not_real_api_1234567890abcdefghijklmnopqrstuvwx'
          }
        });

        const demoUser = await tx.user.create({
          data: {
            email: 'demo@xenofy.com',
            password: hashedPassword,
            tenantId: tenant.id
          }
        });

        return { tenant, user: demoUser };
      });

      console.log('Demo user created successfully');
      user = result.user;
      user.tenant = result.tenant;
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { tenantId: user.tenantId, userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        domain: user.tenant.domain
      },
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tenant: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        domain: user.tenant.domain
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but keep endpoint for consistency)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

const ShopifyIngestionService = require('../services/shopifyIngestion');

// Auto-trigger data ingestion after successful registration
const triggerAutoIngestion = async (tenant) => {
  try {
    console.log(`Starting automatic data ingestion for new tenant ${tenant.name} (${tenant.domain})`);

    const ingestionService = new ShopifyIngestionService(
      tenant.id,
      tenant.domain,
      tenant.apiKey
    );

    // Background ingestion - don't block the response
    setTimeout(async () => {
      try {
        await ingestionService.runFullIngest();
        await ingestionService.close();
        console.log(`Automatic ingestion completed for tenant ${tenant.id}`);
      } catch (ingestionError) {
        console.error(`Automatic ingestion failed for tenant ${tenant.id}:`, ingestionError);
      }
    }, 1000); // Small delay to ensure transaction commit

  } catch (error) {
    console.error('Failed to start automatic ingestion:', error);
    // Don't fail the registration if ingestion fails to start
  }
};

module.exports = { router, verifyToken, triggerAutoIngestion };
