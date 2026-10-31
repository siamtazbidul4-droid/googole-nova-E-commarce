import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { addToast } from '../../features/toast/toastSlice';
import {
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export interface AdminNavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

interface AdminSidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onGoToStorefront: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  onGoToStorefront,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const navSections: AdminNavSection[] = [
    {
      title: 'CORE',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'CATALOG & INVENTORY',
      items: [
        {
          id: 'products',
          label: 'Products Catalog',
          icon: Package,
        },
        {
          id: 'categories',
          label: 'Categories',
          icon: Layers,
        },
        {
          id: 'inventory',
          label: 'Inventory & Stock',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
      ],
    },
    {
      title: 'SALES & CUSTOMERS',
      items: [
        {
          id: 'orders',
          label: 'Orders & Fulfillment',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: Users,
        },
        {
          id: 'reviews',
          label: 'Reviews Moderation',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'MARKETING & GROWTH',
      items: [
        {
          id: 'coupons',
          label: 'Coupons & Discounts',
          icon: Tag,
        },
        {
          id: 'cms',
          label: 'CMS & Promotions',
          icon: Sparkles,
        },
        {
          id: 'analytics',
          label: 'Reports & Analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          id: 'settings',
          label: 'System & Integrations',
          icon: Settings,
        },
      ],
    },
  ];

  const handleSignOut = () => {
    dispatch(logout());
    dispatch(addToast({ type: 'info', title: 'Signed Out', message: 'Admin session concluded successfully.' }));
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      aria-label="Admin Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div
          onClick={() => onSelectModule('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden group"
          title="Novara Admin Console"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                <span>NOVARA</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Operations Platform</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </h3>
            ) : (
              <div className="h-2" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 cursor-pointer group relative ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                        : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Active Indicator Pip */}
                    {isCollapsed && isActive && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Live Storefront Link & Admin Session Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <button
          onClick={onGoToStorefront}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40 transition cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title="Return to Public Storefront"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ExternalLink className="w-4 h-4 shrink-0 text-emerald-400" />
            {!isCollapsed && <span className="truncate">Live Storefront</span>}
          </div>
          {!isCollapsed && <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">View</span>}
        </button>

        {/* User Card */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/50 border border-slate-800 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-emerald-400 capitalize truncate">{user?.role?.replace('_', ' ') || 'Staff'}</div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
