// Use verifyToken instead of verifyApiKey
const express = require('express');
const { verifyToken } = require('./auth');
const ShopifyIngestionService = require('../services/shopifyIngestion');

const router = express.Router();

// Manual data ingestion trigger
router.post('/trigger', verifyToken, async (req, res) => {
  try {
    const { tenant } = req;

    // Use tenant's stored domain and API key for security
    const shopDomain = tenant.domain; // Tenant-specific domain
    const accessToken = tenant.apiKey; // Tenant-specific API key from database

    if (!tenant.apiKey) {
      return res.status(400).json({
        error: 'API key not configured for this tenant. Please update your Shopify connection.'
      });
    }

    console.log(`Starting data ingestion for tenant ${tenant.name} (${tenant.domain})`);

    const ingestionService = new ShopifyIngestionService(
      tenant.id,
      shopDomain,
      accessToken
    );

    // Run full ingestion
    await ingestionService.runFullIngest();
    await ingestionService.close();

    res.json({
      message: 'Data ingestion completed successfully',
      tenant: tenant.name,
      status: 'success'
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest data',
      details: error.message
    });
  }
});

// Get ingestion status (placeholder for future)
router.get('/status', verifyToken, async (req, res) => {
  res.json({
    message: 'Ingestion service is ready',
    lastSync: new Date().toISOString()
  });
});

module.exports = router;
