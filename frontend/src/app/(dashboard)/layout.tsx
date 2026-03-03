'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { settingsApi, API_ORIGIN } from '@/lib/api';
import { Bell } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [logoFailed, setLogoFailed] = useState(false);

  const tenantId = user?.tenant_id;
  const canReadSettings =
    !!user && ['restaurant_admin', 'manager', 'cashier', 'waiter'].includes(user.role);

  const { data: settings } = useQuery({
    queryKey: ['settings', tenantId],
    enabled: !!tenantId && canReadSettings,
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

  const branding = useMemo(() => {
    const byKey = new Map<string, string>((settings || []).map((s: any) => [s.key, s.value]));
    return {
      business_name: byKey.get('BUSINESS_NAME') || null,
      business_logo_url: byKey.get('BUSINESS_LOGO_URL') || null,
    };
  }, [settings]);

  useEffect(() => {
    setLogoFailed(false);
  }, [branding.business_logo_url]);

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

  const displayBusinessName = branding.business_name || user.tenant_name || t('app.name');
  const computedLogoUrl = branding.business_logo_url?.startsWith('/uploads/')
    ? `${API_ORIGIN}${branding.business_logo_url}`
    : branding.business_logo_url || undefined;
  const showLogo = !!computedLogoUrl && !logoFailed;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {displayBusinessName}
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
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-bold text-white">
                {showLogo ? (
                  <img
                    src={computedLogoUrl as string}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <>
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </>
                )}
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
