'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { KpiCard } from '@/components/ui/kpi-card';
import {
  Package, AlertTriangle, Plus, Search, ArrowUpDown,
  TrendingDown, DollarSign,
} from 'lucide-react';
import { useState } from 'react';

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await inventoryApi.getAll();
      return res.data?.data || res.data;
    },
    initialData: [
      { id: '1', name: 'Chicken Breast', sku: 'INV-001', unit: 'kg', stock_level: 45, low_stock_threshold: 20, unit_cost: 28, category: 'Meat', is_active: true },
      { id: '2', name: 'Lamb Leg', sku: 'INV-002', unit: 'kg', stock_level: 12, low_stock_threshold: 15, unit_cost: 55, category: 'Meat', is_active: true },
      { id: '3', name: 'Basmati Rice', sku: 'INV-003', unit: 'kg', stock_level: 80, low_stock_threshold: 25, unit_cost: 8, category: 'Grains', is_active: true },
      { id: '4', name: 'Olive Oil', sku: 'INV-004', unit: 'liter', stock_level: 8, low_stock_threshold: 10, unit_cost: 35, category: 'Oils', is_active: true },
      { id: '5', name: 'Tomatoes', sku: 'INV-005', unit: 'kg', stock_level: 30, low_stock_threshold: 15, unit_cost: 5, category: 'Vegetables', is_active: true },
      { id: '6', name: 'Halloumi Cheese', sku: 'INV-006', unit: 'kg', stock_level: 5, low_stock_threshold: 8, unit_cost: 42, category: 'Dairy', is_active: true },
      { id: '7', name: 'Arabic Bread', sku: 'INV-007', unit: 'pack', stock_level: 60, low_stock_threshold: 20, unit_cost: 3, category: 'Bakery', is_active: true },
      { id: '8', name: 'Lemons', sku: 'INV-008', unit: 'kg', stock_level: 18, low_stock_threshold: 10, unit_cost: 6, category: 'Fruits', is_active: true },
    ],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => inventoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-value'] });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      alert(`Failed to add item: ${error?.response?.data?.message || error.message}`);
    },
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const res = await inventoryApi.getLowStock();
      return res.data?.data || res.data;
    },
    placeholderData: [],
  });

  const { data: inventoryValue } = useQuery({
    queryKey: ['inventory-value'],
    queryFn: async () => {
      const res = await inventoryApi.getValue();
      return res.data?.data || res.data;
    },
    placeholderData: { total_value: '8450.00', total_items: 8 },
  });

  const allItems = items || [];
  const lowStock = allItems.filter((i: any) => Number(i.stock_level) <= Number(i.low_stock_threshold));
  const filtered = allItems.filter((i: any) =>
    !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track stock levels and manage supplies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Total Items" value={allItems.length} subtitle="Active inventory items" icon={Package} color="secondary" />
        <KpiCard title="Low Stock Alerts" value={lowStock.length} subtitle="Items below threshold" icon={AlertTriangle} color="danger" />
        <KpiCard title="Inventory Value" value={formatCurrency(Number(inventoryValue?.total_value || 0))} subtitle="Total stock value" icon={DollarSign} color="accent" />
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <h3 className="text-sm font-semibold text-danger">Low Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item: any) => (
              <div key={item.id} className="rounded-lg border border-danger/20 bg-card px-3 py-2">
                <p className="text-xs font-medium text-card-foreground">{item.name}</p>
                <p className="text-[10px] text-danger">{item.stock_level} {item.unit} remaining (min: {item.low_stock_threshold})</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Search inventory..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Item</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Threshold</th>
                <th className="px-4 py-3 text-right font-medium">Unit Cost</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item: any) => {
                const isLow = Number(item.stock_level) <= Number(item.low_stock_threshold);
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{item.sku}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.category}</td>
                    <td className={cn('px-4 py-3 text-right font-medium', isLow ? 'text-danger' : 'text-card-foreground')}>
                      {item.stock_level} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{item.low_stock_threshold} {item.unit}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatCurrency(item.unit_cost)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                        isLow ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent',
                      )}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showAddModal && (
        <AddInventoryItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data: any) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function AddInventoryItemModal({ onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: 'kg',
    stock_level: '0',
    low_stock_threshold: '10',
    unit_cost: '',
    category: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      sku: formData.sku || undefined,
      unit: formData.unit,
      stock_level: Number(formData.stock_level || 0),
      low_stock_threshold: Number(formData.low_stock_threshold || 0),
      unit_cost: formData.unit_cost ? Number(formData.unit_cost) : undefined,
      category: formData.category || undefined,
      is_active: formData.is_active,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-xl font-bold text-foreground">Add Inventory Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="piece">piece</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Stock Level</label>
              <input
                type="number"
                step="0.01"
                value={formData.stock_level}
                onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Low Stock Threshold</label>
              <input
                type="number"
                step="0.01"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="active" className="text-sm text-muted-foreground">Active</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
