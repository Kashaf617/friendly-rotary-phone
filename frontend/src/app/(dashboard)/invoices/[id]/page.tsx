'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { accountingApi, settingsApi, API_ORIGIN } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoicePrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: invoiceRes } = useQuery({
    queryKey: ['invoice', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await accountingApi.getInvoice(id as string);
      return res.data?.data || res.data;
    },
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsApi.getAll();
      return res.data?.data || res.data || [];
    },
  });

  const branding = useMemo(() => {
    const map = new Map<string, string>((settingsRes || []).map((s: any) => [s.key, s.value]));
    const name = map.get('BUSINESS_NAME') || '';
    let logoUrl = map.get('BUSINESS_LOGO_URL') || '';
    if (logoUrl && logoUrl.startsWith('/uploads/')) {
      logoUrl = `${API_ORIGIN}${logoUrl}`;
    }
    return { name, logoUrl };
  }, [settingsRes]);

  useEffect(() => {
    // Auto open print dialog after load
    if (invoiceRes) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [invoiceRes]);

  if (!invoiceRes) return <div className="p-6 text-sm">Loading...</div>;

  const inv = invoiceRes;

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-10 w-10 rounded object-cover border" />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-100 border" />
            )}
            <div>
              <h1 className="text-xl font-semibold">{branding.name || 'Invoice'}</h1>
              <p className="text-xs text-gray-500">Invoice #{inv.invoice_number}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-600">
            <div>Date: {formatDate(inv.created_at)}</div>
            {inv.trn && <div>TRN: {inv.trn}</div>}
          </div>
        </div>

        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs">
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(inv.line_items || []).map((li: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{li.description}</td>
                  <td className="px-3 py-2 text-right">{li.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(li.unit_price)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(li.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(inv.subtotal)}</span>
            </div>
            {Number(inv.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span>-{formatCurrency(inv.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">VAT</span>
              <span>{formatCurrency(inv.vat_amount)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t mt-1">
              <span>Total</span>
              <span>{formatCurrency(inv.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => router.back()}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            type="button"
          >
            Back
          </button>
          <button
            onClick={() => window.print()}
            className="rounded bg-black text-white px-3 py-2 text-sm hover:opacity-90"
            type="button"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
