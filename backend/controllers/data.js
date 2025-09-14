const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get customer statistics
router.get('/customers/stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const totalCustomers = await prisma.customer.count({
      where: { tenantId }
    });

    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const customersByEmail = await prisma.customer.findMany({
      where: {
        tenantId,
        email: { not: null }
      },
      select: { id: true, email: true, createdAt: true }
    });

    res.json({
      totalCustomers,
      newCustomersThisMonth,
      customersByEmail
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order statistics
router.get('/orders/stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const totalOrders = await prisma.order.count({
      where: { tenantId }
    });

    const totalRevenue = await prisma.order.aggregate({
      where: { tenantId },
      _sum: { totalPrice: true }
    });

    const recentOrders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        customer: true,
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const ordersByMonth = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { tenantId },
      _count: { id: true },
      _sum: { totalPrice: true }
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      recentOrders,
      ordersByMonth
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product statistics
router.get('/products/stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const totalProducts = await prisma.product.count({
      where: { tenantId }
    });

    const products = await prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        price: true,
        createdAt: true
      }
    });

    const bestSellingProducts = await prisma.product.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: {
        orderItems: { _count: 'desc' }
      },
      take: 10
    });

    res.json({
      totalProducts,
      products,
      bestSellingProducts: bestSellingProducts.map(p => ({
        ...p,
        orderCount: p._count.orderItems
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get combined dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Parallel queries for performance
    const [customerStats, orderStats, productStats] = await Promise.all([
      prisma.customer.aggregate({
        where: { tenantId },
        _count: { id: true }
      }),
      prisma.order.aggregate({
        where: { tenantId },
        _count: { id: true },
        _sum: { totalPrice: true }
      }),
      prisma.product.aggregate({
        where: { tenantId },
        _count: { id: true }
      })
    ]);

    res.json({
      customers: {
        total: customerStats._count.id
      },
      orders: {
        total: orderStats._count.id,
        revenue: orderStats._sum.totalPrice || 0
      },
      products: {
        total: productStats._count.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed customer data
router.get('/customers/detailed', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        orders: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      total: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed product data
router.get('/products/detailed', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const products = await prisma.product.findMany({
      where: { tenantId },
      include: {
        orderItems: {
          include: { order: true }
        }
      },
      orderBy: { title: 'asc' },
      take: 20
    });

    // Calculate total sales per product
    const productsWithSales = products.map(product => ({
      ...product,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    }));

    res.json({
      total: products.length,
      products: productsWithSales
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed order data
router.get('/orders/detailed', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        customer: true,
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      total: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comprehensive analytics insights with real data
router.get('/analytics/insights', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Calculate comprehensive insights from real Shopify data
    const [
      topProducts,
      revenueData,
      customerData,
      storeInfo,
      abandonedCarts,
      storeEvents
    ] = await Promise.all([
      // Top selling products with detailed sales data
      prisma.product.findMany({
        where: { tenantId },
        include: {
          orderItems: {
            select: { quantity: true, price: true }
          }
        }
      }),
      // Revenue data with status filtering
      prisma.order.findMany({
        where: { tenantId },
        select: {
          totalPrice: true,
          createdAt: true,
          financialStatus: true,
          fulfillmentStatus: true
        }
      }),
      // Customer growth data
      prisma.customer.findMany({
        where: { tenantId },
        select: { createdAt: true }
      }),
      // Store information
      prisma.storeInfo.findUnique({ where: { tenantId } }),
      // Abandoned cart data for conversion analysis
      prisma.abandonedCart.findMany({ where: { tenantId } }),
      // Store events for activity tracking
      prisma.storeEvent.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    // Process top selling products
    const productStats = topProducts.map(prod => ({
      id: prod.id,
      shopifyId: prod.shopifyId,
      title: prod.title,
      price: prod.price,
      totalSold: prod.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: prod.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      inventoryQuantity: prod.inventoryQuantity,
      inventoryPolicy: prod.inventoryPolicy
    })).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);

    // Calculate conversion metrics
    const totalCustomers = customerData.length;
    const completedOrders = revenueData.length;
    const estimatedVisits = Math.max(totalCustomers * 3, completedOrders * 10);
    const cartAbandonRate = abandonedCarts.length > 0 ? (abandonedCarts.length / (abandonedCarts.length + completedOrders)) * 100 : 0;

    // Calculate monthly trends (simplified for recent months)
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2);

    const currentMonthRevenue = revenueData
      .filter(order => new Date(order.createdAt) >= currentMonth)
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const lastMonthRevenue = revenueData
      .filter(order => new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < currentMonth)
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const growthRate = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
      : 0;

    res.json({
      topProducts: productStats,
      totalRevenue: revenueData.reduce((sum, order) => sum + order.totalPrice, 0),
      totalCustomers,
      recentOrders: completedOrders,
      conversionMetrics: {
        estimatedVisits,
        cartAbandonRate: Math.round(cartAbandonRate * 100) / 100,
        conversionRate: estimatedVisits > 0 ? Math.round((completedOrders / estimatedVisits) * 100 * 100) / 100 : 0
      },
      storeInfo: {
        name: storeInfo?.name,
        planName: storeInfo?.planName,
        currency: storeInfo?.currency,
        country: storeInfo?.country
      },
      recentActivity: storeEvents.slice(0, 5).map(event => ({
        type: event.eventType,
        description: event.description,
        createdAt: event.createdAt
      })),
      revenue: {
        currentMonth: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        growthRate: Math.round(growthRate * 100) / 100
      }
    });
  } catch (error) {
    console.error('Analytics insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get abandoned cart analysis
router.get('/analytics/abandoned-carts', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const abandonedCarts = await prisma.abandonedCart.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const totalAbandonedValue = abandonedCarts.reduce((sum, cart) => sum + (cart.totalPrice || 0), 0);
    const averageCartValue = abandonedCarts.length > 0 ? totalAbandonedValue / abandonedCarts.length : 0;

    res.json({
      total: abandonedCarts.length,
      totalValue: totalAbandonedValue,
      averageValue: averageCartValue,
      recentCarts: abandonedCarts.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get store events and activity log
router.get('/analytics/events', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const events = await prisma.storeEvent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const eventsByType = events.reduce((acc, event) => {
      const type = event.eventType || 'Other';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {});

    res.json({
      total: events.length,
      events: events.slice(0, 20),
      eventsByType
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get inventory analysis
router.get('/analytics/inventory', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const products = await prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        inventoryQuantity: true,
        inventoryPolicy: true,
        price: true
      }
    });

    const inventoryStats = {
      totalProducts: products.length,
      inStock: products.filter(p => (p.inventoryQuantity || 0) > 0).length,
      outOfStock: products.filter(p => (p.inventoryQuantity || 0) === 0).length,
      lowStock: products.filter(p => (p.inventoryQuantity || 0) <= 5 && (p.inventoryQuantity || 0) > 0).length
    };

    const topSellingWithStock = products
      .map(p => ({
        ...p,
        stockValue: (p.inventoryQuantity || 0) * (p.price || 0)
      }))
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 10);

    res.json({
      inventoryStats,
      productsWithStock: topSellingWithStock
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order fulfillment status
router.get('/analytics/fulfillment', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const orders = await prisma.order.groupBy({
      by: ['fulfillmentStatus'],
      where: {
        tenantId,
        fulfillmentStatus: { not: null }
      },
      _count: { id: true },
      _sum: { totalPrice: true }
    });

    const statusBreakdown = orders.reduce((acc, status) => {
      acc[status.fulfillmentStatus || 'Unfulfilled'] = {
        count: status._count.id,
        value: status._sum.totalPrice || 0
      };
      return acc;
    }, {});

    res.json({
      total: orders.length,
      statusBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer segmentation data
router.get('/analytics/customer-segments', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get customers with their order history
    const customersWithData = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        orders: {
          select: { totalPrice: true, createdAt: true }
        }
      }
    });

    const segments = {
      highValue: customersWithData.filter(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0);
        return totalSpent > 100000; // High value: > ₹100,000
      }).length,

      regular: customersWithData.filter(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const lastOrderDate = new Date(Math.max(...customer.orders.map(o => new Date(o.createdAt).getTime())));
        const monthsSinceLastOrder = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return totalSpent >= 50000 && totalSpent <= 100000 && monthsSinceLastOrder <= 6;
      }).length,

      new: customersWithData.filter(customer => {
        const firstOrderDate = new Date(Math.min(...customer.orders.map(o => new Date(o.createdAt).getTime())));
        const monthsSinceFirst = (Date.now() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsSinceFirst <= 3;
      }).length,

      lowValue: customersWithData.filter(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0);
        return totalSpent < 10000;
      }).length
    };

    res.json({
      totalCustomers: customersWithData.length,
      segments
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders with date range filtering
router.get('/orders/filtered', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && {
            lte: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1) // Include end date
          })
        }
      };
    }

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        ...dateFilter
      },
      include: {
        customer: true,
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group orders by date for frontend display
    const ordersByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!acc[date]) {
        acc[date] = {
          totalOrders: 0,
          totalRevenue: 0,
          orders: []
        };
      }
      acc[date].totalOrders += 1;
      acc[date].totalRevenue += order.totalPrice;
      acc[date].orders.push(order);
      return acc;
    }, {});

    res.json({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      ordersByDate,
      orders: orders.slice(0, 50) // Limit for detailed view
    });
  } catch (error) {
    console.error('Filtered orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top 5 customers by spend
router.get('/customers/top-spenders', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const customersWithSpend = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        orders: {
          select: {
            totalPrice: true,
            createdAt: true,
            orderItems: {
              select: { quantity: true }
            }
          }
        }
      }
    });

    // Calculate total spend and order stats for each customer
    const customersStats = customersWithSpend.map(customer => {
      const totalSpend = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalOrders = customer.orders.length;
      const totalItems = customer.orders.reduce((sum, order) =>
        sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );

      return {
        id: customer.id,
        shopifyId: customer.shopifyId,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        totalSpend,
        totalOrders,
        totalItems,
        avgOrderValue: totalOrders > 0 ? totalSpend / totalOrders : 0,
        lastOrderDate: customer.orders.length > 0
          ? new Date(Math.max(...customer.orders.map(o => new Date(o.createdAt).getTime())))
          : null
      };
    });

    // Sort by total spend and take top 5
    const topCustomers = customersStats
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    res.json({
      topCustomers
    });
  } catch (error) {
    console.error('Top customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
