'use client';

import { useQuery } from '@tanstack/react-query';
import { tenantsApi, subscriptionApi } from '@/lib/api';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency } from '@/lib/utils';
import { Building2, Users, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SuperAdminPage() {
  const { data: tenantStats } = useQuery({
    queryKey: ['tenant-stats'],
    queryFn: async () => {
      const res = await tenantsApi.getStats();
      return res.data?.data || res.data;
    },
    placeholderData: { total: 12, active: 10, inactive: 2, trial: 4 },
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async () => {
      const res = await subscriptionApi.getAll();
      return res.data?.data || res.data;
    },
    placeholderData: [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and tenant management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Tenants"
          value={tenantStats?.total || 0}
          subtitle={`${tenantStats?.active || 0} active`}
          icon={Building2}
          color="accent"
        />
        <KpiCard
          title="Active Subscriptions"
          value={tenantStats?.active || 0}
          subtitle="Paid & trial"
          icon={CheckCircle}
          color="secondary"
        />
        <KpiCard
          title="Trial Accounts"
          value={tenantStats?.trial || 0}
          subtitle="14-day trials"
          icon={AlertTriangle}
          color="warning"
        />
        <KpiCard
          title="Monthly Revenue"
          value={formatCurrency(7188)}
          subtitle="Platform subscription revenue"
          icon={TrendingUp}
          color="info"
        />
      </div>

      {/* Tenants Table Placeholder */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-card-foreground">Recent Tenants</h3>
          <a href="/super-admin/tenants" className="text-xs text-accent hover:text-accent-dark">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">Restaurant</th>
                <th className="pb-2 text-left font-medium">Plan</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: 'Demo Restaurant Dubai', plan: 'Professional', status: 'Active', users: 8 },
                { name: 'Marina Bay Kitchen', plan: 'Starter', status: 'Active', users: 4 },
                { name: 'JBR Seafood House', plan: 'Trial', status: 'Trial', users: 2 },
                { name: 'Downtown Grill', plan: 'Enterprise', status: 'Active', users: 15 },
                { name: 'Palm Jumeirah Cafe', plan: 'Trial', status: 'Expired', users: 1 },
              ].map((t, i) => (
                <tr key={i} className="text-xs">
                  <td className="py-2.5 font-medium text-card-foreground">{t.name}</td>
                  <td className="py-2.5 text-muted-foreground">{t.plan}</td>
                  <td className="py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      t.status === 'Active' ? 'bg-accent/10 text-accent' :
                      t.status === 'Trial' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">{t.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
