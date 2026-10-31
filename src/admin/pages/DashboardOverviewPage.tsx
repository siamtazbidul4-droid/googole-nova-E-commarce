import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewPageProps {
  data: any;
  onNavigateToModule: (module: string) => void;
  onSelectOrder?: (order: any) => void;
  onRestockProduct?: (product: any) => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  data,
  onNavigateToModule,
  onSelectOrder,
  onRestockProduct,
}) => {
  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading operations metrics...</p>
      </div>
    );
  }

  const grossNum = Number(data?.grossSales) || 0;
  const netNum = Number(data?.netSales) || 0;
  const totalOrd = Number(data?.totalOrders) || 0;
  const aovNum = Number(data?.averageOrderValue) || 0;
  const pendingCount = Number(data?.pendingOrders) || 0;
  const lowCount = Number(data?.lowStockCount) || 0;
  const categorySales = data?.categorySales || {};
  const lowStockAlerts = data?.lowStockAlerts || [];
  const recentOrders = data?.recentOrders || [];

  const kpis = [
    {
      label: 'Gross Revenue',
      value: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `Net: $${netNum.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Total Orders',
      value: totalOrd.toString(),
      subtitle: `${pendingCount} awaiting fulfillment`,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Average Order Value',
      value: `$${aovNum.toFixed(2)}`,
      subtitle: 'Across fulfilled baskets',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Low Stock Alerts',
      value: lowCount.toString(),
      subtitle: 'Items at or below threshold',
      icon: AlertTriangle,
      color: lowCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs hover:shadow-xs transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{kpi.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Middle Row: Sales by Category & Low Stock Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Revenue Contribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Sales Distribution by Category</h3>
              <p className="text-xs text-gray-500">Revenue generated across catalog departments</p>
            </div>
            <button
              onClick={() => onNavigateToModule('categories')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Taxonomy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {Object.keys(categorySales).length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-600 bg-gray-50 rounded-xl">
                No orders completed yet. Initial orders will populate department metrics automatically.
              </div>
            ) : (
              Object.entries(categorySales).map(([cat, amount]) => {
                const total = grossNum || 1;
                const amtNum = Number(amount) || 0;
                const pct = Math.min(100, Math.round((amtNum / total) * 100));
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">{cat}</span>
                      <span className="font-medium text-gray-600">
                        ${amtNum.toFixed(2)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Attention Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Inventory Alerts</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {lowStockAlerts.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Products that require restocking to avoid fulfillment cancellations.
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {lowStockAlerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All inventory units are above configured safety thresholds.</span>
                </div>
              ) : (
                lowStockAlerts.slice(0, 4).map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-gray-600 font-mono">SKU: {p.sku}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {p.stock} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToModule('inventory')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Inventory Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Recent Orders Table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-500">Real-time purchase flow and fulfillment state</p>
          </div>
          <button
            onClick={() => onNavigateToModule('orders')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>All Orders ({totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-y border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No orders registered yet. New customer checkouts will appear here instantly.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord: any) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-900 border-amber-200',
                    confirmed: 'bg-blue-100 text-blue-900 border-blue-200',
                    processing: 'bg-indigo-100 text-indigo-900 border-indigo-200',
                    shipped: 'bg-purple-100 text-purple-900 border-purple-200',
                    delivered: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                    cancelled: 'bg-rose-100 text-rose-900 border-rose-200',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">{ord.customerName}</div>
                        <div className="text-[11px] text-gray-500">{ord.shippingAddress?.division || 'Dhaka'}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {ord.items?.length || 1} item{ord.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        ${(ord.finalTotal || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                            statusColors[ord.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            if (onSelectOrder) onSelectOrder(ord);
                            else onNavigateToModule('orders');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
