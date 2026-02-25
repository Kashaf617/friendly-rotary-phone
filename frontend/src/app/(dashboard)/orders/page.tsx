'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import {
  Clock, CheckCircle, XCircle, ChefHat, Truck,
  Filter, RefreshCw,
} from 'lucide-react';

const statusConfig: Record<string, { labelKey: string; color: string; icon: React.ElementType }> = {
  pending: { labelKey: 'orders.status.pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  confirmed: { labelKey: 'orders.status.confirmed', color: 'bg-secondary/10 text-secondary border-secondary/20', icon: CheckCircle },
  preparing: { labelKey: 'orders.status.preparing', color: 'bg-info/10 text-info border-info/20', icon: ChefHat },
  ready: { labelKey: 'orders.status.ready', color: 'bg-accent/10 text-accent border-accent/20', icon: CheckCircle },
  served: { labelKey: 'orders.status.served', color: 'bg-accent/10 text-accent border-accent/20', icon: Truck },
  completed: { labelKey: 'orders.status.completed', color: 'bg-accent/10 text-accent border-accent/20', icon: CheckCircle },
  cancelled: { labelKey: 'orders.status.cancelled', color: 'bg-danger/10 text-danger border-danger/20', icon: XCircle },
};

export default function OrdersPage() {
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      const res = await ordersApi.getAll(statusFilter || undefined);
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: '1', order_number: 'ORD-20260221-0001', order_type: 'dine_in', status: 'preparing', table_number: 'T5', total_amount: 285.00, vat_amount: 13.57, payment_status: 'unpaid', created_at: new Date().toISOString(), items: [{ item_name: 'Mixed Grill', quantity: 2 }, { item_name: 'Hummus', quantity: 1 }] },
      { id: '2', order_number: 'ORD-20260221-0002', order_type: 'takeaway', status: 'ready', table_number: null, total_amount: 95.00, vat_amount: 4.52, payment_status: 'paid', created_at: new Date().toISOString(), items: [{ item_name: 'Chicken Shawarma', quantity: 2 }] },
      { id: '3', order_number: 'ORD-20260221-0003', order_type: 'dine_in', status: 'completed', table_number: 'T12', total_amount: 420.00, vat_amount: 20.00, payment_status: 'paid', created_at: new Date(Date.now() - 3600000).toISOString(), items: [{ item_name: 'Sea Bass', quantity: 1 }, { item_name: 'Lamb Machboos', quantity: 1 }, { item_name: 'Lemon Mint', quantity: 2 }] },
      { id: '4', order_number: 'ORD-20260221-0004', order_type: 'delivery', status: 'pending', table_number: null, total_amount: 165.50, vat_amount: 7.88, payment_status: 'unpaid', created_at: new Date(Date.now() - 1200000).toISOString(), items: [{ item_name: 'Biryani Royal', quantity: 2 }, { item_name: 'Kunafa', quantity: 1 }] },
    ],
    refetchInterval: 15000,
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: async () => {
      const res = await ordersApi.getDailySummary();
      return res.data?.data || res.data;
    },
    placeholderData: { total_orders: 47, total_revenue: 12450.00, total_vat: 593.00, average_order_value: 264.89 },
  });

  const filters = ['', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('orders.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('orders.subtitle')}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          {t('orders.refresh')}
        </button>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t('orders.summary.total_orders')}</p>
          <p className="text-lg font-bold text-card-foreground">{dailySummary?.total_orders || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t('orders.summary.revenue')}</p>
          <p className="text-lg font-bold text-accent">{formatCurrency(dailySummary?.total_revenue || 0)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t('orders.summary.vat')}</p>
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(dailySummary?.total_vat || 0)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t('orders.summary.average')}</p>
          <p className="text-lg font-bold text-card-foreground">{formatCurrency(dailySummary?.average_order_value || 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {filters.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {f ? t(statusConfig[f]?.labelKey || '') : t('orders.filters.all')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {(orders || []).map((order: any) => {
          const config = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          return (
            <div key={order.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', config.color)}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.order_type === 'dine_in'
                        ? `${t('orders.order_type.dine_in')}${order.table_number ? ` - ${t('pos.table_placeholder')} ${order.table_number}` : ''}`
                        : order.order_type === 'takeaway'
                          ? t('orders.order_type.takeaway')
                          : t('orders.order_type.delivery')}
                      {' | '}
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{formatCurrency(order.total_amount)}</p>
                  <span className={cn('inline-block mt-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', config.color)}>
                    {t(config.labelKey)}
                  </span>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {order.items.map((item: any, i: number) => (
                    <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {item.quantity}x {item.item_name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t('orders.labels.vat')}: {formatCurrency(order.vat_amount)}</span>
                <span className="text-border">|</span>
                <span className={order.payment_status === 'paid' ? 'text-accent' : 'text-warning'}>
                  {order.payment_status === 'paid' ? t('orders.labels.paid') : t('orders.labels.unpaid')}
                </span>
              </div>
            </div>
          );
        })}
        {(!orders || orders.length === 0) && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{t('orders.labels.no_orders')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
