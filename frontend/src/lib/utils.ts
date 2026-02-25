import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const FALLBACK_LANG = 'en';

function getActiveLocale() {
  if (typeof document !== 'undefined') {
    return document.documentElement.lang || FALLBACK_LANG;
  }
  return FALLBACK_LANG;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'AED', locale?: string) {
  const lang = locale || getActiveLocale();
  return `${currency} ${amount.toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date, locale?: string) {
  const lang = locale || getActiveLocale();
  return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-AE', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale?: string) {
  const lang = locale || getActiveLocale();
  return new Date(date).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-AE', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
