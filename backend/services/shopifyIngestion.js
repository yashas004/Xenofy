const Shopify = require('shopify-api-node');
const { PrismaClient } = require('@prisma/client');

class ShopifyIngestionService {
  constructor(tenantId, shopDomain, accessToken) {
    this.tenantId = tenantId;

    // Validate access token
    if (!accessToken) {
      throw new Error('Admin API access token is required for data extraction');
    }

    if (accessToken.length < 20) {
      throw new Error('Invalid Admin API access token - too short');
    }

    this.shopify = new Shopify({
      shopName: shopDomain.split('.')[0], // Remove .myshopify.com if present
      accessToken: accessToken.trim(), // Use the Admin API access token provided by user
      apiVersion: '2023-10'
    });

    this.prisma = new PrismaClient();
  }

  async ingestCustomers() {
    try {
      const customers = await this.shopify.customer.list();
      for (const customer of customers) {
        await this.prisma.customer.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: customer.id.toString(),
              tenantId: this.tenantId,
            },
          },
          update: {
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            updatedAt: new Date(),
          },
          create: {
            tenantId: this.tenantId,
            shopifyId: customer.id.toString(),
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
          },
        });
      }
      console.log(`Ingested ${customers.length} customers for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting customers:', error);
    }
  }

  async ingestProducts() {
    try {
      const products = await this.shopify.product.list();
      for (const product of products) {
        await this.prisma.product.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: product.id.toString(),
              tenantId: this.tenantId,
            },
          },
          update: {
            title: product.title,
            handle: product.handle,
            price: parseFloat(product.variants[0]?.price || 0),
            updatedAt: new Date(),
          },
          create: {
            tenantId: this.tenantId,
            shopifyId: product.id.toString(),
            title: product.title,
            handle: product.handle,
            price: parseFloat(product.variants[0]?.price || 0),
          },
        });
      }
      console.log(`Ingested ${products.length} products for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting products:', error);
    }
  }

  async ingestOrders() {
    try {
      const orders = await this.shopify.order.list();

      // Extract comprehensive order data using Admin API
      for (const order of orders) {
        const customer = await this.prisma.customer.findUnique({
          where: {
            shopifyId_tenantId: {
              shopifyId: order.customer?.id?.toString(),
              tenantId: this.tenantId,
            },
          },
        });

        // Extract order financial details
        const orderFinancialStatus = order.financial_status;
        const orderFulfillmentStatus = order.fulfillment_status;
        const orderCreatedAt = new Date(order.created_at);
        const orderUpdatedAt = new Date(order.updated_at);

        const dbOrder = await this.prisma.order.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: order.id.toString(),
              tenantId: this.tenantId,
            },
          },
          update: {
            totalPrice: parseFloat(order.total_price),
            subtotalPrice: parseFloat(order.subtotal_price || 0),
            totalTax: parseFloat(order.total_tax || 0),
            totalDiscounts: parseFloat(order.total_discounts || 0),
            financialStatus: orderFinancialStatus,
            fulfillmentStatus: orderFulfillmentStatus,
            updatedAt: new Date(),
          },
          create: {
            tenantId: this.tenantId,
            shopifyId: order.id.toString(),
            customerId: customer?.id,
            totalPrice: parseFloat(order.total_price),
            subtotalPrice: parseFloat(order.subtotal_price || 0),
            totalTax: parseFloat(order.total_tax || 0),
            totalDiscounts: parseFloat(order.total_discounts || 0),
            financialStatus: orderFinancialStatus,
            fulfillmentStatus: orderFulfillmentStatus,
          },
        });

        // Extract comprehensive order line item data
        for (const lineItem of order.line_items) {
          const product = await this.prisma.product.findUnique({
            where: {
              shopifyId_tenantId: {
                shopifyId: lineItem.product_id?.toString(),
                tenantId: this.tenantId,
              },
            },
          });

          await this.prisma.orderItem.upsert({
            where: {
              orderId_productId: {
                orderId: dbOrder.id,
                productId: lineItem.product_id?.toString(),
              },
            },
            update: {
              variantId: lineItem.variant_id?.toString(),
              title: lineItem.title,
              variantTitle: lineItem.variant_title,
              quantity: lineItem.quantity,
              price: parseFloat(lineItem.price),
              linePrice: parseFloat(lineItem.line_price),
              sku: lineItem.sku,
            },
            create: {
              orderId: dbOrder.id,
              productId: lineItem.product_id?.toString(),
              variantId: lineItem.variant_id?.toString(),
              title: lineItem.title,
              variantTitle: lineItem.variant_title,
              quantity: lineItem.quantity,
              price: parseFloat(lineItem.price),
              linePrice: parseFloat(lineItem.line_price),
              sku: lineItem.sku,
            },
          });
        }

        // Extract shipping and billing addresses if available
        if (order.shipping_address) {
          await this.prisma.orderAddress.upsert({
            where: { orderId: dbOrder.id },
            update: {
              addressType: 'shipping',
              firstName: order.shipping_address.first_name,
              lastName: order.shipping_address.last_name,
              company: order.shipping_address.company,
              address1: order.shipping_address.address1,
              address2: order.shipping_address.address2,
              city: order.shipping_address.city,
              province: order.shipping_address.province,
              country: order.shipping_address.country,
              zip: order.shipping_address.zip,
              phone: order.shipping_address.phone,
            },
            create: {
              orderId: dbOrder.id,
              addressType: 'shipping',
              firstName: order.shipping_address.first_name,
              lastName: order.shipping_address.last_name,
              company: order.shipping_address.company,
              address1: order.shipping_address.address1,
              address2: order.shipping_address.address2,
              city: order.shipping_address.city,
              province: order.shipping_address.province,
              country: order.shipping_address.country,
              zip: order.shipping_address.zip,
              phone: order.shipping_address.phone,
            },
          });
        }
      }
      console.log(`Ingested ${orders.length} comprehensive orders for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting comprehensive orders:', error);
    }
  }

  async ingestAnalytics() {
    try {
      // Extract comprehensive analytics data using Admin API
      const analytics = await this.shopify.analytics.list();

      // Store analytics data in a dedicated analytics table (would need schema update)
      for (const analytic of analytics) {
        // Process store analytics such as cart conversion, session data, etc.
        console.log(`Analytics data for ${this.tenantId}:`, analytic);
      }
    } catch (error) {
      console.error('Error ingesting analytics:', error);
    }
  }

  async ingestInventory() {
    try {
      // Extract inventory levels for all products using Admin API
      const inventory = await this.shopify.inventoryLevel.list();

      for (const item of inventory) {
        // Update product inventory data
        await this.prisma.product.updateMany({
          where: {
            tenantId: this.tenantId,
            shopifyId: item.item_id.toString(),
          },
          data: {
            inventoryQuantity: item.available,
            inventoryPolicy: item.quantity === 0 ? 'deny' : 'continue',
            fulfillmentService: item.location_id,
          },
        });
      }
      console.log(`Ingested ${inventory.length} inventory items for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting inventory:', error);
    }
  }

  async ingestAbandonedCheckouts() {
    try {
      // Extract abandoned checkout data for conversion analysis
      const abandonedCheckouts = await this.shopify.checkout.list({
        abandoned_checkout: true
      });

      for (const checkout of abandonedCheckouts) {
        // Process abandoned cart data for analytics
        // Could be used to calculate conversion rates and cart abandonment
        await this.prisma.abandonedCart.upsert({
          where: {
            checkoutId_tenantId: {
              checkoutId: checkout.id.toString(),
              tenantId: this.tenantId,
            },
          },
          update: {
            totalPrice: parseFloat(checkout.total_price),
            subtotalPrice: parseFloat(checkout.subtotal_price),
            updatedAt: new Date(),
          },
          create: {
            tenantId: this.tenantId,
            checkoutId: checkout.id.toString(),
            totalPrice: parseFloat(checkout.total_price),
            subtotalPrice: parseFloat(checkout.subtotal_price),
            currency: checkout.currency,
            createdAt: new Date(checkout.created_at),
          },
        });
      }
      console.log(`Ingested ${abandonedCheckouts.length} abandoned checkouts for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting abandoned checkouts:', error);
    }
  }

  async ingestEventsAndWebhooks() {
    try {
      // Extract store events and webhook data
      const events = await this.shopify.event.list();

      for (const event of events) {
        await this.prisma.storeEvent.upsert({
          where: {
            eventId_tenantId: {
              eventId: event.id.toString(),
              tenantId: this.tenantId,
            },
          },
          update: {
            description: event.description,
            updatedAt: new Date(),
          },
          create: {
            tenantId: this.tenantId,
            eventId: event.id.toString(),
            eventType: event.resource,
            verb: event.verb,
            description: event.description,
            createdAt: new Date(event.created_at),
          },
        });
      }
      console.log(`Ingested ${events.length} store events for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting events and webhooks:', error);
    }
  }

  async ingestStoreMetrics() {
    try {
      // Extract comprehensive store metrics using Admin API
      const shop = await this.shopify.shop.get();

      // Store key store information
      await this.prisma.storeInfo.upsert({
        where: { tenantId: this.tenantId },
        update: {
          name: shop.name,
          domain: shop.domain,
          myshopifyDomain: shop.myshopify_domain,
          planName: shop.plan_name,
          shopOwner: shop.shop_owner,
          email: shop.email,
          currency: shop.currency,
          country: shop.country_code,
          province: shop.province,
          city: shop.city,
          address1: shop.address1,
          zip: shop.zip,
          phone: shop.phone,
          timezone: shop.timezone,
          updatedAt: new Date(),
        },
        create: {
          tenantId: this.tenantId,
          name: shop.name,
          domain: shop.domain,
          myshopifyDomain: shop.myshopify_domain,
          planName: shop.plan_name,
          shopOwner: shop.shop_owner,
          email: shop.email,
          currency: shop.currency,
          country: shop.country_code,
          province: shop.province,
          city: shop.city,
          address1: shop.address1,
          zip: shop.zip,
          phone: shop.phone,
          timezone: shop.timezone,
        },
      });

      console.log(`Ingested store information for tenant ${this.tenantId}`);
    } catch (error) {
      console.error('Error ingesting store metrics:', error);
    }
  }

  async runFullIngest() {
    await this.ingestStoreMetrics(); // Store basic info first
    await this.ingestCustomers();     // Customer data
    await this.ingestProducts();      // Product catalog
    await this.ingestInventory();     // Inventory levels
    await this.ingestOrders();        // Order history
    await this.ingestAbandonedCheckouts(); // Cart abandonment
    await this.ingestEventsAndWebhooks(); // Store events
    await this.ingestAnalytics();     // Store analytics (if available)

    console.log('Comprehensive data extraction completed for tenant', this.tenantId);
  }

  async close() {
    await this.prisma.$disconnect();
  }
}

module.exports = ShopifyIngestionService;
