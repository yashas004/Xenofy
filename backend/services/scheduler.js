const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const ShopifyIngestionService = require('./shopifyIngestion');

const prisma = new PrismaClient();

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  async startScheduledIngestion() {
    // Run every hour
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Starting scheduled ingestion for all tenants');
      try {
        const tenants = await prisma.tenant.findMany({
          select: {
            id: true,
            domain: true,
            apiKey: true,
            name: true,
          },
        });

        for (const tenant of tenants) {
          if (tenant.apiKey) { // Assuming apiKey is used as accessToken placeholder
            const ingestionService = new ShopifyIngestionService(
              tenant.id,
              tenant.domain,
              tenant.apiKey
            );
            await ingestionService.runFullIngest();
            await ingestionService.close();
          }
        }
        console.log('Scheduled ingestion completed');
      } catch (error) {
        console.error('Error in scheduled ingestion:', error);
      }
    }, {
      scheduled: false, // Start manually
    });

    this.jobs.push(job);
    job.start();
    console.log('Scheduled ingestion started, running every hour');
  }

  async startManualIngestion(tenantId, shopDomain, accessToken) {
    const ingestionService = new ShopifyIngestionService(
      tenantId,
      shopDomain,
      accessToken
    );
    await ingestionService.runFullIngest();
    await ingestionService.close();
    console.log(`Manual ingestion completed for tenant ${tenantId}`);
  }

  async stopAllJobs() {
    this.jobs.forEach(job => job.destroy());
    console.log('All scheduled jobs stopped');
  }
}

module.exports = SchedulerService;
