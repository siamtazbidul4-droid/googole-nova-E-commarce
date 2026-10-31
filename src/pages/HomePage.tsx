import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ui/ProductCard';
import { SeedProduct } from '../../server/data/initialData';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  Quote,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<SeedProduct[]>([]);
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, cmsRes] = await Promise.all([
          fetch('/api/products?limit=20'),
          fetch('/api/cms/homepage'),
        ]);

        const prodData = await prodRes.json();
        const cmsData = await cmsRes.json();

        if (prodData.success) setProducts(prodData.data);
        if (cmsData.success) setCms(cmsData.data);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const popularProducts = products.filter((p) => p.isPopular).slice(0, 10);
  const bestSellerProducts = products.filter((p) => p.isBestSeller).slice(0, 5);

  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: <Smartphone className="w-5 h-5 text-gray-700" /> },
    { name: 'Fashion', slug: 'fashion', icon: <Shirt className="w-5 h-5 text-gray-700" /> },
    { name: 'Home & Living', slug: 'home-living', icon: <Home className="w-5 h-5 text-gray-700" /> },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: <Sparkles className="w-5 h-5 text-gray-700" /> },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: <Dumbbell className="w-5 h-5 text-gray-700" /> },
    { name: 'Toys & Games', slug: 'toys-games', icon: <Gamepad2 className="w-5 h-5 text-gray-700" /> },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO BANNER SECTION (Strict Match to Reference Image) */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#edf4f0] via-[#f4f7f5] to-[#fbfaf8] border border-gray-100 overflow-hidden min-h-[500px] lg:min-h-[560px] flex items-center">
          {/* Navigation arrow buttons */}
          <button
            onClick={() => onNavigate('shop')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 z-20 transition"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 z-20 transition"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center p-8 sm:p-14 lg:p-16 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-6 z-10 space-y-6">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                {cms?.heroBanner?.tag || 'NEW ARRIVALS'}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Upgrade Your <br />
                <span className="text-gray-900">Lifestyle</span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-md leading-relaxed">
                {cms?.heroBanner?.subheadline ||
                  'Discover premium quality products designed for a better, smarter and easier life.'}
              </p>

              <div>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-8 py-3.5 rounded-full bg-[#0c3328] hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  <span>{cms?.heroBanner?.buttonText || 'Shop Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Trust Badges below Hero Button */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-emerald-900/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">
                    Premium Quality Products
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">
                    Fast & Reliable Delivery
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">
                    Easy Return & Refund
                  </span>
                </div>
              </div>
            </div>

            {/* Right Lifestyle Photography & Script */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] lg:aspect-[1/1] overflow-hidden rounded-2xl flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80"
                  alt="Upgrade Your Lifestyle Model"
                  className="w-full h-full object-cover object-top rounded-2xl shadow-xl"
                />

                {/* Script overlay matching "Good Things Take Time ♡" */}
                <div className="absolute right-4 top-8 text-right font-serif italic text-white drop-shadow-md select-none">
                  <div className="text-3xl sm:text-4xl text-amber-100 font-normal">Good Things</div>
                  <div className="text-3xl sm:text-4xl text-white font-normal -mt-1">Take Time ♡</div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            <span className="w-6 h-2 rounded-full bg-emerald-700" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SHORTCUTS (6 Circular Icon Tiles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onNavigate('shop', { category: cat.slug })}
              className="flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-gray-50 transition cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100/80 group-hover:bg-emerald-50 group-hover:scale-105 transition flex items-center justify-center shadow-2xs mb-3 border border-gray-100">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-800 text-center group-hover:text-emerald-800 transition">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TWO SPLIT CAMPAIGN CARDS (Smart Tech / Fashion) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Smart Tech (Dark Green) */}
          <div className="relative rounded-3xl bg-[#0c3328] text-white p-8 sm:p-10 overflow-hidden flex flex-col justify-between min-h-[300px] shadow-lg">
            <div className="relative z-10 max-w-xs space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Smart Tech <br />
                Smarter You
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80">
                Latest gadgets. Unbeatable prices.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => onNavigate('shop', { category: 'electronics' })}
                  className="px-6 py-2.5 rounded-full bg-white text-gray-900 font-bold text-xs hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tech photo overlay */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-end justify-end pointer-events-none p-4">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
                alt="Smart Tech Gadgets"
                className="w-full max-h-56 object-contain"
              />
            </div>
          </div>

          {/* Card 2: Fashion (Warm Peach) */}
          <div className="relative rounded-3xl bg-[#fbe7dc] text-gray-900 p-8 sm:p-10 overflow-hidden flex flex-col justify-between min-h-[300px] shadow-lg">
            <div className="relative z-10 max-w-xs space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Fashion <br />
                That Speaks You
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Trendy styles for every mood.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => onNavigate('shop', { category: 'fashion' })}
                  className="px-6 py-2.5 rounded-full bg-[#0c3328] text-white font-bold text-xs hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fashion model photo overlay */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-end justify-end pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"
                alt="Fashion Model"
                className="w-full max-h-64 object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR POPULAR PRODUCTS (2 rows x 5 columns) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Our Popular Products
            </h2>
            <span className="w-8 h-0.5 bg-emerald-700 hidden sm:inline-block" />
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewProduct={(slug) => onNavigate('product', { slug })}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. FULL-WIDTH PROMO CAMPAIGN BANNER (UP TO 50% OFF) */}
      {cms?.promotionalAds?.enabled !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0c261e] via-[#0f3428] to-[#0a2019] text-white overflow-hidden p-8 sm:p-14 shadow-2xl flex items-center min-h-[320px]">
            <div className="relative z-10 max-w-lg space-y-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                {cms?.promotionalAds?.tag || 'LIMITED TIME OFFER'}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {cms?.promotionalAds?.headline || 'UP TO 50% OFF'}
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/80">
                {cms?.promotionalAds?.subheadline || 'On Your Favorite Brands in Bangladesh'}
              </p>
              <div className="pt-4">
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>{cms?.promotionalAds?.buttonText || 'Shop Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scenic electronics lineup image */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 hidden md:flex items-center justify-end p-6 pointer-events-none opacity-90">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"
                alt="Limited time promo devices"
                className="max-h-64 object-contain rounded-xl"
              />
            </div>
          </div>
        </section>
      )}

      {/* 6. BEST SELLERS SECTION (Crown badge & 5 Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Best Sellers
            </h2>
            <span className="w-8 h-0.5 bg-emerald-700 hidden sm:inline-block" />
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {bestSellerProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={(slug) => onNavigate('product', { slug })}
            />
          ))}
        </div>
      </section>

      {/* 7. WHAT OUR CUSTOMERS SAY (Authentic Testimonials from Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            What Our Customers Say
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTestimonialIndex((prev) => (prev > 0 ? prev - 1 : 0))}
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-600 transition"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTestimonialIndex((prev) => (prev < 1 ? prev + 1 : 1))}
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-600 transition"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sarah Khan */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80"
                  alt="Sarah Khan"
                  className="w-12 h-12 rounded-full object-cover border border-emerald-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Sarah Khan</h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>

              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Amazing products and super fast delivery! I'm really happy with my purchase. Highly recommended!"
              </p>
            </div>
            <div className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-50">
              Mar 12, 2025
            </div>
          </div>

          {/* Rafiul Islam */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
                  alt="Rafiul Islam"
                  className="w-12 h-12 rounded-full object-cover border border-emerald-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Rafiul Islam</h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>

              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed italic">
                "The quality is top-notch. Customer service is also excellent. Will definitely shop again!"
              </p>
            </div>
            <div className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-50">
              Mar 8, 2025
            </div>
          </div>

          {/* Tonia Akter */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
                  alt="Tonia Akter"
                  className="w-12 h-12 rounded-full object-cover border border-emerald-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Tonia Akter</h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>

              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Such a beautiful website with a great collection. Easy to order and delivery was on time."
              </p>
            </div>
            <div className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-50">
              Mar 5, 2025
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
