'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Building2, Search, Truck, ClipboardList, DollarSign, Clock3 } from 'lucide-react';

export default function SuppliersPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await suppliersApi.getSuppliers();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 's1', name: 'Gulf Food Trading', category: 'Produce', contact_email: 'info@gulf-food.ae', contact_phone: '+971-4-123-4567', status: 'active', rating: 4.8 },
      { id: 's2', name: 'Arabian Coffee Roasters', category: 'Beverages', contact_email: 'orders@arabian-coffee.ae', contact_phone: '+971-4-555-1234', status: 'active', rating: 4.2 },
      { id: 's3', name: 'Desert Packaging', category: 'Packaging', contact_email: 'support@desert-pack.ae', contact_phone: '+971-6-222-9876', status: 'inactive', rating: 3.7 },
    ],
  });

  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const res = await suppliersApi.getPurchaseOrders();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'PO-20260221-001', supplier_name: 'Gulf Food Trading', total_amount: 32000, status: 'pending', due_date: new Date().toISOString() },
      { id: 'PO-20260215-002', supplier_name: 'Arabian Coffee Roasters', total_amount: 7800, status: 'approved', due_date: new Date().toISOString() },
    ],
  });

  const summary = useMemo(() => {
    const active = (suppliers || []).filter((s: any) => s.status === 'active').length;
    const openPo = (purchaseOrders || []).filter((po: any) => po.status !== 'received').length;
    const spend = (purchaseOrders || []).reduce((sum: number, po: any) => sum + (po.total_amount || 0), 0);
    const onTime = 92; // placeholder
    return { active, openPo, spend, onTime };
  }, [suppliers, purchaseOrders]);

  const filteredSuppliers = useMemo(() => {
    if (!search) return suppliers || [];
    const q = search.toLowerCase();
    return (suppliers || []).filter((s: any) =>
      s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  const createSupplier = useMutation({
    mutationFn: (data: any) => suppliersApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      alert(`Failed to create supplier: ${error?.response?.data?.message || error.message}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('suppliers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('suppliers.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          {t('suppliers.add_supplier') || 'Add Supplier'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Building2} title={t('suppliers.summary.active')} value={summary.active} color="text-accent" />
        <SummaryCard icon={ClipboardList} title={t('suppliers.summary.pending_po')} value={summary.openPo} color="text-secondary" />
        <SummaryCard icon={DollarSign} title={t('suppliers.summary.monthly_spend')} value={formatCurrency(summary.spend)} color="text-warning" />
        <SummaryCard icon={Clock3} title={t('suppliers.summary.on_time')} value={`${summary.onTime}%`} color="text-info" />
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('suppliers.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t('suppliers.table.supplier')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('suppliers.table.category')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('suppliers.table.contact')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('suppliers.table.status')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('suppliers.table.rating')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSuppliers.map((supplier: any) => (
                <tr key={supplier.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{supplier.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{supplier.category || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div>{supplier.contact_email || '—'}</div>
                    <div>{supplier.contact_phone || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        supplier.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger',
                      )}
                    >
                      {supplier.status === 'active' ? t('suppliers.status.active') : t('suppliers.status.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-card-foreground">{supplier.rating ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSuppliers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Truck className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('suppliers.empty_suppliers')}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-card-foreground">{t('nav.suppliers')} / PO</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t('suppliers.po_table.number')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('suppliers.po_table.supplier')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('suppliers.po_table.total')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('suppliers.po_table.status')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('suppliers.po_table.due_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(purchaseOrders || []).map((po: any) => (
                <tr key={po.id || po.number} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{po.po_number || po.id}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{po.supplier_name || '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">{formatCurrency(po.total_amount || 0)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
                      po.status === 'approved' || po.status === 'received'
                        ? 'bg-accent/10 text-accent'
                        : po.status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-secondary/10 text-secondary',
                    )}>
                      {t(`suppliers.status.${po.status || 'draft'}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {po.due_date ? new Date(po.due_date).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(purchaseOrders || []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <ClipboardList className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('suppliers.empty_pos')}</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddSupplierModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data: any) => createSupplier.mutate(data)}
          isLoading={createSupplier.isPending}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, color }: { icon: React.ElementType; title: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-bold text-card-foreground">{value}</p>
      </div>
    </div>
  );
}

function AddSupplierModal({ onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact_email: '',
    contact_phone: '',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      category: formData.category || undefined,
      contact_email: formData.contact_email || undefined,
      contact_phone: formData.contact_phone || undefined,
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-xl font-bold text-foreground">Add Supplier</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
