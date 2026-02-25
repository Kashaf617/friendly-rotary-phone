'use client';

import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Building2, Search, MoreHorizontal, Crown, Shield } from 'lucide-react';

export default function TenantsPage() {
  const { t } = useI18n();

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await tenantsApi.getAll();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 't1', name: 'Demo Restaurant Dubai', domain: 'demo-restaurant', status: 'active', plan: 'Professional', created_at: new Date().toISOString(), user_count: 8 },
      { id: 't2', name: 'Marina Bay Kitchen', domain: 'marina-bay', status: 'active', plan: 'Starter', created_at: new Date().toISOString(), user_count: 4 },
      { id: 't3', name: 'JBR Seafood House', domain: 'jbr-seafood', status: 'trial', plan: 'Trial', created_at: new Date().toISOString(), user_count: 2 },
      { id: 't4', name: 'Downtown Grill', domain: 'downtown-grill', status: 'active', plan: 'Enterprise', created_at: new Date().toISOString(), user_count: 15 },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-sm text-muted-foreground">Manage all restaurant tenants</p>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
          Add Tenant
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tenants..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Restaurant</th>
                <th className="px-4 py-3 text-left font-medium">Domain</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Users</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(tenants || []).map((tenant: any) => (
                <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{tenant.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tenant.domain}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {tenant.plan === 'Enterprise' && <Crown className="h-3 w-3 text-warning" />}
                      {tenant.plan === 'Professional' && <Shield className="h-3 w-3 text-secondary" />}
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
                        tenant.status === 'active' ? 'bg-accent/10 text-accent' :
                        tenant.status === 'trial' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger',
                      )}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{tenant.user_count ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tenant.created_at ? formatDateTime(tenant.created_at) : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded p-1 hover:bg-muted transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!tenants || tenants.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Building2 className="h-8 w-8 mb-2" />
            <p className="text-sm">No tenants found</p>
          </div>
        )}
      </div>
    </div>
  );
}
