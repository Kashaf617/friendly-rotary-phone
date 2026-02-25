'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Users, Search, MoreHorizontal, Shield, Crown } from 'lucide-react';

export default function UsersPage() {
  const { t } = useI18n();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await usersApi.getAll();
      return res.data?.data || res.data;
    },
    placeholderData: [
      { id: 'u1', email: 'admin@demo-restaurant.ae', first_name: 'Ahmed', last_name: 'Al Maktoum', role: 'restaurant_admin', tenant_name: 'Demo Restaurant Dubai', status: 'active', created_at: new Date().toISOString() },
      { id: 'u2', email: 'manager@demo-restaurant.ae', first_name: 'Fatima', last_name: 'Hassan', role: 'manager', tenant_name: 'Demo Restaurant Dubai', status: 'active', created_at: new Date().toISOString() },
      { id: 'u3', email: 'cashier@demo-restaurant.ae', first_name: 'Omar', last_name: 'Khan', role: 'cashier', tenant_name: 'Demo Restaurant Dubai', status: 'active', created_at: new Date().toISOString() },
      { id: 'u4', email: 'superadmin@erp.ae', first_name: 'Super', last_name: 'Admin', role: 'super_admin', tenant_name: null, status: 'active', created_at: new Date().toISOString() },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users</p>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
          Add User
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Tenant</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(users || []).map((user: any) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{user.first_name} {user.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {user.role === 'super_admin' && <Crown className="h-3 w-3 text-warning" />}
                      {user.role === 'restaurant_admin' && <Shield className="h-3 w-3 text-secondary" />}
                      {typeof user.role === 'string' ? user.role.replace('_', ' ') : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.tenant_name || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
                        user.status === 'active' ? 'bg-accent/10 text-accent' :
                        user.status === 'trial' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger',
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.created_at ? formatDateTime(user.created_at) : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded p-1 hover:bg-muted transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!users || users.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
