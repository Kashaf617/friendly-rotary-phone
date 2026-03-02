'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, UtensilsCrossed, Eye, EyeOff,
  Search,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function MenuPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: categories } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const res = await menuApi.getCategories();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: '1', name: 'Appetizers', name_ar: 'مقبلات', is_active: true, sort_order: 1 },
      { id: '2', name: 'Main Course', name_ar: 'الأطباق الرئيسية', is_active: true, sort_order: 2 },
      { id: '3', name: 'Beverages', name_ar: 'المشروبات', is_active: true, sort_order: 3 },
      { id: '4', name: 'Desserts', name_ar: 'الحلويات', is_active: true, sort_order: 4 },
    ],
  });

  const { data: items } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const res = await menuApi.getItems();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'a1', category_id: '1', name: 'Hummus', name_ar: 'حمص', price: 25, cost_price: 8, is_available: true, is_active: true, modifiers: null },
      { id: 'a2', category_id: '1', name: 'Fattoush Salad', name_ar: 'سلطة فتوش', price: 30, cost_price: 10, is_available: true, is_active: true, modifiers: null },
      { id: 'a3', category_id: '1', name: 'Grilled Halloumi', name_ar: 'حلومي مشوي', price: 35, cost_price: 14, is_available: true, is_active: true, modifiers: null },
      { id: 'm1', category_id: '2', name: 'Mixed Grill Platter', name_ar: 'مشاوي مشكلة', price: 120, cost_price: 45, is_available: true, is_active: true, modifiers: [{ name: 'Size', options: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 30 }] }] },
      { id: 'm2', category_id: '2', name: 'Lamb Machboos', name_ar: 'مجبوس لحم', price: 85, cost_price: 32, is_available: true, is_active: true, modifiers: null },
      { id: 'm3', category_id: '2', name: 'Chicken Shawarma', name_ar: 'شاورما دجاج', price: 45, cost_price: 15, is_available: true, is_active: true, modifiers: null },
      { id: 'b1', category_id: '3', name: 'Fresh Lemon Mint', name_ar: 'ليمون بالنعناع', price: 18, cost_price: 4, is_available: true, is_active: true, modifiers: null },
      { id: 'b2', category_id: '3', name: 'Arabic Coffee', name_ar: 'قهوة عربية', price: 15, cost_price: 3, is_available: false, is_active: true, modifiers: null },
      { id: 'd1', category_id: '4', name: 'Kunafa', name_ar: 'كنافة', price: 35, cost_price: 12, is_available: true, is_active: true, modifiers: null },
    ],
  });

  const filteredItems = (items || []).filter((item: any) => {
    if (selectedCategory && item.category_id !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCategoryName = (catId: string) =>
    (categories || []).find((c: any) => c.id === catId)?.name || t('menu.unknown_category');

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => menuApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      alert(`Failed to create item: ${error.response?.data?.message || error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => menuApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setEditingItem(null);
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      alert(`Failed to update item: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => menuApi.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('menu.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('menu.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> {t('menu.add_item')}
        </button>
      </div>

      {/* Categories */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(categories || []).map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md',
              selectedCategory === cat.id ? 'border-accent shadow-md' : 'border-border',
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              selectedCategory === cat.id ? 'bg-accent text-white' : 'bg-accent/10 text-accent',
            )}>
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{cat.name}</p>
              <p className="text-xs text-muted-foreground">{cat.name_ar}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text" placeholder={t('menu.search_placeholder')}
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Items Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t('menu.table.item')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('menu.table.category')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('menu.table.price')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('menu.table.cost')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('menu.table.margin')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('menu.table.status')}</th>
                <th className="px-4 py-3 text-center font-medium">{t('menu.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item: any) => {
                const margin = item.cost_price ? ((item.price - item.cost_price) / item.price * 100).toFixed(0) : '—';
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-card-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.name_ar}</p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <span className="inline-block mt-0.5 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] text-secondary">
                            {item.modifiers.length} {t('menu.modifiers_label')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{getCategoryName(item.category_id)}</td>
                    <td className="px-4 py-3 text-right font-medium text-card-foreground">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{item.cost_price ? formatCurrency(item.cost_price) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-xs font-medium', Number(margin) >= 60 ? 'text-accent' : Number(margin) >= 40 ? 'text-warning' : 'text-danger')}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                        item.is_available ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger',
                      )}>
                        {item.is_available ? t('menu.status.available') : t('menu.status.unavailable')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleMutation.mutate(item.id)}
                          disabled={toggleMutation.isPending}
                          className="rounded p-1 hover:bg-muted transition-colors disabled:opacity-50"
                          title={t('menu.tooltip.toggle')}
                        >
                          {item.is_available ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="rounded p-1 hover:bg-muted transition-colors"
                          title={t('menu.tooltip.edit')}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded p-1 hover:bg-muted transition-colors disabled:opacity-50"
                          title={t('menu.tooltip.delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UtensilsCrossed className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('menu.empty')}</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddMenuItemModal
          categories={categories || []}
          onClose={() => setShowAddModal(false)}
          onSubmit={(data: any) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditMenuItemModal
          item={editingItem}
          categories={categories || []}
          onClose={() => setEditingItem(null)}
          onSubmit={(data: any) => updateMutation.mutate({ id: editingItem.id, data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Add Item Modal Component
function AddMenuItemModal({ categories, onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    category_id: categories[0]?.id || '',
    name: '',
    name_ar: '',
    description: '',
    price: '',
    cost_price: '',
    is_available: true,
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    console.log('Category ID:', formData.category_id);
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-xl font-bold text-foreground">Add New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Category *</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
            >
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Arabic Name</label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Price (AED) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Cost Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="available" className="text-sm text-muted-foreground">Available</label>
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
              {isLoading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Item Modal Component
function EditMenuItemModal({ item, categories, onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    category_id: item.category_id,
    name: item.name,
    name_ar: item.name_ar || '',
    description: item.description || '',
    price: item.price.toString(),
    cost_price: item.cost_price?.toString() || '',
    is_available: item.is_available,
    is_active: item.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-xl font-bold text-foreground">Edit Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Category *</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
            >
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Arabic Name</label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Price (AED) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Cost Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available-edit"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="available-edit" className="text-sm text-muted-foreground">Available</label>
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
              {isLoading ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
