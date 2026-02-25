'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
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

export default function SuperAdminAnalyticsPage() {
  const { t } = useI18n();

  const { data: platformRevenue } = useQuery({
    queryKey: ['analytics-platform-revenue'],
    queryFn: async () => {
      const res = await analyticsApi.getSalesTrend(30);
      return res.data?.data || res.data;
    },
    placeholderData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
      revenue: Math.floor(Math.random() * 50000 + 20000),
      order_count: Math.floor(Math.random() * 200 + 50),
    })),
  });

  const { data: tenantGrowth } = useQuery({
    queryKey: ['analytics-tenant-growth'],
    queryFn: async () => {
      const res = await analyticsApi.getRevenueByType();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { order_type: 'new_tenants', count: 12 },
      { order_type: 'churned_tenants', count: 2 },
      { order_type: 'trial_conversions', count: 8 },
    ],
  });

  const revenueData = {
    labels: (platformRevenue || []).map((d: any) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Platform Revenue',
        data: (platformRevenue || []).map((d: any) => d.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const growthData = {
    labels: (tenantGrowth || []).map((r: any) => r.order_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())),
    datasets: [
      {
        label: 'Count',
        data: (tenantGrowth || []).map((r: any) => r.count),
        backgroundColor: ['#10B981', '#2563EB', '#F59E0B'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground">System-wide metrics and trends</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Revenue (30 days)</h3>
          <div className="h-64">
            <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Tenant Growth</h3>
          <div className="h-64">
            <Bar data={growthData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Key Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Tenants" value="12" subtitle="+2 this month" color="text-accent" />
          <MetricCard title="Active Subscriptions" value="10" subtitle="8 paid, 2 trial" color="text-secondary" />
          <MetricCard title="MRR" value={formatCurrency(7188)} subtitle="Monthly recurring" color="text-warning" />
          <MetricCard title="Avg Revenue/Tenant" value={formatCurrency(599)} subtitle="Enterprise tier" color="text-info" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
