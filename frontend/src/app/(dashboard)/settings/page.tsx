'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function SettingsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState(true);
  const [brandName, setBrandName] = useState('Demo Restaurant');

  const handleSave = () => {
    alert(t('settings_page.success'));
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
          <h2 className="text-sm font-semibold text-card-foreground">{t('settings_page.branding')}</h2>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </section>

        <button
          onClick={handleSave}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          {t('settings_page.save')}
        </button>
      </div>
    </div>
  );
}
