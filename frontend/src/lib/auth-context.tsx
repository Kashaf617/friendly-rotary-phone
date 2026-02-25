'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from './api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: string[];
  tenant_id: string;
  tenant_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: string) => void;
  register: (data: { email: string; password: string; first_name: string; last_name: string; tenant_name: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

// Demo users for testing without backend
const DEMO_USERS: Record<string, User> = {
  'admin@demo-restaurant.ae': {
    id: 'demo-admin-001',
    email: 'admin@demo-restaurant.ae',
    first_name: 'Ahmed',
    last_name: 'Al Maktoum',
    role: 'restaurant_admin',
    permissions: [
      'dashboard.view', 'orders.manage', 'menu.manage', 'inventory.manage',
      'hr.manage', 'accounting.manage', 'reports.view', 'settings.manage', 'users.manage',
    ],
    tenant_id: 'demo-tenant-001',
    tenant_name: 'Demo Restaurant Dubai',
  },
  'manager@demo-restaurant.ae': {
    id: 'demo-manager-001',
    email: 'manager@demo-restaurant.ae',
    first_name: 'Fatima',
    last_name: 'Hassan',
    role: 'manager',
    permissions: [
      'dashboard.view', 'orders.manage', 'menu.manage', 'inventory.manage',
      'hr.view', 'reports.view',
    ],
    tenant_id: 'demo-tenant-001',
    tenant_name: 'Demo Restaurant Dubai',
  },
  'cashier@demo-restaurant.ae': {
    id: 'demo-cashier-001',
    email: 'cashier@demo-restaurant.ae',
    first_name: 'Omar',
    last_name: 'Khan',
    role: 'cashier',
    permissions: ['orders.manage', 'orders.payment', 'menu.view'],
    tenant_id: 'demo-tenant-001',
    tenant_name: 'Demo Restaurant Dubai',
  },
  'kitchen@demo-restaurant.ae': {
    id: 'demo-kitchen-001',
    email: 'kitchen@demo-restaurant.ae',
    first_name: 'Raj',
    last_name: 'Patel',
    role: 'kitchen_staff',
    permissions: ['orders.view', 'orders.kitchen_status', 'menu.view'],
    tenant_id: 'demo-tenant-001',
    tenant_name: 'Demo Restaurant Dubai',
  },
  'superadmin@erp.ae': {
    id: 'demo-super-001',
    email: 'superadmin@erp.ae',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'super_admin',
    permissions: ['*'],
    tenant_id: 'demo-tenant-001',
    tenant_name: 'Restaurant ERP Platform',
  },
};

const DEMO_PASSWORD = 'Admin@123';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const setDemoSession = useCallback((demoUser: User) => {
    localStorage.setItem('access_token', 'demo-token-' + demoUser.id);
    localStorage.setItem('refresh_token', 'demo-refresh-' + demoUser.id);
    localStorage.setItem('user', JSON.stringify(demoUser));
    setUser(demoUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Try real backend first
    try {
      const res = await authApi.login(email, password);
      const data = res.data.data || res.data;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return;
    } catch {
      // Backend not available — fall through to demo mode
    }

    // Demo mode fallback
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && password === DEMO_PASSWORD) {
      setDemoSession(demoUser);
      return;
    }
    throw { response: { data: { message: 'Invalid credentials. Use demo credentials shown below.' } } };
  }, [setDemoSession]);

  const demoLogin = useCallback((role: string) => {
    const roleToEmail: Record<string, string> = {
      restaurant_admin: 'admin@demo-restaurant.ae',
      manager: 'manager@demo-restaurant.ae',
      cashier: 'cashier@demo-restaurant.ae',
      kitchen_staff: 'kitchen@demo-restaurant.ae',
      super_admin: 'superadmin@erp.ae',
    };
    const email = roleToEmail[role];
    if (email && DEMO_USERS[email]) {
      setDemoSession(DEMO_USERS[email]);
    }
  }, [setDemoSession]);

  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string; tenant_name: string }) => {
    // Try real backend first
    try {
      const res = await authApi.register(data);
      const resData = res.data.data || res.data;
      localStorage.setItem('access_token', resData.access_token);
      localStorage.setItem('refresh_token', resData.refresh_token);
      localStorage.setItem('user', JSON.stringify(resData.user));
      setUser(resData.user);
      return;
    } catch {
      // Backend not available — create demo session
    }

    // Demo mode fallback — create a new demo admin user
    const newUser: User = {
      id: 'demo-new-' + Date.now(),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'restaurant_admin',
      permissions: [
        'dashboard.view', 'orders.manage', 'menu.manage', 'inventory.manage',
        'hr.manage', 'accounting.manage', 'reports.view', 'settings.manage', 'users.manage',
      ],
      tenant_id: 'demo-tenant-' + Date.now(),
      tenant_name: data.tenant_name,
    };
    setDemoSession(newUser);
  }, [setDemoSession]);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) || user.permissions?.includes('*');
  }, [user]);

  const hasRole = useCallback((...roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, demoLogin, register, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
