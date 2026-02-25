'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Truck,
  Users,
  CalendarDays,
  Receipt,
  BarChart3,
  Settings,
  Building2,
  CreditCard,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  labelKey?: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  roles?: string[];
}

const restaurantNavItems: NavItem[] = [
  { label: 'Dashboard', labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { label: 'POS', labelKey: 'nav.pos', href: '/pos', icon: ShoppingCart, permission: 'orders.manage' },
  { label: 'Orders', labelKey: 'nav.orders', href: '/orders', icon: Receipt, permission: 'orders.manage' },
  { label: 'Menu', labelKey: 'nav.menu', href: '/menu', icon: UtensilsCrossed, permission: 'menu.manage' },
  { label: 'Inventory', labelKey: 'nav.inventory', href: '/inventory', icon: Package, permission: 'inventory.manage' },
  { label: 'Suppliers', labelKey: 'nav.suppliers', href: '/suppliers', icon: Truck, permission: 'inventory.manage' },
  { label: 'HR & Payroll', labelKey: 'nav.hr_payroll', href: '/hr', icon: Users, permission: 'hr.manage' },
  { label: 'Attendance', labelKey: 'nav.attendance', href: '/attendance', icon: CalendarDays, permission: 'hr.manage' },
  { label: 'Accounting', labelKey: 'nav.accounting', href: '/accounting', icon: CreditCard, permission: 'accounting.manage' },
  { label: 'Analytics', labelKey: 'nav.analytics', href: '/analytics', icon: BarChart3, permission: 'reports.view' },
  { label: 'Settings', labelKey: 'nav.settings', href: '/settings', icon: Settings, permission: 'settings.manage' },
];

const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard', labelKey: 'nav.dashboard', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Tenants', labelKey: 'nav.tenants', href: '/super-admin/tenants', icon: Building2 },
  { label: 'Subscriptions', labelKey: 'nav.subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
  { label: 'Users', labelKey: 'nav.users', href: '/super-admin/users', icon: Users },
  { label: 'Analytics', labelKey: 'nav.analytics', href: '/super-admin/analytics', icon: BarChart3 },
  { label: 'Settings', labelKey: 'nav.settings', href: '/super-admin/settings', icon: Settings },
];

export function Sidebar() {
  const { user, logout, hasPermission, hasRole } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = hasRole('super_admin');
  const navItems = isSuperAdmin ? superAdminNavItems : restaurantNavItems;

  const filteredItems = navItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.permission) return hasPermission(item.permission);
    if (item.roles) return item.roles.some((r) => hasRole(r));
    return true;
  });

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-border/10',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
              R
            </div>
            <span className="font-semibold text-sm truncate">{t('app.name')}</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const label = item.labelKey ? t(item.labelKey) : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-white'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? label : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-xs font-medium truncate">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-danger hover:bg-white/5 transition-colors',
            collapsed && 'justify-center px-2',
          )}
          title={t('common.logout')}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('common.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
