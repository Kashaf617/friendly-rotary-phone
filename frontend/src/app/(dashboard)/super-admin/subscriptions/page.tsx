'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi, tenantsApi } from '@/lib/api';
import { formatDateTime, formatCurrency, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { CreditCard, Search, MoreHorizontal, Crown, Shield, Zap } from 'lucide-react';

export default function SubscriptionsPage() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: subscriptions, isFetching } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await subscriptionApi.getSubscriptions();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 's1', tenant_name: 'Demo Restaurant Dubai', plan: 'Professional', status: 'active', price: 299, next_billing: new Date(Date.now() + 30 * 86400000).toISOString(), created_at: new Date().toISOString() },
      { id: 's2', tenant_name: 'Marina Bay Kitchen', plan: 'Starter', status: 'active', price: 99, next_billing: new Date(Date.now() + 30 * 86400000).toISOString(), created_at: new Date().toISOString() },
      { id: 's3', tenant_name: 'JBR Seafood House', plan: 'Trial', status: 'trial', price: 0, next_billing: new Date(Date.now() + 14 * 86400000).toISOString(), created_at: new Date().toISOString() },
      { id: 's4', tenant_name: 'Downtown Grill', plan: 'Enterprise', status: 'active', price: 599, next_billing: new Date(Date.now() + 30 * 86400000).toISOString(), created_at: new Date().toISOString() },
    ],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => subscriptionApi.createSubscription(data),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.alert(t('subscriptions.messages.created'));
      }
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      if (typeof window !== 'undefined') {
        window.alert(error.response?.data?.message || t('subscriptions.messages.create_failed'));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.deleteSubscription(id),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.alert(t('subscriptions.messages.deleted'));
      }
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: any) => {
      if (typeof window !== 'undefined') {
        window.alert(error.response?.data?.message || t('subscriptions.messages.delete_failed'));
      }
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm(t('subscriptions.confirm_delete'))) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('subscriptions.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subscriptions.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          {t('subscriptions.buttons.add')}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('subscriptions.search_placeholder')}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t('subscriptions.table.tenant')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('subscriptions.table.plan')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('subscriptions.table.status')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('subscriptions.table.price')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('subscriptions.table.next_billing')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('subscriptions.table.created')}</th>
                <th className="px-4 py-3 text-center font-medium">
                  {isFetching ? '…' : t('subscriptions.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(subscriptions || []).map((sub: any) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{sub.tenant_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {sub.plan === 'Enterprise' && <Crown className="h-3 w-3 text-warning" />}
                      {sub.plan === 'Professional' && <Shield className="h-3 w-3 text-secondary" />}
                      {sub.plan === 'Starter' && <Zap className="h-3 w-3 text-info" />}
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
                        sub.status === 'active' ? 'bg-accent/10 text-accent' :
                        sub.status === 'trial' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger',
                      )}
                    >
                      {sub.status === 'active'
                        ? t('subscriptions.status.active')
                        : sub.status === 'trial'
                          ? t('subscriptions.status.trial')
                          : t('subscriptions.status.expired')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                    {sub.price ? formatCurrency(sub.price) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {sub.next_billing ? formatDateTime(sub.next_billing) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {sub.created_at ? formatDateTime(sub.created_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === sub.id}
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
        {(!subscriptions || subscriptions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CreditCard className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('subscriptions.empty')}</p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <AddSubscriptionModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
}

interface SubscriptionPayload {
  tenant_id: string;
  plan_name: string;
  price: number;
  duration_months: number;
  status: string;
  start_date: string;
  end_date: string;
}

function AddSubscriptionModal({ onClose, onSubmit, loading }: { onClose: () => void; onSubmit: (payload: SubscriptionPayload) => void; loading: boolean; }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    tenant_id: '',
    plan_name: '',
    price: '',
    duration_months: '',
    status: 'active',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await tenantsApi.getAll();
      return res.data?.data || res.data || [];
    },
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.tenant_id || !form.plan_name) {
      setError('All required fields must be filled.');
      return;
    }
    const price = Number(form.price);
    const duration_months = Number(form.duration_months);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a positive number.');
      return;
    }
    if (Number.isNaN(duration_months) || duration_months <= 0) {
      setError('Duration must be greater than zero.');
      return;
    }
    onSubmit({
      tenant_id: form.tenant_id,
      plan_name: form.plan_name,
      price,
      duration_months,
      status: form.status,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">{t('subscriptions.buttons.add')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">×</button>
        </div>
        {error && (
          <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('subscriptions.table.tenant')} *</label>
            <select
              value={form.tenant_id}
              onChange={(e) => updateField('tenant_id', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select tenant...</option>
              {(tenants || []).map((tenant: any) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('subscriptions.table.plan')} *</label>
            <input
              type="text"
              value={form.plan_name}
              onChange={(e) => updateField('plan_name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('subscriptions.table.price')} *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Duration (months) *</label>
              <input
                type="number"
                min="1"
                value={form.duration_months}
                onChange={(e) => updateField('duration_months', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('subscriptions.table.status')}</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="active">{t('subscriptions.status.active')}</option>
              <option value="trial">{t('subscriptions.status.trial')}</option>
              <option value="expired">{t('subscriptions.status.expired')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('subscriptions.table.start_date')}</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('subscriptions.table.end_date')}</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">
              {t('subscriptions.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? '…' : t('subscriptions.buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
