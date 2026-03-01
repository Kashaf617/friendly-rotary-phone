'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, tenantsApi, rolesApi } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';
import { Users, Search, MoreHorizontal, Shield, Crown } from 'lucide-react';

export default function UsersPage() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.alert('User created successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      if (typeof window !== 'undefined') {
        window.alert(error.response?.data?.message || 'Failed to create user');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.alert('User deleted successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      if (typeof window !== 'undefined') {
        window.alert(error.response?.data?.message || 'Failed to delete user');
      }
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
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
                    <button
                      onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === user.id}
                      className="rounded p-1 hover:bg-muted transition-colors disabled:opacity-50"
                    >
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
      {isModalOpen && (
        <AddUserModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
}

interface UserPayload {
  tenant_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: string;
  is_active: boolean;
}

function AddUserModal({ onClose, onSubmit, loading }: { onClose: () => void; onSubmit: (payload: UserPayload) => void; loading: boolean; }) {
  const [form, setForm] = useState({
    tenant_id: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
    is_active: true,
  });
  const [error, setError] = useState('');

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await tenantsApi.getAll();
      return res.data?.data || res.data || [];
    },
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await rolesApi.getAll();
      return res.data?.data || res.data || [];
    },
  });

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.first_name || !form.role_id) {
      setError('Email, password, first name, and role are required.');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Add New User</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">&times;</button>
        </div>
        {error && (
          <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">First Name *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tenant</label>
            <select
              value={form.tenant_id}
              onChange={(e) => updateField('tenant_id', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select tenant...</option>
              {(tenants || []).map((tenant: any) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Role *</label>
            <select
              value={form.role_id}
              onChange={(e) => updateField('role_id', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select role...</option>
              {(roles || []).map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="is_active" className="text-sm text-muted-foreground">Active</label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
