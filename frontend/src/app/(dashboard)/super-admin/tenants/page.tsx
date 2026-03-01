'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Building2, Search, MoreHorizontal, Crown, Shield } from 'lucide-react';

export default function TenantsPage() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: (data: any) => tenantsApi.create(data),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.alert('Tenant created successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      if (typeof window !== 'undefined') {
        window.alert(error.response?.data?.message || 'Failed to create tenant');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.alert('Tenant deleted successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error: any) => {
      if (typeof window !== 'undefined') {
        window.alert(error.response?.data?.message || 'Failed to delete tenant');
      }
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-sm text-muted-foreground">Manage all restaurant tenants</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
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
                    <button
                      onClick={() => handleDelete(tenant.id, tenant.name)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === tenant.id}
                      className="rounded p-1 hover:bg-muted transition-colors disabled:opacity-50"
                    >
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
      {isModalOpen && (
        <AddTenantModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
}

interface TenantPayload {
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  subscription_plan: string;
  is_active: boolean;
}

function AddTenantModal({ onClose, onSubmit, loading }: { onClose: () => void; onSubmit: (payload: TenantPayload) => void; loading: boolean; }) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: 'UAE',
    subscription_plan: 'starter',
    is_active: true,
  });
  const [error, setError] = useState('');

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name' && typeof value === 'string') {
      setForm((prev) => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.contact_email) {
      setError('Name and email are required.');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Add New Tenant</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">&times;</button>
        </div>
        {error && (
          <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Restaurant Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contact Email *</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contact Phone</label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subscription Plan</label>
            <select
              value={form.subscription_plan}
              onChange={(e) => updateField('subscription_plan', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="is_active" className="text-sm text-muted-foreground">Active</label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
