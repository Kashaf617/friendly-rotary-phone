'use client';

import { useI18n } from '@/lib/i18n-context';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
      className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-card-foreground hover:bg-muted transition-colors"
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <Languages className="h-4 w-4" />
      <span>{locale === 'ar' ? t('common.english') : t('common.arabic')}</span>
    </button>
  );
}
