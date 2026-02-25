'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, UtensilsCrossed, Eye, EyeOff,
  Search,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function MenuPage() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('menu.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('menu.subtitle')}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors">
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
                        <button className="rounded p-1 hover:bg-muted transition-colors" title={t('menu.tooltip.toggle')}>
                          {item.is_available ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <button className="rounded p-1 hover:bg-muted transition-colors" title={t('menu.tooltip.edit')}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button className="rounded p-1 hover:bg-muted transition-colors" title={t('menu.tooltip.delete')}>
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
    </div>
  );
}
