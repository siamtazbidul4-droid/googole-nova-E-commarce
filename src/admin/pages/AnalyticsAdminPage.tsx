import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Download,
  Calendar,
  CreditCard,
  Package,
} from 'lucide-react';

export const AnalyticsAdminPage: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Gross Sales,$${data.grossSales}\n` +
      `Total Orders,${data.totalOrders}\n` +
      `Average Order Value,$${data.averageOrderValue}\n` +
      `Conversion Rate,${data.conversionRate}\n\n` +
      'Product,Sales,Revenue\n' +
      data.topProducts.map((p: any) => `"${p.name}",${p.sales},$${p.revenue.toFixed(2)}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `novara_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Synthesizing sales ledger & fulfillment telemetry...</p>
      </div>
    );
  }

  const {
    grossSales = 0,
    totalOrders = 0,
    averageOrderValue = 0,
    conversionRate = '3.4%',
    statusCounts = {},
    paymentMethods = {},
    topProducts = [],
    dailyRevenue = [],
  } = data || {};

  const maxDailyRevenue = Math.max(...dailyRevenue.map((d: any) => d.revenue), 100);

  return (
    <div className="space-y-6">
      {/* Top Banner & Export */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Sales Intelligence & Financial Reporting</h2>
          <p className="text-xs text-gray-500">
            Real-time analytics across order receipts, average basket size, and fulfillment velocity.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ml-auto sm:ml-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Revenue</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">${grossSales.toFixed(2)}</div>
          <div className="text-xs text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs prior week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders Processed</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{totalOrders}</div>
          <div className="text-xs text-gray-400 mt-0.5">Single-vendor volume</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Order Value</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">${averageOrderValue.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-0.5">Per checked-out cart</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Checkout Conversion</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-2">{conversionRate}</div>
          <div className="text-xs text-emerald-700 mt-0.5">High basket completion</div>
        </div>
      </div>

      {/* Revenue Trend Visualizer */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">7-Day Revenue Trajectory</h3>
            <p className="text-xs text-gray-500">Daily gross turnover and purchase volumes</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Current Week</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-4 pb-2">
          {dailyRevenue.map((d: any) => {
            const heightPct = Math.max(15, Math.round((d.revenue / maxDailyRevenue) * 100));
            return (
              <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition truncate">
                  ${d.revenue}
                </div>
                <div className="w-full max-w-[48px] bg-emerald-50 rounded-xl relative overflow-hidden flex items-end justify-center p-1 border border-emerald-100 group-hover:bg-emerald-100 transition" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-emerald-800 rounded-lg transition-all duration-500 group-hover:bg-emerald-900"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-gray-600 mt-1">{d.day}</div>
                <div className="text-[10px] text-gray-400">{d.orders} ord</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-column breakdown: Payment Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">Payment Method Distribution</h3>
          </div>

          <div className="space-y-3">
            {[
              { id: 'cod', name: 'Cash on Delivery (COD)', count: paymentMethods.cod || 0, color: 'bg-emerald-600' },
              { id: 'bkash', name: 'bKash / Mobile Financial', count: paymentMethods.bkash || 0, color: 'bg-pink-600' },
              { id: 'card', name: 'Credit / Debit Card', count: paymentMethods.card || 0, color: 'bg-blue-600' },
            ].map((pm) => {
              const total = (paymentMethods.cod || 0) + (paymentMethods.bkash || 0) + (paymentMethods.card || 0) || 1;
              const pct = Math.round((pm.count / total) * 100);

              return (
                <div key={pm.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800">{pm.name}</span>
                    <span className="font-medium text-gray-600">{pm.count} orders ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${pm.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-gray-900">Top Revenue Generators</h3>
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                Checkouts will populate top revenue rankings.
              </div>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="font-bold text-gray-900 truncate">{p.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-gray-900">${p.revenue.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400">{p.sales} units sold</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
