import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToast } from '../../features/toast/toastSlice';
import {
  Sparkles,
  Save,
  Truck,
  Image as ImageIcon,
  Layout,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface CmsAdminPageProps {
  cmsData: any;
  onRefresh: () => void;
}

export const CmsAdminPage: React.FC<CmsAdminPageProps> = ({ cmsData, onRefresh }) => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  const [announcementText, setAnnouncementText] = useState('');
  const [guaranteeText, setGuaranteeText] = useState('');
  const [supportText, setSupportText] = useState('');

  // Hero banner
  const [heroTag, setHeroTag] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [heroModelScript, setHeroModelScript] = useState('');

  // Promotional Banner
  const [promoTag, setPromoTag] = useState('');
  const [promoHeadline, setPromoHeadline] = useState('');
  const [promoSubheadline, setPromoSubheadline] = useState('');
  const [promoButtonText, setPromoButtonText] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cmsData) {
      setAnnouncementText(cmsData.announcementBar?.freeShippingText || 'Free shipping on orders over $50');
      setGuaranteeText(cmsData.announcementBar?.guaranteeText || '30 Days Money Back Guarantee');
      setSupportText(cmsData.announcementBar?.supportText || '24/7 Customer Support');

      setHeroTag(cmsData.heroBanner?.tag || 'NEW ARRIVALS');
      setHeroHeadline(cmsData.heroBanner?.headline || 'Upgrade Your\nLifestyle');
      setHeroSubheadline(cmsData.heroBanner?.subheadline || 'Discover premium quality products designed for a better, smarter and easier life.');
      setHeroButtonText(cmsData.heroBanner?.buttonText || 'Shop Now');
      setHeroModelScript(cmsData.heroBanner?.modelScript || 'Good Things\nTake Time ♡');

      setPromoTag(cmsData.promotionalAds?.tag || 'LIMITED TIME OFFER');
      setPromoHeadline(cmsData.promotionalAds?.headline || 'UP TO 50% OFF');
      setPromoSubheadline(cmsData.promotionalAds?.subheadline || 'On Your Favorite Brands');
      setPromoButtonText(cmsData.promotionalAds?.buttonText || 'Shop Now');
    }
  }, [cmsData]);

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        announcementBar: {
          enabled: true,
          freeShippingText: announcementText,
          guaranteeText: guaranteeText,
          supportText: supportText,
        },
        heroBanner: {
          ...cmsData?.heroBanner,
          tag: heroTag,
          headline: heroHeadline,
          subheadline: heroSubheadline,
          buttonText: heroButtonText,
          modelScript: heroModelScript,
        },
        promotionalAds: {
          ...cmsData?.promotionalAds,
          tag: promoTag,
          headline: promoHeadline,
          subheadline: promoSubheadline,
          buttonText: promoButtonText,
        },
      };

      const res = await fetch('/api/cms/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update CMS');

      dispatch(
        addToast({
          type: 'success',
          title: 'CMS Updated',
          message: 'Homepage banners and announcement texts saved to live storefront.',
        })
      );

      onRefresh();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.message }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveCMS} className="space-y-6">
      {/* Top action header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Content Management & Homepage Promotions</h2>
          <p className="text-xs text-gray-500">
            Edit live announcement bar messages, hero banners, and promotional discount headlines.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ml-auto sm:ml-0"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Homepage CMS</span>
        </button>
      </div>

      {/* 1. Announcement Bar Section */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Truck className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Top Announcement Bar (ShopMax Header)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Free Shipping Headline
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Guarantee Badge Text
            </label>
            <input
              type="text"
              value={guaranteeText}
              onChange={(e) => setGuaranteeText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Customer Support Text
            </label>
            <input
              type="text"
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Hero Slide */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Layout className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Primary Homepage Hero Slide
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category / Pill Tag</label>
            <input
              type="text"
              value={heroTag}
              onChange={(e) => setHeroTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Call To Action Button</label>
            <input
              type="text"
              value={heroButtonText}
              onChange={(e) => setHeroButtonText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Headline Text</label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Subheadline Description</label>
            <textarea
              rows={2}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Model Script Text Overlay</label>
            <input
              type="text"
              value={heroModelScript}
              onChange={(e) => setHeroModelScript(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>
        </div>
      </div>

      {/* 3. Middle Promotional Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Mid-Page Promotional Banner (50% Off Banner)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Offer Tag</label>
            <input
              type="text"
              value={promoTag}
              onChange={(e) => setPromoTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">CTA Button</label>
            <input
              type="text"
              value={promoButtonText}
              onChange={(e) => setPromoButtonText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Banner Headline</label>
            <input
              type="text"
              value={promoHeadline}
              onChange={(e) => setPromoHeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Banner Subheadline</label>
            <input
              type="text"
              value={promoSubheadline}
              onChange={(e) => setPromoSubheadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-800"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
