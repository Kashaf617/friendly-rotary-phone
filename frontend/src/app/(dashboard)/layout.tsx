'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Bell } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {user.tenant_name || t('app.name')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-card-foreground hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <LanguageToggle />
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
