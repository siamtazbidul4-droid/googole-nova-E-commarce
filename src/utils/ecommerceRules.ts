/**
 * NOVARA COMMERCE — Core E-commerce Business Logic & Rules
 * Pure functions decoupled from React & Express for fast, deterministic unit testing.
 */

export interface CartItemInput {
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface CouponRule {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

/**
 * Valid allowed transitions for order lifecycle
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['returned'],
  returned: ['refunded'],
  cancelled: [],
  refunded: [],
};

/**
 * Validate order state machine transition
 */
export function isValidOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  const allowed = ALLOWED_ORDER_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

/**
 * Calculate effective unit price
 */
export function getEffectivePrice(basePrice: number, salePrice?: number): number {
  if (typeof salePrice === 'number' && salePrice > 0 && salePrice < basePrice) {
    return salePrice;
  }
  return basePrice;
}

/**
 * Calculate cart line totals
 */
export function calculateCartTotals(items: CartItemInput[], coupon?: CouponRule | null, division: string = 'Dhaka') {
  const lineItemsCount = items.length; // unique line items count for badge
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = getEffectivePrice(item.price, item.salePrice);
    return sum + unitPrice * item.quantity;
  }, 0);

  // Bangladesh shipping fee: Dhaka division 60 BDT, outside Dhaka 120 BDT. Free over 5000 BDT or $50
  const isFreeShipping = subtotal >= 5000;
  const standardShipping = division.toLowerCase().includes('dhaka') ? 60 : 120;
  const shippingFee = isFreeShipping || items.length === 0 ? 0 : standardShipping;

  let discount = 0;
  let couponError: string | null = null;

  if (coupon) {
    const now = new Date().toISOString();
    if (!coupon.isActive) {
      couponError = 'Coupon is not active';
    } else if (now < coupon.validFrom || now > coupon.validTo) {
      couponError = 'Coupon has expired or is not yet valid';
    } else if (subtotal < coupon.minOrderAmount) {
      couponError = `Minimum order amount of ৳${coupon.minOrderAmount} required for this coupon`;
    } else {
      if (coupon.discountType === 'percentage') {
        const rawDiscount = (subtotal * coupon.discountValue) / 100;
        discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
    }
  }

  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shippingFee,
    finalTotal: Math.round(finalTotal * 100) / 100,
    lineItemsCount,
    totalQuantity,
    couponError,
    isFreeShipping,
  };
}

/**
 * Merge guest cart into customer cart without duplicates
 */
export function mergeCartLines(
  existingItems: CartItemInput[],
  incomingItems: CartItemInput[]
): CartItemInput[] {
  const merged = [...existingItems];

  for (const inc of incomingItems) {
    const existingIndex = merged.findIndex(
      (m) => m.productId === inc.productId && (m.variantId || '') === (inc.variantId || '')
    );

    if (existingIndex >= 0) {
      // Sum quantity, capped at available stock
      const newQty = Math.min(merged[existingIndex].quantity + inc.quantity, inc.stock);
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: Math.max(1, newQty),
        stock: inc.stock, // keep freshest stock
      };
    } else {
      merged.push({
        ...inc,
        quantity: Math.min(inc.quantity, inc.stock),
      });
    }
  }

  return merged;
}

/**
 * Normalize search terms for English and Bangla cross-lingual discovery
 */
export const BANGLA_SYNONYM_MAP: Record<string, string[]> = {
  'মোটিভেশনাল': ['motivational', 'self-help', 'inspiration', 'book'],
  'বই': ['book', 'books', 'literature', 'novel'],
  'হেডফোন': ['headphone', 'headphones', 'earbuds', 'audio', 'wireless'],
  'ঘড়ি': ['watch', 'smartwatch', 'smart watch', 'fitness tracker'],
  'ঘড়ি': ['watch', 'smartwatch', 'smart watch', 'fitness tracker'],
  'ল্যাপটপ': ['laptop', 'computer', 'notebook', 'pro'],
  'জুতো': ['shoes', 'running shoes', 'sneakers', 'footwear'],
  'জুতা': ['shoes', 'running shoes', 'sneakers', 'footwear'],
  'শার্ট': ['shirt', 't-shirt', 'tee', 'apparel', 'fashion'],
  'টি শার্ট': ['t-shirt', 'tshirt', 'tee', 'mens t-shirt'],
  'স্কিনকেয়ার': ['skincare', 'beauty', 'cream', 'serum', 'lotion'],
  'ব্যাগ': ['bag', 'backpack', 'leather', 'wallet'],
  'জ্যাকেট': ['jacket', 'coat', 'winter', 'mens jacket'],
  'সানগ্লাস': ['sunglasses', 'glasses', 'eyewear', 'shades'],
  'গেম': ['game', 'gaming', 'controller', 'joystick', 'console'],
};

export function expandSearchQuery(rawQuery: string): string[] {
  const cleaned = rawQuery.trim().toLowerCase();
  if (!cleaned) return [];

  const tokens = cleaned.split(/\s+/);
  const terms = new Set<string>([cleaned]);

  for (const token of tokens) {
    terms.add(token);
    if (BANGLA_SYNONYM_MAP[token]) {
      for (const syn of BANGLA_SYNONYM_MAP[token]) {
        terms.add(syn);
      }
    }
  }

  return Array.from(terms);
}
