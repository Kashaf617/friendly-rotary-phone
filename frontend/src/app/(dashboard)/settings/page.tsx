'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { settingsApi, uploadsApi, API_ORIGIN } from '@/lib/api';

export default function SettingsPage() {
  const { t } = useI18n();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(true);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatRatePercent, setVatRatePercent] = useState(5);
  const [businessName, setBusinessName] = useState('');
  const [businessLogoUrl, setBusinessLogoUrl] = useState('');
  const [initialized, setInitialized] = useState(false);

  const tenantId = user?.tenant_id;
  const canWriteSettings = hasRole('restaurant_admin');

  const parseBool = (value: string | undefined, defaultValue: boolean) => {
    const raw = value?.toLowerCase();
    if (raw === undefined) return defaultValue;
    return raw === 'true' || raw === '1' || raw === 'yes';
  };

  const parseVatRate = (value: string | undefined) => {
    let rate = value ? Number(value) : 0.05;
    if (!Number.isFinite(rate) || rate < 0) rate = 0.05;
    if (rate > 1) rate = rate / 100;
    return rate;
  };

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings', tenantId],
    enabled: !!tenantId,
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

  useEffect(() => {
    if (initialized || settingsLoading) return;

    const byKey = new Map<string, string>((settings || []).map((s: any) => [s.key, s.value]));

    const enabled = parseBool(byKey.get('VAT_ENABLED'), true);
    const rate = parseVatRate(byKey.get('VAT_RATE'));

    setVatEnabled(enabled);
    setVatRatePercent(Number((rate * 100).toFixed(2)));
    setBusinessName(byKey.get('BUSINESS_NAME') || user?.tenant_name || '');
    setBusinessLogoUrl(byKey.get('BUSINESS_LOGO_URL') || '');

    setInitialized(true);
  }, [initialized, settingsLoading, settings, user?.tenant_name]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const rate = Math.min(100, Math.max(0, vatRatePercent)) / 100;
      const normalizedRate = Number(rate.toFixed(4));

      await Promise.all([
        settingsApi.upsert({ key: 'VAT_ENABLED', value: vatEnabled ? 'true' : 'false' }),
        settingsApi.upsert({ key: 'VAT_RATE', value: String(normalizedRate) }),
        settingsApi.upsert({ key: 'BUSINESS_NAME', value: businessName || '' }),
        settingsApi.upsert({ key: 'BUSINESS_LOGO_URL', value: businessLogoUrl || '' }),
      ]);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings', tenantId] }),
        queryClient.invalidateQueries({ queryKey: ['vat-config', tenantId] }),
        queryClient.invalidateQueries({ queryKey: ['branding-config', tenantId] }),
      ]);
      alert(t('settings_page.success'));
    },
    onError: () => {
      alert(t('settings_page.error'));
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleLogoFile = async (file: File) => {
    try {
      const img = document.createElement('img');
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(img, 0, 0);
      const webp = canvas.toDataURL('image/webp', 0.8);
      const res = await uploadsApi.uploadBase64(webp, 'logo');
      const url = res.data?.data?.url || res.data?.url;
      if (url) setBusinessLogoUrl(url);
    } catch {
      alert('Failed to process image');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('settings_page.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings_page.subtitle')}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">{t('settings_page.language')}</h2>
          <LanguageToggle />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">{t('settings_page.theme')}</h2>
          <ThemeToggle />
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">{t('settings_page.notifications')}</h3>
              <p className="text-xs text-muted-foreground">Email + in-app alerts</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className="rounded-full border border-border px-4 py-1 text-xs"
            >
              {notifications ? 'On' : 'Off'}
            </button>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">{t('settings_page.vat')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">{t('settings_page.vat_enabled')}</h3>
              <p className="text-xs text-muted-foreground">{t('settings_page.vat_enabled_help')}</p>
            </div>
            <button
              onClick={() => setVatEnabled(!vatEnabled)}
              className="rounded-full border border-border px-4 py-1 text-xs disabled:opacity-60"
              type="button"
              disabled={!canWriteSettings}
            >
              {vatEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">{t('settings_page.vat_rate')}</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={vatRatePercent}
                onChange={(e) => setVatRatePercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                disabled={!vatEnabled || !canWriteSettings}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">{t('settings_page.branding')}</h2>
          <label className="text-xs text-muted-foreground">{t('settings_page.business_name')}</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
            disabled={!canWriteSettings}
          />

          <label className="text-xs text-muted-foreground">{t('settings_page.business_logo_url')}</label>
          <input
            type="text"
            value={businessLogoUrl}
            onChange={(e) => setBusinessLogoUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
            disabled={!canWriteSettings}
          />
          <input
            type="file"
            accept="image/*"
            disabled={!canWriteSettings}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoFile(f);
              e.currentTarget.value = '';
            }}
            className="mt-2 block w-full text-xs"
          />

          {businessLogoUrl && (
            <div className="pt-1">
              <img
                src={businessLogoUrl.startsWith('/uploads/') ? `${API_ORIGIN}${businessLogoUrl}` : businessLogoUrl}
                alt=""
                className="h-12 w-12 rounded-lg border border-border object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </section>

        <button
          onClick={handleSave}
          disabled={!canWriteSettings || saveMutation.isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
          type="button"
        >
          {t('settings_page.save')}
        </button>
      </div>
    </div>
  );
}
