import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/ui/uiSlice';
import { openAuthModal } from '../features/auth/authSlice';
import { addToast } from '../features/toast/toastSlice';
import { ProductCard } from '../components/ui/ProductCard';
import { SeedProduct } from '../../server/data/initialData';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigateToShop: () => void;
  onNavigateToCheckout: () => void;
  onViewProduct: (slug: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigateToShop,
  onNavigateToCheckout,
  onViewProduct,
}) => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.ui.wishlistProductIds);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<SeedProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [relatedProducts, setRelatedProducts] = useState<SeedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<{ average: number; total: number; distribution: Record<number, number> }>({
    average: 5,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          setSelectedImageIndex(0);
          setQuantity(1);
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariantId(data.data.variants[0].id);
          }

          // Fetch reviews
          const revRes = await fetch(`/api/reviews/${data.data.id}`);
          const revData = await revRes.json();
          if (revData.success) {
            setReviews(revData.data);
            setReviewStats({
              average: revData.average,
              total: revData.total,
              distribution: revData.distribution,
            });
          }

          // Fetch related products in same category
          const relRes = await fetch(`/api/products?category=${data.data.category}&limit=5`);
          const relData = await relRes.json();
          if (relData.success) {
            setRelatedProducts(relData.data.filter((p: SeedProduct) => p.id !== data.data.id));
          }
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <button
          onClick={onNavigateToShop}
          className="mt-4 px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      dispatch(addToast({ type: 'warning', message: 'Item is out of stock' }));
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        variantId: selectedVariantId,
        sku: product.sku,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        quantity,
        image: product.images[selectedImageIndex]?.url || product.images[0]?.url,
        stock: product.stock,
      })
    );

    dispatch(
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${quantity}x ${product.name} added to your shopping cart.`,
      })
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onNavigateToCheckout();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(
        addToast({
          type: 'info',
          title: 'Account Required',
          message: 'Please sign in to submit a verified customer review.',
        })
      );
      dispatch(openAuthModal({ mode: 'login' }));
      return;
    }

    if (!newComment.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please write a review comment.' }));
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('novara_auth_token_v1') || ''}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      dispatch(addToast({ type: 'success', title: 'Review Published', message: data.message }));
      setReviews([data.data, ...reviews]);
      setNewComment('');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.message }));
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 font-medium">
        <button onClick={() => onNavigateToShop()} className="hover:text-emerald-800">
          Home
        </button>{' '}
        /{' '}
        <button onClick={() => onNavigateToShop()} className="hover:text-emerald-800">
          {product.category}
        </button>{' '}
        / <span className="text-gray-900 font-semibold">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Media Gallery (Left 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-[#f8faf9] rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-6 shadow-xs">
            {product.badge && (
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white z-10">
                {product.badge}
              </span>
            )}
            <img
              src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-18 rounded-xl border-2 overflow-hidden shrink-0 transition bg-white p-1 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-emerald-700 shadow-sm'
                      : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={product.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Identity & Purchase Panel (Right 6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1.5">
              {product.brand}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="text-xs text-gray-400 mt-1">SKU: {product.sku}</div>

            {/* Stars & review summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.ratingAverage)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">
                {product.ratingAverage.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({product.reviewCount} customer reviews)
              </span>
            </div>
          </div>

          {/* Price display */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  ${effectivePrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                All taxes included. Free shipping on orders over $50.
              </p>
            </div>

            <div className="text-right">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Variants selector (if configured) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Select Option / Color
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      selectedVariantId === v.id
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-200 text-gray-700 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="p-2 hover:bg-gray-200 text-gray-700 disabled:opacity-30 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/15 cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => dispatch(toggleWishlist(product.id))}
              className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                isWishlisted
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Dhaka 24-48h Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{product.warranty || '1 Year Official Warranty'}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Cash on Delivery Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="pt-8 border-t border-gray-100">
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'desc'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'specs'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p className="text-sm leading-relaxed">{product.description}</p>
            {product.shortDescription && (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                {product.shortDescription}
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-w-2xl">
            <table className="w-full text-xs text-left">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-500 bg-gray-50 w-1/3">Brand</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{product.brand}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-500 bg-gray-50">Category</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{product.category}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-500 bg-gray-50">SKU</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{product.sku}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-500 bg-gray-50">Warranty</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{product.warranty || 'Standard 1 Year'}</td>
                </tr>
                {product.attributes &&
                  Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-semibold text-gray-500 bg-gray-50">{key}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Reviews with authentic rating histogram & submission */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Rating distribution summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 items-center">
              <div className="md:col-span-4 text-center md:text-left space-y-1">
                <div className="text-4xl font-extrabold text-gray-900">
                  {reviewStats.average.toFixed(1)}
                </div>
                <div className="flex justify-center md:justify-start text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(reviewStats.average)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Based on {reviewStats.total} customer {reviewStats.total === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              {/* Histogram bars */}
              <div className="md:col-span-8 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewStats.distribution[stars] || 0;
                  const pct = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-10 text-gray-600 font-medium">{stars} star</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-400 font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit a review form */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Write a Customer Review</h3>
              <p className="text-xs text-gray-500 mb-4">
                Share your honest feedback. Reviews from verified buyers display an authentic badge.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating ? 'fill-amber-400' : 'text-gray-200 fill-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{newRating} Stars</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Review</label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="How does this item perform? Comfort, battery life, fabric quality..."
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-700 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No customer reviews yet. Be the first to review this product!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {rev.userName[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{rev.userName}</div>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400">{rev.createdAt}</div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">
            Related Products in {product.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onViewProduct={onViewProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
