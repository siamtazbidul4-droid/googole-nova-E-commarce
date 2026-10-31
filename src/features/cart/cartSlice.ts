import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { calculateCartTotals, CartItemInput, CouponRule } from '../../utils/ecommerceRules';

export interface CartState {
  items: CartItemInput[];
  coupon: CouponRule | null;
  division: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  finalTotal: number;
  lineItemsCount: number;
  totalQuantity: number;
  couponError: string | null;
  isCartDrawerOpen: boolean;
}

const LOCAL_STORAGE_KEY = 'novara_cart_items_v1';

function loadInitialItems(): CartItemInput[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

const initialItems = typeof window !== 'undefined' ? loadInitialItems() : [];
const initialTotals = calculateCartTotals(initialItems, null, 'Dhaka');

const initialState: CartState = {
  items: initialItems,
  coupon: null,
  division: 'Dhaka',
  subtotal: initialTotals.subtotal,
  discount: initialTotals.discount,
  shippingFee: initialTotals.shippingFee,
  finalTotal: initialTotals.finalTotal,
  lineItemsCount: initialTotals.lineItemsCount,
  totalQuantity: initialTotals.totalQuantity,
  couponError: null,
  isCartDrawerOpen: false,
};

function saveItems(items: CartItemInput[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItemInput>) => {
      const item = action.payload;
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId && (i.variantId || '') === (item.variantId || '')
      );

      if (existingIndex >= 0) {
        const currentQty = state.items[existingIndex].quantity;
        const availableStock = item.stock || state.items[existingIndex].stock || 99;
        state.items[existingIndex].quantity = Math.min(currentQty + item.quantity, availableStock);
      } else {
        const availableStock = item.stock || 99;
        state.items.push({
          ...item,
          quantity: Math.min(item.quantity, availableStock),
        });
      }

      saveItems(state.items);
      const totals = calculateCartTotals(state.items, state.coupon, state.division);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.shippingFee = totals.shippingFee;
      state.finalTotal = totals.finalTotal;
      state.lineItemsCount = totals.lineItemsCount;
      state.totalQuantity = totals.totalQuantity;
      state.couponError = totals.couponError;
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; variantId?: string }>) => {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && (i.variantId || '') === (action.payload.variantId || ''))
      );
      saveItems(state.items);
      const totals = calculateCartTotals(state.items, state.coupon, state.division);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.shippingFee = totals.shippingFee;
      state.finalTotal = totals.finalTotal;
      state.lineItemsCount = totals.lineItemsCount;
      state.totalQuantity = totals.totalQuantity;
      state.couponError = totals.couponError;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; variantId?: string; quantity: number }>
    ) => {
      const { productId, variantId, quantity } = action.payload;
      const index = state.items.findIndex(
        (i) => i.productId === productId && (i.variantId || '') === (variantId || '')
      );

      if (index >= 0) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          const maxStock = state.items[index].stock || 99;
          state.items[index].quantity = Math.min(quantity, maxStock);
        }
      }

      saveItems(state.items);
      const totals = calculateCartTotals(state.items, state.coupon, state.division);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.shippingFee = totals.shippingFee;
      state.finalTotal = totals.finalTotal;
      state.lineItemsCount = totals.lineItemsCount;
      state.totalQuantity = totals.totalQuantity;
      state.couponError = totals.couponError;
    },
    applyCoupon: (state, action: PayloadAction<CouponRule>) => {
      state.coupon = action.payload;
      const totals = calculateCartTotals(state.items, state.coupon, state.division);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.shippingFee = totals.shippingFee;
      state.finalTotal = totals.finalTotal;
      state.couponError = totals.couponError;
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponError = null;
      const totals = calculateCartTotals(state.items, null, state.division);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.shippingFee = totals.shippingFee;
      state.finalTotal = totals.finalTotal;
    },
    setDivision: (state, action: PayloadAction<string>) => {
      state.division = action.payload;
      const totals = calculateCartTotals(state.items, state.coupon, state.division);
      state.shippingFee = totals.shippingFee;
      state.finalTotal = totals.finalTotal;
    },
    toggleCartDrawer: (state, action: PayloadAction<boolean | undefined>) => {
      state.isCartDrawerOpen = action.payload !== undefined ? action.payload : !state.isCartDrawerOpen;
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.couponError = null;
      state.subtotal = 0;
      state.discount = 0;
      state.shippingFee = 0;
      state.finalTotal = 0;
      state.lineItemsCount = 0;
      state.totalQuantity = 0;
      saveItems([]);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  setDivision,
  toggleCartDrawer,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
