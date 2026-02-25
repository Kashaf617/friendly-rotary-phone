'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, ordersApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { KpiCard } from '@/components/ui/kpi-card';
import { useI18n } from '@/lib/i18n-context';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement,
);

export default function DashboardPage() {
  const { t } = useI18n();
  const { data: kpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await analyticsApi.getDashboard();
      return res.data?.data || res.data;
    },
    // Use placeholder data if API is not connected
    placeholderData: {
      today: { revenue: 12450.00, orders: 47 },
      monthly: { revenue: 324500.00, orders: 1234, vat_collected: 16225.00, avg_order_value: 263.00 },
      staff: { active_employees: 24 },
      currency: 'AED',
    },
  });

  const { data: salesTrend } = useQuery({
    queryKey: ['sales-trend'],
    queryFn: async () => {
      const res = await analyticsApi.getSalesTrend(14);
      return res.data?.data || res.data;
    },
    placeholderData: Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        date: d.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 15000 + 8000),
        order_count: Math.floor(Math.random() * 50 + 20),
      };
    }),
  });

  const { data: topItems } = useQuery({
    queryKey: ['top-items'],
    queryFn: async () => {
      const res = await analyticsApi.getTopItems(6);
      return res.data?.data || res.data;
    },
    placeholderData: [
      { item_name: 'Mixed Grill Platter', total_quantity: 156, total_revenue: 18720 },
      { item_name: 'Chicken Shawarma', total_quantity: 234, total_revenue: 10530 },
      { item_name: 'Lamb Machboos', total_quantity: 98, total_revenue: 8330 },
      { item_name: 'Hummus', total_quantity: 312, total_revenue: 7800 },
      { item_name: 'Fresh Lemon Mint', total_quantity: 289, total_revenue: 5202 },
      { item_name: 'Kunafa', total_quantity: 145, total_revenue: 5075 },
    ],
  });

  const { data: revenueByType } = useQuery({
    queryKey: ['revenue-by-type'],
    queryFn: async () => {
      const res = await analyticsApi.getRevenueByType();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { order_type: 'dine_in', count: 645, revenue: 198500 },
      { order_type: 'takeaway', count: 389, revenue: 87300 },
      { order_type: 'delivery', count: 200, revenue: 38700 },
    ],
  });

  // Chart configs
  const salesChartData = {
    labels: (salesTrend || []).map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue (AED)',
        data: (salesTrend || []).map((d: any) => d.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10B981',
      },
    ],
  };

  const topItemsChartData = {
    labels: (topItems || []).map((i: any) => i.item_name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: (topItems || []).map((i: any) => i.total_quantity),
        backgroundColor: ['#10B981', '#2563EB', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'],
        borderRadius: 6,
      },
    ],
  };

  const orderTypeChartData = {
    labels: (revenueByType || []).map((row: any) =>
      row.order_type === 'dine_in'
        ? t('dashboard.order_type.dine_in')
        : row.order_type === 'takeaway'
          ? t('dashboard.order_type.takeaway')
          : t('dashboard.order_type.delivery')
    ),
    datasets: [
      {
        data: (revenueByType || []).map((row: any) => row.revenue),
        backgroundColor: ['#10B981', '#2563EB', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#E2E8F0',
        bodyColor: '#94A3B8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t('dashboard.kpi.todays_revenue')}
          value={formatCurrency(kpis?.today?.revenue || 0)}
          subtitle={t('dashboard.kpi.todays_revenue_sub')}
          icon={DollarSign}
          color="accent"
          trend={{ value: 12.5, label: t('dashboard.kpi.vs_yesterday') }}
        />
        <KpiCard
          title={t('dashboard.kpi.todays_orders')}
          value={kpis?.today?.orders || 0}
          subtitle={t('dashboard.kpi.todays_orders_sub')}
          icon={ShoppingCart}
          color="secondary"
          trend={{ value: 8.2, label: t('dashboard.kpi.vs_yesterday') }}
        />
        <KpiCard
          title={t('dashboard.kpi.monthly_revenue')}
          value={formatCurrency(kpis?.monthly?.revenue || 0)}
          subtitle={`${t('dashboard.kpi.avg')}: ${formatCurrency(kpis?.monthly?.avg_order_value || 0)}/${t('dashboard.kpi.per_order')}`}
          icon={TrendingUp}
          color="info"
        />
        <KpiCard
          title={t('dashboard.kpi.vat_collected')}
          value={formatCurrency(kpis?.monthly?.vat_collected || 0)}
          subtitle={t('dashboard.kpi.this_month_vat')}
          icon={Receipt}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Trend */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">{t('dashboard.charts.sales_trend')}</h3>
          <div className="h-64">
            <Line data={salesChartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Order Type Distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">{t('dashboard.charts.revenue_by_order_type')}</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={orderTypeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94A3B8', font: { size: 11 }, padding: 15 },
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">{t('dashboard.charts.top_selling_items')}</h3>
        <div className="h-64">
          <Bar data={topItemsChartData} options={chartOptions as any} />
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          title={t('dashboard.kpi.active_employees')}
          value={kpis?.staff?.active_employees || 0}
          subtitle={t('dashboard.kpi.active_employees_sub')}
          icon={Users}
          color="info"
        />
        <KpiCard
          title={t('dashboard.kpi.monthly_orders')}
          value={kpis?.monthly?.orders || 0}
          subtitle={`${kpis?.monthly?.orders || 0} ${t('dashboard.kpi.orders_this_month')}`}
          icon={ShoppingCart}
          color="accent"
        />
      </div>
    </div>
  );
}
