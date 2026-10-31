import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { inMemoryProducts } from './productRoutes';
import { inMemoryOrders } from './checkoutRoutes';
import { getDbStatus } from '../db';

const router = Router();

let inMemoryAuditLogs = [
  {
    id: 'log-1',
    action: 'SYSTEM_BOOT',
    actor: 'System',
    role: 'system',
    details: 'Novara Commerce initialized with Bangladesh retail catalog',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'log-2',
    action: 'CATALOG_SYNC',
    actor: 'Novara Admin',
    role: 'super_admin',
    details: 'Synced 15 products and 6 categories matching retail layout',
    timestamp: new Date().toISOString(),
  },
];

let inMemoryStaff = [
  { id: 'stf-1', name: 'Novara Admin', email: 'admin@novara.com', role: 'super_admin', status: 'active' },
  { id: 'stf-2', name: 'Tariq Rahman', email: 'tariq@novara.com', role: 'order_manager', status: 'active' },
  { id: 'stf-3', name: 'Nusrat Jahan', email: 'nusrat@novara.com', role: 'catalog_manager', status: 'active' },
  { id: 'stf-4', name: 'Kamal Hossain', email: 'kamal@novara.com', role: 'inventory_manager', status: 'active' },
];

// Admin Dashboard KPIs
router.get('/dashboard', requireAuth, requireRole(['admin', 'super_admin', 'order_manager']), (req: Request, res: Response) => {
  const completedOrders = inMemoryOrders.filter((o) => o.status !== 'cancelled' && o.status !== 'returned');
  const grossSales = completedOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
  const netSales = completedOrders.reduce((sum, o) => sum + ((o.subtotal || 0) - (o.discount || 0)), 0);
  const pendingOrders = inMemoryOrders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = inMemoryProducts.filter((p) => p.stock <= (p.lowStockThreshold || 5));
  const outOfStockProducts = inMemoryProducts.filter((p) => p.stock === 0);

  // Category breakdown
  const categorySales: Record<string, number> = {};
  completedOrders.forEach((o) => {
    o.items?.forEach((item: any) => {
      const p = inMemoryProducts.find((prod) => prod.id === item.productId || prod.sku === item.sku);
      const cat = p?.category || 'General';
      const lineTotal = item.total || (item.effectivePrice || item.price || 0) * (item.quantity || 1);
      categorySales[cat] = Math.round(((categorySales[cat] || 0) + lineTotal) * 100) / 100;
    });
  });

  res.json({
    success: true,
    data: {
      grossSales: Math.round(grossSales * 100) / 100,
      netSales: Math.round(netSales * 100) / 100,
      totalOrders: inMemoryOrders.length,
      averageOrderValue: inMemoryOrders.length ? Math.round((grossSales / inMemoryOrders.length) * 100) / 100 : 0,
      pendingOrders,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      categorySales,
      lowStockAlerts: lowStockProducts.map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock })),
      recentOrders: inMemoryOrders.slice(0, 5),
    },
  });
});

// Admin Inventory View
router.get('/inventory', requireAuth, requireRole(['admin', 'super_admin', 'inventory_manager']), (req: Request, res: Response) => {
  const inventoryList = inMemoryProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: p.price,
    salePrice: p.salePrice,
    stockOnHand: p.stock + (p.reservedStock || 0),
    reservedStock: p.reservedStock || 0,
    availableStock: p.stock,
    lowStockThreshold: p.lowStockThreshold || 5,
    isLowStock: p.stock <= (p.lowStockThreshold || 5),
    isOutOfStock: p.stock === 0,
  }));

  res.json({ success: true, data: inventoryList });
});

// Admin Audit Logs
router.get('/audit-logs', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryAuditLogs });
});

// Admin Staff Management
router.get('/staff', requireAuth, requireRole(['super_admin', 'admin']), (req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryStaff });
});

// Admin Customers List
router.get('/customers', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  // Aggregate customer order history
  const customerMap: Record<string, any> = {
    'user-customer': {
      id: 'user-customer',
      name: 'Sarah Khan',
      email: 'customer@example.com',
      phone: '+880 1812 345678',
      role: 'customer',
      city: 'Dhaka',
      district: 'Dhanmondi',
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
      joinedAt: '2025-01-15T00:00:00.000Z',
    },
    'user-guest-sample': {
      id: 'user-guest-sample',
      name: 'Rafiul Islam',
      email: 'rafiul@example.com',
      phone: '+880 1712 998877',
      role: 'customer',
      city: 'Chittagong',
      district: 'Agrabad',
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
      joinedAt: '2025-02-10T00:00:00.000Z',
    },
  };

  inMemoryOrders.forEach((o) => {
    const key = o.customerId || o.customerEmail;
    if (!customerMap[key]) {
      customerMap[key] = {
        id: key,
        name: o.customerName || 'Customer',
        email: o.customerEmail,
        phone: o.customerPhone || 'N/A',
        role: 'customer',
        city: o.shippingAddress?.division || 'Dhaka',
        district: o.shippingAddress?.district || 'General',
        status: 'active',
        ordersCount: 0,
        totalSpent: 0,
        joinedAt: o.createdAt || new Date().toISOString(),
      };
    }
    customerMap[key].ordersCount += 1;
    if (o.status !== 'cancelled' && o.status !== 'returned') {
      customerMap[key].totalSpent += o.finalTotal || 0;
    }
  });

  const customers = Object.values(customerMap).map((c) => ({
    ...c,
    totalSpent: Math.round(c.totalSpent * 100) / 100,
  }));

  res.json({ success: true, data: customers });
});

// Admin Coupons List & Management
router.get('/coupons', requireAuth, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  const { inMemoryCoupons } = await import('./checkoutRoutes');
  res.json({ success: true, data: inMemoryCoupons });
});

router.post('/coupons', requireAuth, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { inMemoryCoupons } = await import('./checkoutRoutes');
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiresAt } = req.body;

    if (!code || !discountValue) {
      res.status(400).json({ success: false, error: 'Coupon code and discount value are required' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (inMemoryCoupons.some((c: any) => c.code === cleanCode)) {
      res.status(400).json({ success: false, error: 'Coupon code already exists' });
      return;
    }

    const newCoupon = {
      id: `cpn-${Date.now()}`,
      code: cleanCode,
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      isActive: true,
      expiresAt: expiresAt || '2026-12-31T23:59:59.999Z',
      usageCount: 0,
    };

    inMemoryCoupons.push(newCoupon);
    res.status(201).json({ success: true, data: newCoupon });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/coupons/:code/toggle', requireAuth, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { inMemoryCoupons } = await import('./checkoutRoutes');
    const { code } = req.params;
    const cpn = inMemoryCoupons.find((c: any) => c.code === code.toUpperCase());
    if (!cpn) {
      res.status(404).json({ success: false, error: 'Coupon not found' });
      return;
    }
    cpn.isActive = !cpn.isActive;
    res.json({ success: true, data: cpn });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/coupons/:code', requireAuth, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { inMemoryCoupons } = await import('./checkoutRoutes');
    const { code } = req.params;
    const idx = inMemoryCoupons.findIndex((c: any) => c.code === code.toUpperCase());
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Coupon not found' });
      return;
    }
    inMemoryCoupons.splice(idx, 1);
    res.json({ success: true, message: `Coupon ${code.toUpperCase()} deleted` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Analytics & Reports
router.get('/analytics', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  const completedOrders = inMemoryOrders.filter((o) => o.status !== 'cancelled' && o.status !== 'returned');
  const grossSales = completedOrders.reduce((sum, o) => sum + o.finalTotal, 0);

  // Status breakdown
  const statusCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  inMemoryOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Payment method breakdown
  const paymentMethods: Record<string, number> = {
    cod: 0,
    bkash: 0,
    card: 0,
  };
  inMemoryOrders.forEach((o) => {
    paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;
  });

  // Top products
  const productPerformance: Record<string, { name: string; sales: number; revenue: number }> = {};
  completedOrders.forEach((o) => {
    o.items?.forEach((item: any) => {
      if (!productPerformance[item.name]) {
        productPerformance[item.name] = { name: item.name, sales: 0, revenue: 0 };
      }
      productPerformance[item.name].sales += item.quantity || 1;
      productPerformance[item.name].revenue += item.total || (item.price * item.quantity);
    });
  });

  const topProducts = Object.values(productPerformance)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 7-day revenue trend simulation based on real orders
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyRevenue = days.map((day, idx) => ({
    day,
    revenue: Math.round((grossSales * (0.1 + (idx * 0.03))) * 100) / 100 || (idx + 1) * 120,
    orders: Math.max(1, Math.round(inMemoryOrders.length * (0.1 + (idx * 0.02)))),
  }));

  res.json({
    success: true,
    data: {
      grossSales: Math.round(grossSales * 100) / 100,
      totalOrders: inMemoryOrders.length,
      averageOrderValue: inMemoryOrders.length ? Math.round((grossSales / inMemoryOrders.length) * 100) / 100 : 0,
      conversionRate: '3.4%',
      statusCounts,
      paymentMethods,
      topProducts,
      dailyRevenue,
    },
  });
});

// Store Settings
let storeSettings = {
  storeName: 'NOVARA COMMERCE',
  tagline: 'Premium Lifestyle & Tech Electronics',
  currency: 'USD',
  currencySymbol: '$',
  supportEmail: 'support@novara.com',
  supportPhone: '+880 1711 000000',
  freeShippingThreshold: 50,
  dhakaShippingFee: 60,
  outsideDhakaShippingFee: 120,
  orderAutoConfirm: false,
  inventoryLowAlertThreshold: 5,
  taxRatePercent: 0,
};

router.get('/store-settings', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  res.json({ success: true, data: storeSettings });
});

router.put('/store-settings', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  storeSettings = { ...storeSettings, ...req.body };
  res.json({ success: true, data: storeSettings, message: 'Settings saved successfully' });
});

// System Integration Status
router.get('/system-status', (req: Request, res: Response) => {
  const db = getDbStatus();
  const cloudinaryConfigured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const paymentConfigured = Boolean(process.env.PAYMENT_PROVIDER || process.env.BKASH_APP_KEY);

  res.json({
    success: true,
    system: {
      mongodb: db,
      cloudinary: {
        configured: cloudinaryConfigured,
        provider: 'Cloudinary Media API',
      },
      email: {
        configured: resendConfigured,
        provider: 'Resend HTTP API',
      },
      payment: {
        configured: paymentConfigured,
        methods: ['Cash on Delivery (Available)', 'bKash / Mobile Wallet (Sandbox/Integrated)'],
      },
    },
  });
});

export default router;
