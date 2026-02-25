'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrApi } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { CalendarDays, Users, Clock3, AlertTriangle } from 'lucide-react';

export default function AttendancePage() {
  const { t } = useI18n();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: attendance } = useQuery({
    queryKey: ['attendance', month],
    queryFn: async () => {
      const res = await hrApi.getAttendance(undefined, month);
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'a1', employee_name: 'Ahmed Al Maktoum', role: 'Chef', check_in: new Date().toISOString(), check_out: new Date().toISOString(), hours_worked: 8, status: 'present' },
      { id: 'a2', employee_name: 'Fatima Hassan', role: 'Manager', check_in: new Date().toISOString(), check_out: new Date().toISOString(), hours_worked: 9, status: 'late' },
      { id: 'a3', employee_name: 'Omar Khan', role: 'Cashier', check_in: null, check_out: null, hours_worked: 0, status: 'absent' },
    ],
  });

  const summary = useMemo(() => {
    const present = (attendance || []).filter((r: any) => r.status === 'present').length;
    const late = (attendance || []).filter((r: any) => r.status === 'late').length;
    const absent = (attendance || []).filter((r: any) => r.status === 'absent').length;
    const overtime = (attendance || []).reduce((sum: number, r: any) => sum + (r.overtime_hours || 0), 0);
    return { present, late, absent, overtime };
  }, [attendance]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('attendance.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('attendance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="month">{t('attendance.month')}</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Users} title={t('attendance.summary.present')} value={summary.present} color="text-accent" />
        <SummaryCard icon={Clock3} title={t('attendance.summary.late')} value={summary.late} color="text-warning" />
        <SummaryCard icon={AlertTriangle} title={t('attendance.summary.absent')} value={summary.absent} color="text-danger" />
        <SummaryCard icon={CalendarDays} title={t('attendance.summary.overtime')} value={`${summary.overtime}h`} color="text-secondary" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t('attendance.table.employee')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('attendance.table.role')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('attendance.table.check_in')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('attendance.table.check_out')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('attendance.table.hours')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(attendance || []).map((record: any) => (
                <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{record.employee_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{record.role || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{record.check_in ? formatDateTime(record.check_in) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{record.check_out ? formatDateTime(record.check_out) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{record.hours_worked ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(attendance || []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CalendarDays className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('attendance.empty')}</p>
          </div>
        )}
      </div>
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
