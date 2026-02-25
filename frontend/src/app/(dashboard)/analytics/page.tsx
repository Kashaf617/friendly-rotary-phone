'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n-context';
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const { t } = useI18n();

  const { data: salesTrend } = useQuery({
    queryKey: ['analytics-sales-trend'],
    queryFn: async () => {
      const res = await analyticsApi.getSalesTrend(14);
      return res.data?.data || res.data;
    },
    placeholderData: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
      revenue: Math.floor(Math.random() * 15000 + 8000),
      order_count: Math.floor(Math.random() * 60 + 10),
    })),
  });

  const { data: revenueByType } = useQuery({
    queryKey: ['analytics-revenue-type'],
    queryFn: async () => {
      const res = await analyticsApi.getRevenueByType();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { order_type: 'dine_in', revenue: 198500 },
      { order_type: 'takeaway', revenue: 87300 },
      { order_type: 'delivery', revenue: 38700 },
    ],
  });

  const { data: topItems } = useQuery({
    queryKey: ['analytics-top-items'],
    queryFn: async () => {
      const res = await analyticsApi.getTopItems(6);
      return res.data?.data || res.data;
    },
    placeholderData: [
      { item_name: 'Mixed Grill Platter', total_quantity: 156 },
      { item_name: 'Chicken Shawarma', total_quantity: 234 },
      { item_name: 'Lemon Mint', total_quantity: 289 },
      { item_name: 'Kunafa', total_quantity: 145 },
    ],
  });

  const salesData = {
    labels: (salesTrend || []).map((d: any) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: t('analytics_page.sales_trend'),
        data: (salesTrend || []).map((d: any) => d.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueData = {
    labels: (revenueByType || []).map((r: any) =>
      r.order_type === 'dine_in' ? t('orders.order_type.dine_in') : r.order_type === 'takeaway' ? t('orders.order_type.takeaway') : t('orders.order_type.delivery'),
    ),
    datasets: [
      {
        data: (revenueByType || []).map((r: any) => r.revenue),
        borderColor: ['#10B981', '#2563EB', '#F59E0B'],
        backgroundColor: ['rgba(16,185,129,0.2)', 'rgba(37,99,235,0.2)', 'rgba(245,158,11,0.2)'],
      },
    ],
  };

  const topItemsData = {
    labels: (topItems || []).map((i: any) => i.item_name),
    datasets: [
      {
        label: t('analytics_page.top_items'),
        data: (topItems || []).map((i: any) => i.total_quantity),
        backgroundColor: '#2563EB',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('analytics_page.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('analytics_page.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">{t('analytics_page.sales_trend')}</h3>
          <div className="h-64">
            <Line data={salesData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">{t('analytics_page.revenue_breakdown')}</h3>
          <div className="h-64">
            <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">{t('analytics_page.top_items')}</h3>
        <div className="h-64">
          <Bar data={topItemsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}
