import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { addToast } from '../../features/toast/toastSlice';
import {
  Menu,
  Search,
  ExternalLink,
  Plus,
  Database,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
  Bell,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface AdminTopbarProps {
  onToggleMobileMenu: () => void;
  currentModule: string;
  onGoToStorefront: () => void;
  onQuickAddProduct?: () => void;
  systemStatus?: any;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

const MODULE_TITLES: Record<string, { title: string; category: string; description: string }> = {
  dashboard: {
    title: 'Operations Overview',
    category: 'Core',
    description: 'Real-time sales velocity, fulfillment KPIs, and inventory health.',
  },
  products: {
    title: 'Catalog & Products',
    category: 'Catalog',
    description: 'Manage items, pricing, SKUs, inventory levels, and badges.',
  },
  categories: {
    title: 'Store Categories',
    category: 'Catalog',
    description: 'Configure hierarchical navigation taxonomy and display order.',
  },
  inventory: {
    title: 'Inventory & Stock Control',
    category: 'Stock',
    description: 'Real-time stock audits, low-stock alerts, and restocking logs.',
  },
  orders: {
    title: 'Orders & Fulfillment',
    category: 'Sales',
    description: 'Fulfill customer purchases across the lifecycle state machine.',
  },
  customers: {
    title: 'Customer Directory',
    category: 'Sales',
    description: 'View customer accounts, lifetime order values, and delivery areas.',
  },
  reviews: {
    title: 'Customer Reviews Moderation',
    category: 'Sales',
    description: 'Review and moderate verified purchaser feedback.',
  },
  coupons: {
    title: 'Coupons & Discount Codes',
    category: 'Marketing',
    description: 'Manage promotion codes, minimum spend caps, and expiry dates.',
  },
  cms: {
    title: 'CMS & Promotional Banners',
    category: 'Marketing',
    description: 'Update announcement messages, hero slides, and marketing banners.',
  },
  analytics: {
    title: 'Reports & Business Analytics',
    category: 'Marketing',
    description: 'Detailed revenue trends, category breakdown, and export data.',
  },
  settings: {
    title: 'System & Integrations',
    category: 'Configuration',
    description: 'MongoDB Atlas connectivity, Cloudinary, Resend, and store settings.',
  },
};

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onToggleMobileMenu,
  currentModule,
  onGoToStorefront,
  onQuickAddProduct,
  systemStatus,
  onRefreshData,
  isRefreshing = false,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const info = MODULE_TITLES[currentModule] || {
    title: 'Admin Management',
    category: 'Operations',
    description: 'Novara Commerce administrative panel.',
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    dispatch(logout());
    dispatch(addToast({ type: 'info', title: 'Signed Out', message: 'You have exited the admin session.' }));
  };

  const isDbOnline = Boolean(systemStatus?.mongodb?.connected);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      {/* Left: Mobile hamburger + Breadcrumb info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium truncate">
            <span>Admin</span>
            <span>/</span>
            <span className="text-gray-700">{info.category}</span>
            <span>/</span>
            <span className="text-emerald-800 font-semibold">{info.title}</span>
          </nav>
          <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
            {info.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Database status, Storefront link, Admin User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync</span>
          </button>
        )}

        {/* Database Status indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${
            isDbOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          title={isDbOnline ? 'Connected to MongoDB Atlas' : 'In-Memory fallback with seed catalog'}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>{isDbOnline ? 'Atlas Online' : 'Active Catalog'}</span>
        </div>

        {/* Quick Add Product button */}
        {onQuickAddProduct && (
          <button
            onClick={onQuickAddProduct}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Item</span>
          </button>
        )}

        {/* Live Storefront quick link */}
        <button
          onClick={onGoToStorefront}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer"
          title="Switch to customer storefront"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Storefront</span>
        </button>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer border border-transparent hover:border-gray-200"
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-gray-800">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-emerald-700 capitalize font-medium">{user?.role?.replace('_', ' ') || 'Staff'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Dropdown Card */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-xs font-bold text-gray-900">{user?.name || 'Admin User'}</div>
                <div className="text-[11px] text-gray-500 truncate">{user?.email || 'admin@novara.com'}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>{user?.role ? user.role.toUpperCase() : 'SUPER_ADMIN'}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onGoToStorefront();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition text-left cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>Go to Customer Storefront</span>
                </button>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
