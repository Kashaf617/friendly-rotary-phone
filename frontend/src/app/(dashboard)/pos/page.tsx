'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi, ordersApi, settingsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, SplitSquareHorizontal, Percent, Receipt, X,
  UtensilsCrossed, ChevronDown,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface CartItem {
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  selected_modifiers: { name: string; option: string; price: number }[];
  special_instructions: string;
}

export default function POSPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<{ invoiceId?: string; invoiceNumber?: string; url?: string } | null>(null);

  const tenantId = user?.tenant_id;

  const { data: settings } = useQuery({
    queryKey: ['settings', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const res = await settingsApi.getAll();
        return res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
    placeholderData: [],
  });

  const vatConfig = useMemo(() => {
    const byKey = new Map<string, string>((settings || []).map((s: any) => [s.key, s.value]));

    const enabledRaw = byKey.get('VAT_ENABLED')?.toLowerCase();
    const enabled =
      enabledRaw === undefined
        ? true
        : enabledRaw === 'true' || enabledRaw === '1' || enabledRaw === 'yes';

    let rate = byKey.get('VAT_RATE') ? Number(byKey.get('VAT_RATE')) : 0.05;
    if (!Number.isFinite(rate) || rate < 0) rate = 0.05;
    if (rate > 1) rate = rate / 100;

    return { enabled, rate: enabled ? rate : 0 };
  }, [settings]);

  const vatRatePercent = useMemo(() => {
    const pct = Number((vatConfig.rate * 100).toFixed(2));
    return Number.isFinite(pct) ? pct : 0;
  }, [vatConfig.rate]);

  const vatLabel = useMemo(() => {
    if (!vatConfig.enabled) return t('pos.summary.vat');
    const display = vatRatePercent % 1 === 0 ? vatRatePercent.toFixed(0) : vatRatePercent.toString();
    return `${t('pos.summary.vat')} (${display}%)`;
  }, [t, vatConfig.enabled, vatRatePercent]);

  // Fetch menu categories
  const { data: categories } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const res = await menuApi.getCategories();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: '1', name: 'Appetizers', name_ar: 'مقبلات', items: [] },
      { id: '2', name: 'Main Course', name_ar: 'الأطباق الرئيسية', items: [] },
      { id: '3', name: 'Beverages', name_ar: 'المشروبات', items: [] },
      { id: '4', name: 'Desserts', name_ar: 'الحلويات', items: [] },
    ],
  });

  // Fetch menu items
  const { data: menuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const res = await menuApi.getItems();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'a1', category_id: '1', name: 'Hummus', price: 25, is_available: true, modifiers: null },
      { id: 'a2', category_id: '1', name: 'Fattoush Salad', price: 30, is_available: true, modifiers: null },
      { id: 'a3', category_id: '1', name: 'Grilled Halloumi', price: 35, is_available: true, modifiers: null },
      { id: 'a4', category_id: '1', name: 'Falafel Plate', price: 28, is_available: true, modifiers: null },
      { id: 'a5', category_id: '1', name: 'Lamb Sambousek', price: 32, is_available: true, modifiers: null },
      { id: 'm1', category_id: '2', name: 'Mixed Grill Platter', price: 120, is_available: true, modifiers: [{ name: 'Size', options: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 30 }] }] },
      { id: 'm2', category_id: '2', name: 'Lamb Machboos', price: 85, is_available: true, modifiers: [{ name: 'Spice Level', options: [{ label: 'Mild', price: 0 }, { label: 'Medium', price: 0 }, { label: 'Hot', price: 0 }] }] },
      { id: 'm3', category_id: '2', name: 'Grilled Sea Bass', price: 95, is_available: true, modifiers: null },
      { id: 'm4', category_id: '2', name: 'Chicken Shawarma', price: 45, is_available: true, modifiers: null },
      { id: 'm5', category_id: '2', name: 'Beef Kebab', price: 75, is_available: true, modifiers: null },
      { id: 'm6', category_id: '2', name: 'Biryani Royal', price: 65, is_available: true, modifiers: null },
      { id: 'b1', category_id: '3', name: 'Fresh Lemon Mint', price: 18, is_available: true, modifiers: null },
      { id: 'b2', category_id: '3', name: 'Arabic Coffee', price: 15, is_available: true, modifiers: null },
      { id: 'b3', category_id: '3', name: 'Mango Juice', price: 20, is_available: true, modifiers: null },
      { id: 'b4', category_id: '3', name: 'Turkish Tea', price: 12, is_available: true, modifiers: null },
      { id: 'd1', category_id: '4', name: 'Kunafa', price: 35, is_available: true, modifiers: null },
      { id: 'd2', category_id: '4', name: 'Um Ali', price: 30, is_available: true, modifiers: null },
      { id: 'd3', category_id: '4', name: 'Luqaimat', price: 25, is_available: true, modifiers: null },
    ],
  });

  // Filter items
  const filteredItems = useMemo(() => {
    let items = menuItems || [];
    if (selectedCategory) {
      items = items.filter((i: any) => i.category_id === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i: any) => i.name.toLowerCase().includes(q));
    }
    return items.filter((i: any) => i.is_available);
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart calculations
  const calculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      let itemTotal = item.unit_price * item.quantity;
      for (const mod of item.selected_modifiers) {
        itemTotal += mod.price * item.quantity;
      }
      return sum + itemTotal;
    }, 0);

    const discountAmount = subtotal * (discountPercent / 100);
    const taxable = subtotal - discountAmount;
    const vatAmount = Number((taxable * vatConfig.rate).toFixed(2));
    const total = Number((taxable + vatAmount).toFixed(2));

    return { subtotal, discountAmount, vatAmount, total, itemCount: cart.reduce((s, i) => s + i.quantity, 0) };
  }, [cart, discountPercent, vatConfig.rate]);

  // Cart actions
  const addToCart = useCallback((item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item_id === item.id && c.selected_modifiers.length === 0);
      if (existing) {
        return prev.map((c) =>
          c.menu_item_id === item.id && c.selected_modifiers.length === 0
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          item_name: item.name,
          unit_price: item.price,
          quantity: 1,
          selected_modifiers: [],
          special_instructions: '',
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0, updated[index].quantity + delta) };
      return updated.filter((item) => item.quantity > 0);
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountPercent(0);
    setNotes('');
    setShowDiscount(false);
    setShowPayment(false);
  }, []);

  // Place order
  const placeOrder = useCallback(async (paymentMethod: string) => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const createRes = await ordersApi.create({
        order_type: orderType,
        table_number: tableNumber || undefined,
        guest_count: guestCount,
        items: cart,
        discount_percent: discountPercent,
        notes: notes || undefined,
      });
      const created = createRes.data?.data || createRes.data;
      if (created?.id) {
        const payRes = await ordersApi.processPayment(created.id, { payment_method: paymentMethod });
        const payData = payRes.data?.data || payRes.data;
        const invoiceId = payData?.invoice_id;
        const invoiceNumber = payData?.invoice_number;
        if (invoiceId) {
          const url = `${window.location.origin}/invoices/${invoiceId}`;
          // Open print page in a new tab immediately
          window.open(url, '_blank');
          // Show a small receipt modal with QR for convenience
          setReceipt({ invoiceId, invoiceNumber, url });
        }
      }
      // Reset cart and UI
      clearCart();
      setTableNumber('');
      setGuestCount(1);
      setShowPayment(false);
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setProcessing(false);
    }
  }, [cart, orderType, tableNumber, guestCount, discountPercent, notes, clearCart]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 gap-0">
      {/* LEFT: Categories + Items */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        {/* Search + Order Type */}
        <div className="flex items-center gap-3 border-b border-border bg-card p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('pos.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="dine_in">{t('pos.order_type.dine_in')}</option>
            <option value="takeaway">{t('pos.order_type.takeaway')}</option>
            <option value="delivery">{t('pos.order_type.delivery')}</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card px-3 py-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-medium transition-colors',
              !selectedCategory ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {t('pos.all')}
          </button>
          {(categories || []).map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-medium transition-colors',
                selectedCategory === cat.id ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={!item.is_available}
                className={cn(
                  'group relative flex flex-col rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-accent/50',
                  !item.is_available && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-3">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-card-foreground line-clamp-1">{item.name}</h4>
                <p className="mt-1 text-lg font-bold text-accent">{formatCurrency(item.price)}</p>
                {item.modifiers && item.modifiers.length > 0 && (
                  <span className="mt-1 text-[10px] text-muted-foreground">{t('pos.has_options')}</span>
                )}
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <UtensilsCrossed className="h-8 w-8 mb-2" />
              <p className="text-sm">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart / Bill Panel */}
      <div className="flex w-80 flex-col bg-card lg:w-96">
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-card-foreground">
              {t('pos.current_order')}
              {calculations.itemCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {calculations.itemCount}
                </span>
              )}
            </h3>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-danger hover:text-danger/80">
              {t('pos.clear_cart')}
            </button>
          )}
        </div>

        {/* Table / Guest Info */}
        {orderType === 'dine_in' && (
          <div className="flex gap-2 border-b border-border px-4 py-2">
            <input
              type="text"
              placeholder={t('pos.table_placeholder')}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:border-accent focus:outline-none"
            />
            <div className="flex w-1/2 items-center gap-1">
              <span className="text-xs text-muted-foreground">{t('pos.guests')}:</span>
              <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="rounded border border-border px-1.5 py-0.5 text-xs hover:bg-muted">
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-6 text-center text-xs font-medium">{guestCount}</span>
              <button onClick={() => setGuestCount(guestCount + 1)} className="rounded border border-border px-1.5 py-0.5 text-xs hover:bg-muted">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">{t('pos.empty.title')}</p>
              <p className="text-xs">{t('pos.empty.subtitle')}</p>
            </div>
          ) : (
            cart.map((item, index) => {
              const modTotal = item.selected_modifiers.reduce((s, m) => s + m.price, 0);
              const lineTotal = (item.unit_price + modTotal) * item.quantity;
              return (
                <div key={`${item.menu_item_id}-${index}`} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-card-foreground truncate">{item.item_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatCurrency(item.unit_price)} x {item.quantity}
                    </p>
                    {item.selected_modifiers.length > 0 && (
                      <p className="text-[10px] text-accent">
                        + {item.selected_modifiers.map((m) => m.option).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(index, -1)} className="flex h-6 w-6 items-center justify-center rounded bg-background border border-border text-xs hover:bg-muted">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-5 text-center text-xs font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, 1)} className="flex h-6 w-6 items-center justify-center rounded bg-background border border-border text-xs hover:bg-muted">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-card-foreground">{formatCurrency(lineTotal)}</p>
                    <button onClick={() => removeItem(index)} className="mt-0.5 text-danger hover:text-danger/80">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bill Summary */}
        {cart.length > 0 && (
          <div className="border-t border-border px-4 py-3 space-y-2">
            {/* Discount toggle */}
            <button
              onClick={() => setShowDiscount(!showDiscount)}
              className="flex items-center gap-1 text-xs text-secondary hover:text-secondary-light"
            >
              <Percent className="h-3 w-3" />
              {showDiscount ? t('pos.discount.hide') : t('pos.discount.add')}
            </button>

            {showDiscount && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs focus:border-accent focus:outline-none"
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground">{t('pos.discount.percent_suffix')}</span>
              </div>
            )}

            {/* Notes */}
            <input
              type="text"
              placeholder={t('pos.notes_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:border-accent focus:outline-none"
            />

            {/* Totals */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('pos.summary.subtotal')}</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>
              {calculations.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-danger">
                  <span>{t('pos.summary.discount')} ({discountPercent}%)</span>
                  <span>-{formatCurrency(calculations.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{vatLabel}</span>
                <span>{formatCurrency(calculations.vatAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-card-foreground">
                <span>{t('pos.summary.total')}</span>
                <span className="text-accent">{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            {!showPayment ? (
              <button
                onClick={() => setShowPayment(true)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                {t('pos.payment.proceed')}
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium text-card-foreground text-center">{t('pos.payment.title')}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => placeOrder('cash')}
                    disabled={processing}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2.5 text-xs hover:border-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
                  >
                    <Banknote className="h-5 w-5 text-accent" />
                    <span>{t('pos.payment.cash')}</span>
                  </button>
                  <button
                    onClick={() => placeOrder('card')}
                    disabled={processing}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2.5 text-xs hover:border-secondary hover:bg-secondary/5 transition-colors disabled:opacity-50"
                  >
                    <CreditCard className="h-5 w-5 text-secondary" />
                    <span>{t('pos.payment.card')}</span>
                  </button>
                  <button
                    onClick={() => placeOrder('split')}
                    disabled={processing}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2.5 text-xs hover:border-warning hover:bg-warning/5 transition-colors disabled:opacity-50"
                  >
                    <SplitSquareHorizontal className="h-5 w-5 text-warning" />
                    <span>{t('pos.payment.split')}</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  {t('pos.payment.cancel')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {receipt && (
        <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

function ReceiptModal({ data, onClose }: { data: { invoiceId?: string; invoiceNumber?: string; url?: string } | null; onClose: () => void }) {
  if (!data) return null;
  const qrSrc = data.url ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data.url)}` : '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-card-foreground mb-1">Payment Successful</h3>
        {data.invoiceNumber && (
          <p className="text-xs text-muted-foreground mb-3">Invoice #{data.invoiceNumber}</p>
        )}
        {data.url && (
          <div className="flex flex-col items-center gap-2 mb-3">
            {/* External QR generator used for convenience; replace with local generator if desired */}
            <img src={qrSrc} alt="Invoice QR" className="h-40 w-40" />
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Open print slip
            </a>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
}
