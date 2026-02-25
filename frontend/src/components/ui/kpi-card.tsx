'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'accent' | 'secondary' | 'danger' | 'warning' | 'info';
  className?: string;
}

const colorMap = {
  accent: 'bg-accent/10 text-accent',
  secondary: 'bg-secondary/10 text-secondary',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export function KpiCard({ title, value, subtitle, icon: Icon, trend, color = 'accent', className }: KpiCardProps) {
  return (
    <div className={cn('bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-card-foreground">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn('mt-2 inline-flex items-center text-xs font-medium', trend.value >= 0 ? 'text-accent' : 'text-danger')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </div>
          )}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
