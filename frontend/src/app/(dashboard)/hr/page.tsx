'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { KpiCard } from '@/components/ui/kpi-card';
import {
  Users, UserPlus, Clock, DollarSign, Search,
  Download, Calendar, CheckCircle, XCircle,
} from 'lucide-react';

type Tab = 'employees' | 'payroll';

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await hrApi.getEmployees();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: '1', employee_number: 'EMP-00001', first_name: 'Ahmed', last_name: 'Al Maktoum', email: 'ahmed@demo.ae', position: 'Restaurant Manager', department: 'Management', status: 'active', base_salary: 15000, hire_date: '2024-01-15' },
      { id: '2', employee_number: 'EMP-00002', first_name: 'Fatima', last_name: 'Hassan', email: 'fatima@demo.ae', position: 'Head Chef', department: 'Kitchen', status: 'active', base_salary: 12000, hire_date: '2024-02-01' },
      { id: '3', employee_number: 'EMP-00003', first_name: 'Omar', last_name: 'Khan', email: 'omar@demo.ae', position: 'Cashier', department: 'Front of House', status: 'active', base_salary: 5000, hire_date: '2024-03-10' },
      { id: '4', employee_number: 'EMP-00004', first_name: 'Raj', last_name: 'Patel', email: 'raj@demo.ae', position: 'Sous Chef', department: 'Kitchen', status: 'active', base_salary: 8000, hire_date: '2024-04-01' },
      { id: '5', employee_number: 'EMP-00005', first_name: 'Sara', last_name: 'Ali', email: 'sara@demo.ae', position: 'Waitress', department: 'Front of House', status: 'active', base_salary: 4500, hire_date: '2024-05-15' },
      { id: '6', employee_number: 'EMP-00006', first_name: 'Mohammed', last_name: 'Ibrahim', email: 'mohammed@demo.ae', position: 'Delivery Driver', department: 'Operations', status: 'on_leave', base_salary: 4000, hire_date: '2024-06-01' },
    ],
  });

  const { data: payroll } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const res = await hrApi.getPayroll();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'p1', employee_id: '1', period: '2026-01', base_salary: 15000, overtime_pay: 1200, allowances: 2000, deductions: 0, net_salary: 18200, status: 'paid' },
      { id: 'p2', employee_id: '2', period: '2026-01', base_salary: 12000, overtime_pay: 800, allowances: 1500, deductions: 0, net_salary: 14300, status: 'paid' },
      { id: 'p3', employee_id: '3', period: '2026-01', base_salary: 5000, overtime_pay: 400, allowances: 500, deductions: 0, net_salary: 5900, status: 'approved' },
      { id: 'p4', employee_id: '4', period: '2026-01', base_salary: 8000, overtime_pay: 600, allowances: 1000, deductions: 0, net_salary: 9600, status: 'pending' },
    ],
  });

  const allEmployees = employees || [];
  const activeCount = allEmployees.filter((e: any) => e.status === 'active').length;
  const totalPayroll = (payroll || []).reduce((s: number, p: any) => s + Number(p.net_salary), 0);
  const filteredEmployees = allEmployees.filter((e: any) =>
    !searchQuery || `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    active: 'bg-accent/10 text-accent',
    on_leave: 'bg-warning/10 text-warning',
    terminated: 'bg-danger/10 text-danger',
    probation: 'bg-info/10 text-info',
  };

  const payrollStatusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-secondary/10 text-secondary',
    paid: 'bg-accent/10 text-accent',
    cancelled: 'bg-danger/10 text-danger',
  };

  const getEmployeeName = (empId: string) => {
    const emp = allEmployees.find((e: any) => e.id === empId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR & Payroll</h1>
          <p className="text-sm text-muted-foreground">Employee management, attendance, and payroll</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors">
          <UserPlus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard title="Total Employees" value={allEmployees.length} icon={Users} color="secondary" />
        <KpiCard title="Active" value={activeCount} icon={CheckCircle} color="accent" />
        <KpiCard title="Monthly Payroll" value={formatCurrency(totalPayroll)} icon={DollarSign} color="info" />
        <KpiCard title="On Leave" value={allEmployees.filter((e: any) => e.status === 'on_leave').length} icon={Calendar} color="warning" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(['employees', 'payroll'] as Tab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}>
            {tab === 'employees' ? 'Employees' : 'Payroll'}
          </button>
        ))}
      </div>

      {activeTab === 'employees' && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search employees..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Employee</th>
                    <th className="px-4 py-3 text-left font-medium">Position</th>
                    <th className="px-4 py-3 text-left font-medium">Department</th>
                    <th className="px-4 py-3 text-right font-medium">Salary</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEmployees.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[10px] text-muted-foreground">{emp.employee_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{emp.position}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{emp.department}</td>
                      <td className="px-4 py-3 text-right font-medium text-card-foreground">{formatCurrency(emp.base_salary)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', statusColors[emp.status] || 'bg-muted text-muted-foreground')}>
                          {emp.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'payroll' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">January 2026 payroll</p>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted transition-colors">
              <Download className="h-3.5 w-3.5" /> Export WPS
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Employee</th>
                    <th className="px-4 py-3 text-left font-medium">Period</th>
                    <th className="px-4 py-3 text-right font-medium">Base</th>
                    <th className="px-4 py-3 text-right font-medium">Overtime</th>
                    <th className="px-4 py-3 text-right font-medium">Allowances</th>
                    <th className="px-4 py-3 text-right font-medium">Net Salary</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(payroll || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-card-foreground">{getEmployeeName(p.employee_id)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.period}</td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatCurrency(p.base_salary)}</td>
                      <td className="px-4 py-3 text-right text-xs text-accent">{formatCurrency(p.overtime_pay)}</td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatCurrency(p.allowances)}</td>
                      <td className="px-4 py-3 text-right font-bold text-card-foreground">{formatCurrency(p.net_salary)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', payrollStatusColors[p.status] || 'bg-muted text-muted-foreground')}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
