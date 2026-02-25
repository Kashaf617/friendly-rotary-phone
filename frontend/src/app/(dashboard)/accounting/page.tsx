'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountingApi } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { KpiCard } from '@/components/ui/kpi-card';
import {
  Receipt, DollarSign, TrendingUp, TrendingDown,
  FileText, ArrowUpRight, ArrowDownRight, Filter,
} from 'lucide-react';

type Tab = 'invoices' | 'transactions' | 'reports';

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('invoices');

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await accountingApi.getInvoices();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'i1', invoice_number: 'INV-202602-00001', customer_name: 'Walk-in', subtotal: 271.43, vat_rate: 0.05, vat_amount: 13.57, discount_amount: 0, total_amount: 285.00, payment_status: 'paid', payment_method: 'card', created_at: new Date().toISOString() },
      { id: 'i2', invoice_number: 'INV-202602-00002', customer_name: 'Corporate Event', subtotal: 2400.00, vat_rate: 0.05, vat_amount: 120.00, discount_amount: 0, total_amount: 2520.00, payment_status: 'paid', payment_method: 'card', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'i3', invoice_number: 'INV-202602-00003', customer_name: 'Walk-in', subtotal: 90.48, vat_rate: 0.05, vat_amount: 4.52, discount_amount: 0, total_amount: 95.00, payment_status: 'paid', payment_method: 'cash', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'i4', invoice_number: 'INV-202602-00004', customer_name: 'Delivery Order', subtotal: 157.62, vat_rate: 0.05, vat_amount: 7.88, discount_amount: 0, total_amount: 165.50, payment_status: 'unpaid', payment_method: null, created_at: new Date(Date.now() - 172800000).toISOString() },
    ],
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await accountingApi.getTransactions();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 't1', type: 'income', category: 'sales', amount: 12450.00, description: 'Daily sales - Feb 21', transaction_date: new Date().toISOString(), payment_method: 'mixed' },
      { id: 't2', type: 'expense', category: 'purchase', amount: 3200.00, description: 'Meat supplier - Weekly order', transaction_date: new Date().toISOString(), payment_method: 'bank_transfer' },
      { id: 't3', type: 'expense', category: 'salary', amount: 48500.00, description: 'January payroll', transaction_date: new Date(Date.now() - 2592000000).toISOString(), payment_method: 'wps' },
      { id: 't4', type: 'expense', category: 'utilities', amount: 4200.00, description: 'DEWA bill - January', transaction_date: new Date(Date.now() - 2592000000).toISOString(), payment_method: 'bank_transfer' },
      { id: 't5', type: 'expense', category: 'rent', amount: 25000.00, description: 'Monthly rent - February', transaction_date: new Date(Date.now() - 86400000).toISOString(), payment_method: 'bank_transfer' },
      { id: 't6', type: 'income', category: 'sales', amount: 11800.00, description: 'Daily sales - Feb 20', transaction_date: new Date(Date.now() - 86400000).toISOString(), payment_method: 'mixed' },
    ],
  });

  const allInvoices = invoices || [];
  const allTransactions = transactions || [];
  const totalIncome = allTransactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpenses = allTransactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalVat = allInvoices.reduce((s: number, i: any) => s + Number(i.vat_amount), 0);

  const paymentStatusColors: Record<string, string> = {
    paid: 'bg-accent/10 text-accent',
    unpaid: 'bg-warning/10 text-warning',
    overdue: 'bg-danger/10 text-danger',
    cancelled: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accounting</h1>
        <p className="text-sm text-muted-foreground">Invoices, transactions, and financial reports</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard title="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} color="accent" />
        <KpiCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} color="danger" />
        <KpiCard title="Net Profit" value={formatCurrency(totalIncome - totalExpenses)} icon={DollarSign} color="secondary" />
        <KpiCard title="VAT Collected" value={formatCurrency(totalVat)} subtitle="5% UAE VAT" icon={Receipt} color="warning" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(['invoices', 'transactions', 'reports'] as Tab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize',
              activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'invoices' && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Invoice #</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                  <th className="px-4 py-3 text-right font-medium">VAT (5%)</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-card-foreground">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inv.customer_name || 'Walk-in'}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatCurrency(inv.subtotal)}</td>
                    <td className="px-4 py-3 text-right text-xs text-warning">{formatCurrency(inv.vat_amount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-card-foreground">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', paymentStatusColors[inv.payment_status] || 'bg-muted text-muted-foreground')}>
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(inv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {allTransactions.map((t: any) => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                t.type === 'income' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger',
              )}>
                {t.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{t.description}</p>
                <p className="text-xs text-muted-foreground capitalize">{t.category} | {t.payment_method?.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-bold', t.type === 'income' ? 'text-accent' : 'text-danger')}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatDate(t.transaction_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-secondary" />
              <h3 className="text-sm font-semibold text-card-foreground">Profit & Loss Report</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Generate a detailed P&L statement for any period.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Income</span>
                <span className="font-medium text-accent">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-medium text-danger">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-medium text-card-foreground">Net Profit</span>
                <span className={cn('font-bold', totalIncome - totalExpenses >= 0 ? 'text-accent' : 'text-danger')}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="h-5 w-5 text-warning" />
              <h3 className="text-sm font-semibold text-card-foreground">VAT Report</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">UAE VAT (5%) report for filing with FTA.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Taxable Sales</span>
                <span className="font-medium text-card-foreground">{formatCurrency(allInvoices.reduce((s: number, i: any) => s + Number(i.subtotal), 0))}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">VAT Collected (Output)</span>
                <span className="font-medium text-warning">{formatCurrency(totalVat)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Invoices</span>
                <span className="font-medium text-card-foreground">{allInvoices.length}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-medium text-card-foreground">Net VAT Payable</span>
                <span className="font-bold text-warning">{formatCurrency(totalVat)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
