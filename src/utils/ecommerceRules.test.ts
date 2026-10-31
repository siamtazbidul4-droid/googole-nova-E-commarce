import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  getEffectivePrice,
  isValidOrderTransition,
  mergeCartLines,
  expandSearchQuery,
  type CartItemInput,
  type CouponRule,
} from './ecommerceRules';

test('getEffectivePrice returns salePrice if lower than basePrice', () => {
  assert.equal(getEffectivePrice(100, 80), 80);
  assert.equal(getEffectivePrice(100, 120), 100);
  assert.equal(getEffectivePrice(100, undefined), 100);
  assert.equal(getEffectivePrice(100, 0), 100);
});

test('calculateCartTotals calculates subtotal, shipping, and discount correctly', () => {
  const items: CartItemInput[] = [
    {
      productId: 'p1',
      sku: 'SKU-1',
      name: 'Wireless Earbuds',
      price: 50,
      salePrice: 40,
      quantity: 2,
      image: '/test.jpg',
      stock: 10,
    },
    {
      productId: 'p2',
      sku: 'SKU-2',
      name: 'Men T-shirt',
      price: 25,
      quantity: 1,
      image: '/test.jpg',
      stock: 5,
    },
  ];

  // subtotal: (40 * 2) + (25 * 1) = 105
  // Dhaka shipping: 60 (subtotal < 5000)
  // lineItemsCount: 2
  const result = calculateCartTotals(items, null, 'Dhaka');
  assert.equal(result.subtotal, 105);
  assert.equal(result.shippingFee, 60);
  assert.equal(result.finalTotal, 165);
  assert.equal(result.lineItemsCount, 2);
  assert.equal(result.totalQuantity, 3);
});

test('calculateCartTotals applies percentage coupon with cap', () => {
  const items: CartItemInput[] = [
    {
      productId: 'p1',
      sku: 'SKU-1',
      name: 'Smart Watch',
      price: 1000,
      quantity: 2,
      image: '/test.jpg',
      stock: 10,
    },
  ];

  const coupon: CouponRule = {
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20, // 20% of 2000 = 400
    minOrderAmount: 500,
    maxDiscount: 300, // capped at 300
    validFrom: '2020-01-01',
    validTo: '2030-01-01',
    isActive: true,
  };

  const result = calculateCartTotals(items, coupon, 'Dhaka');
  assert.equal(result.subtotal, 2000);
  assert.equal(result.discount, 300);
  assert.equal(result.shippingFee, 60);
  assert.equal(result.finalTotal, 1760);
});

test('isValidOrderTransition rejects invalid status jumps', () => {
  assert.equal(isValidOrderTransition('pending', 'confirmed'), true);
  assert.equal(isValidOrderTransition('confirmed', 'processing'), true);
  assert.equal(isValidOrderTransition('processing', 'shipped'), false); // must go to packed first
  assert.equal(isValidOrderTransition('cancelled', 'delivered'), false);
  assert.equal(isValidOrderTransition('delivered', 'returned'), true);
});

test('mergeCartLines combines duplicates and respects stock caps', () => {
  const existing: CartItemInput[] = [
    {
      productId: 'p1',
      variantId: 'v1',
      sku: 'SKU-A',
      name: 'Shoes',
      price: 100,
      quantity: 2,
      image: '',
      stock: 5,
    },
  ];

  const incoming: CartItemInput[] = [
    {
      productId: 'p1',
      variantId: 'v1',
      sku: 'SKU-A',
      name: 'Shoes',
      price: 100,
      quantity: 4,
      image: '',
      stock: 5,
    },
    {
      productId: 'p2',
      sku: 'SKU-B',
      name: 'Hat',
      price: 20,
      quantity: 1,
      image: '',
      stock: 10,
    },
  ];

  const merged = mergeCartLines(existing, incoming);
  assert.equal(merged.length, 2);
  // capped at stock 5
  assert.equal(merged[0].quantity, 5);
  assert.equal(merged[1].quantity, 1);
});

test('expandSearchQuery handles Bangla to English mapping', () => {
  const tokens = expandSearchQuery('বই');
  assert.ok(tokens.includes('বই'));
  assert.ok(tokens.includes('book'));
  assert.ok(tokens.includes('literature'));
});
