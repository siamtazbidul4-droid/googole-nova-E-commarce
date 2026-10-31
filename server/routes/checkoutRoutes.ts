import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { inMemoryProducts } from './productRoutes';
import { ProductModel } from '../models/Product';
import { OrderModel, IOrder } from '../models/Order';
import { INITIAL_COUPONS } from '../data/initialData';
import { calculateCartTotals, getEffectivePrice } from '../../src/utils/ecommerceRules';
import { isDbConnected } from '../db';

const router = Router();
let inMemoryOrders: any[] = [
  {
    id: 'ord-seed-1',
    orderNumber: 'NOV-2025-108249',
    customerId: 'user-customer',
    customerName: 'Sarah Khan',
    customerEmail: 'customer@example.com',
    customerPhone: '+880 1812 345678',
    items: [
      {
        productId: 'prod-1',
        sku: 'NOV-AUD-001',
        name: 'Wireless Headphones',
        price: 79.99,
        salePrice: 59.99,
        effectivePrice: 59.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      },
      {
        productId: 'prod-2',
        sku: 'NOV-WCH-002',
        name: 'Smart Watch',
        price: 119.99,
        salePrice: 89.99,
        effectivePrice: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      },
    ],
    subtotal: 149.98,
    discount: 15.00,
    couponCode: 'SAVE10',
    shippingFee: 0,
    tax: 0,
    finalTotal: 134.98,
    shippingAddress: {
      name: 'Sarah Khan',
      phone: '+880 1812 345678',
      division: 'Dhaka',
      district: 'Dhanmondi',
      upazila: 'Dhanmondi',
      street: 'House 42, Road 9/A',
      landmark: 'Opposite Dhanmondi Lake',
    },
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    status: 'pending',
    statusTimeline: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 3600000 * 4),
        actor: 'Sarah Khan',
        note: 'Order placed via Cash on Delivery',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    id: 'ord-seed-2',
    orderNumber: 'NOV-2025-104921',
    customerId: 'user-guest-sample',
    customerName: 'Rafiul Islam',
    customerEmail: 'rafiul@example.com',
    customerPhone: '+880 1712 998877',
    items: [
      {
        productId: 'prod-4',
        sku: 'NOV-SHOE-004',
        name: 'Running Shoes',
        price: 69.99,
        salePrice: 69.99,
        effectivePrice: 69.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      },
    ],
    subtotal: 69.99,
    discount: 0,
    shippingFee: 60,
    tax: 0,
    finalTotal: 69.99,
    shippingAddress: {
      name: 'Rafiul Islam',
      phone: '+880 1712 998877',
      division: 'Chittagong',
      district: 'Agrabad',
      upazila: 'Double Mooring',
      street: 'Commercial Area, Block C',
      landmark: 'Near Standard Chartered Bank',
    },
    paymentMethod: 'bkash',
    paymentStatus: 'paid',
    status: 'delivered',
    statusTimeline: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 86400000 * 3),
        actor: 'Rafiul Islam',
        note: 'Order placed via bKash',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000 * 3 + 1800000),
        actor: 'Novara Admin',
        note: 'Payment verified with bKash TXN-99824',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 86400000 * 2),
        actor: 'Tariq Rahman',
        note: 'Dispatched with Paperfly Express',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 86400000 * 1),
        actor: 'Paperfly Courier Rider',
        note: 'Customer signed delivery acknowledgment',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
];
let inMemoryCoupons = JSON.parse(JSON.stringify(INITIAL_COUPONS));

// Price quote & validation (available to guests or authenticated users)
router.post('/quote', async (req: Request, res: Response) => {
  try {
    const { items, couponCode, division = 'Dhaka' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart has no items' });
      return;
    }

    // Verify each item against real product catalog
    const validatedItems: any[] = [];
    for (const item of items) {
      const prod = inMemoryProducts.find((p) => p.id === item.productId || p.slug === item.productId);
      if (!prod) {
        res.status(400).json({ success: false, error: `Product not found: ${item.name || item.productId}` });
        return;
      }

      const unitPrice = getEffectivePrice(prod.price, prod.salePrice);
      validatedItems.push({
        productId: prod.id,
        variantId: item.variantId,
        sku: prod.sku,
        name: prod.name,
        price: prod.price,
        salePrice: prod.salePrice,
        effectivePrice: unitPrice,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        image: prod.images[0]?.url || item.image,
        stock: prod.stock,
      });
    }

    // Lookup coupon
    let couponRule = null;
    if (couponCode) {
      couponRule = inMemoryCoupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    }

    const totals = calculateCartTotals(validatedItems, couponRule, division);

    res.json({
      success: true,
      items: validatedItems,
      ...totals,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Place Order (STRICTLY REQUIRES AUTHENTICATION)
router.post('/place-order', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { items, shippingAddress, paymentMethod = 'cod', couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Cannot place an empty order' });
      return;
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.division || !shippingAddress.street) {
      res.status(400).json({
        success: false,
        error: 'Complete shipping address (name, phone, division, district, street) is required',
      });
      return;
    }

    // Validate inventory and calculate server-side prices
    const orderItemsSnapshot: any[] = [];
    const stockUpdates: { product: any; qty: number }[] = [];

    for (const line of items) {
      const prod = inMemoryProducts.find((p) => p.id === line.productId || p.slug === line.productId);
      if (!prod) {
        res.status(400).json({ success: false, error: `Product ${line.productId} not found` });
        return;
      }

      const requestedQty = Math.max(1, parseInt(line.quantity, 10) || 1);
      if (prod.stock < requestedQty) {
        res.status(400).json({
          success: false,
          error: `Insufficient stock for "${prod.name}". Only ${prod.stock} available.`,
        });
        return;
      }

      const unitPrice = getEffectivePrice(prod.price, prod.salePrice);
      orderItemsSnapshot.push({
        productId: prod.id,
        variantId: line.variantId,
        sku: prod.sku,
        name: prod.name,
        unitPrice,
        quantity: requestedQty,
        total: Math.round(unitPrice * requestedQty * 100) / 100,
        image: prod.images[0]?.url || line.image,
      });

      stockUpdates.push({ product: prod, qty: requestedQty });
    }

    // Coupon lookup
    let couponRule = null;
    if (couponCode) {
      couponRule = inMemoryCoupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    }

    const totals = calculateCartTotals(
      orderItemsSnapshot.map((i) => ({ ...i, price: i.unitPrice, stock: 999 })),
      couponRule,
      shippingAddress.division
    );

    // Atomically decrement stock
    for (const update of stockUpdates) {
      update.product.stock = Math.max(0, update.product.stock - update.qty);
      update.product.salesCount = (update.product.salesCount || 0) + update.qty;
    }

    // Generate unique order number
    const orderNumber = `NOV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: user.userId,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: shippingAddress.phone,
      items: orderItemsSnapshot,
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode: couponRule ? couponRule.code : undefined,
      shippingFee: totals.shippingFee,
      tax: 0,
      finalTotal: totals.finalTotal,
      shippingAddress: {
        name: shippingAddress.name.trim(),
        phone: shippingAddress.phone.trim(),
        division: shippingAddress.division.trim(),
        district: (shippingAddress.district || '').trim(),
        upazila: (shippingAddress.upazila || '').trim(),
        street: shippingAddress.street.trim(),
        landmark: shippingAddress.landmark?.trim(),
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      paymentTransactionId: paymentMethod !== 'cod' ? `TXN-${Date.now()}` : undefined,
      status: 'pending',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date(),
          actor: user.name,
          note: `Order placed via ${paymentMethod.toUpperCase()}`,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryOrders.unshift(newOrder);

    if (isDbConnected()) {
      try {
        await OrderModel.create(newOrder);
      } catch (err: any) {
        console.warn('Failed to persist order to MongoDB Atlas:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      message: `Order #${orderNumber} created successfully!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export { inMemoryOrders, inMemoryCoupons };
export default router;
