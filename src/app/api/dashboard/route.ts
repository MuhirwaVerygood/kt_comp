import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

// GET /api/dashboard - Get dashboard overview data (Admin only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const admin = isAdminFromHeader(authHeader);
    if (!admin) {
      return forbiddenResponse('Admin access required');
    }

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get current period orders
    console.log('Dashboard API: Date ranges - thirtyDaysAgo:', thirtyDaysAgo, 'now:', now);
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    console.log('Dashboard API: Current orders count:', currentOrders.length);
    console.log('Dashboard API: Current orders:', currentOrders.map(o => ({ id: o.id, createdAt: o.createdAt, totalAmount: o.totalAmount })));

    // Get previous period orders for comparison
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });

    // Calculate revenue
    const currentRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate orders growth
    const ordersGrowth = previousOrders.length > 0 
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 
      : 0;

    // Get total products
    const totalProducts = await prisma.product.count();
    const previousProductCount = await prisma.product.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    const productsGrowth = previousProductCount > 0 
      ? ((totalProducts - previousProductCount) / previousProductCount) * 100 
      : 0;

    // Get active customers (customers who made orders in last 30 days)
    const activeCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    const previousActiveCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: {
              gte: sixtyDaysAgo,
              lt: thirtyDaysAgo,
            },
          },
        },
      },
    });

    const customersGrowth = previousActiveCustomers > 0 
      ? ((activeCustomers - previousActiveCustomers) / previousActiveCustomers) * 100 
      : 0;

    // Get sales data by month (last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    console.log('Dashboard API: Six months ago:', sixMonthsAgo);

    const monthlySales = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });
    console.log('Dashboard API: Monthly sales count:', monthlySales.length);
    console.log('Dashboard API: Monthly sales:', monthlySales.map(s => ({ totalAmount: s.totalAmount, createdAt: s.createdAt })));

    // Group by month
    const salesByMonth: { [key: string]: number } = {};
    monthlySales.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString('en-US', { month: 'short' });
      salesByMonth[month] = (salesByMonth[month] || 0) + order.totalAmount;
    });

    const salesData = Object.entries(salesByMonth).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // Get top products by revenue
    const productSales: { [key: string]: { id: string; name: string; brand: string; revenue: number; quantity: number } } = {};
    
    currentOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            id: item.productId,
            name: item.product.name,
            brand: item.product.brand.name,
            revenue: 0,
            quantity: 0,
          };
        }
        productSales[item.productId].revenue += item.price * item.quantity;
        productSales[item.productId].quantity += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: true,
      },
    });
    console.log('Dashboard API: Recent orders count:', recentOrders.length);
    console.log('Dashboard API: Recent orders:', recentOrders.map(o => ({ id: o.id, createdAt: o.createdAt, totalAmount: o.totalAmount })));

    const recentOrdersData = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || order.user?.email || order.customerName || order.customerEmail,
      total: order.totalAmount,
      items: order.orderItems.length,
      status: order.status,
      date: order.createdAt,
    }));

    // Calculate store performance metrics
    const averageOrderValue = currentOrders.length > 0 
      ? currentRevenue / currentOrders.length 
      : 0;

    // Conversion rate (orders / total customers)
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });
    const conversionRate = totalCustomers > 0 
      ? (currentOrders.length / totalCustomers) * 100 
      : 0;

    // Customer retention (customers with more than 1 order)
    const repeatCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });
    const customerRetention = activeCustomers > 0 
      ? (repeatCustomers / activeCustomers) * 100 
      : 0;

    // Inventory turnover (simplified calculation)
    const totalInventory = await prisma.product.aggregate({
      _sum: {
        stockCount: true,
      },
    });

    const totalSold = currentOrders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const inventoryTurnover = totalInventory._sum.stockCount && totalInventory._sum.stockCount > 0
      ? totalSold / totalInventory._sum.stockCount
      : 0;

    console.log('Dashboard API: Final response data:', {
      overview: {
        totalRevenue: currentRevenue,
        revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
        totalOrders: currentOrders.length,
        ordersGrowth: parseFloat(ordersGrowth.toFixed(1)),
        totalProducts,
        productsGrowth: parseFloat(productsGrowth.toFixed(1)),
        activeCustomers,
        customersGrowth: parseFloat(customersGrowth.toFixed(1)),
      },
      salesData,
      topProducts,
      recentOrders: recentOrdersData,
      performance: {
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        averageOrderValue: Math.round(averageOrderValue),
        customerRetention: parseFloat(customerRetention.toFixed(1)),
        inventoryTurnover: parseFloat(inventoryTurnover.toFixed(1)),
      },
    });

    return successResponse({
      overview: {
        totalRevenue: currentRevenue,
        revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
        totalOrders: currentOrders.length,
        ordersGrowth: parseFloat(ordersGrowth.toFixed(1)),
        totalProducts,
        productsGrowth: parseFloat(productsGrowth.toFixed(1)),
        activeCustomers,
        customersGrowth: parseFloat(customersGrowth.toFixed(1)),
      },
      salesData,
      topProducts,
      recentOrders: recentOrdersData,
      performance: {
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        averageOrderValue: Math.round(averageOrderValue),
        customerRetention: parseFloat(customerRetention.toFixed(1)),
        inventoryTurnover: parseFloat(inventoryTurnover.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
