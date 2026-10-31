import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { addToast } from '../../features/toast/toastSlice';
import {
  X,
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  MessageSquare,
  Tag,
  Sparkles,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  onGoToStorefront: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({
  isOpen,
  onClose,
  currentModule,
  onSelectModule,
  onGoToStorefront,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleSelect = (moduleId: string) => {
    onSelectModule(moduleId);
    onClose();
  };

  const handleSignOut = () => {
    dispatch(logout());
    onClose();
    dispatch(addToast({ type: 'info', title: 'Signed Out', message: 'Admin session closed.' }));
  };

  const navItems = [
    { section: 'CORE', items: [{ id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard }] },
    {
      section: 'CATALOG & INVENTORY',
      items: [
        { id: 'products', label: 'Products Catalog', icon: Package },
        { id: 'categories', label: 'Categories', icon: Layers },
        {
          id: 'inventory',
          label: 'Inventory & Stock',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} alerts` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
      ],
    },
    {
      section: 'SALES & OPERATIONS',
      items: [
        {
          id: 'orders',
          label: 'Orders & Fulfillment',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'reviews', label: 'Reviews Moderation', icon: MessageSquare },
      ],
    },
    {
      section: 'MARKETING & GROWTH',
      items: [
        { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
        { id: 'cms', label: 'CMS & Promotions', icon: Sparkles },
        { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      section: 'CONFIGURATION',
      items: [{ id: 'settings', label: 'System & Integrations', icon: Settings }],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-200 flex flex-col h-full shadow-2xl z-10">
        {/* Top bar with close button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>NOVARA</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Mobile Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navItems.map((group) => (
            <div key={group.section} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.section}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
          <button
            onClick={() => {
              onClose();
              onGoToStorefront();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-950/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>Back to Storefront</span>
            </div>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded">Exit</span>
          </button>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-emerald-400 capitalize truncate">{user?.role?.replace('_', ' ') || 'Staff'}</div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
