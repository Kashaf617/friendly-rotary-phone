'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Building2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', tenant_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white font-bold">R</div>
          <h1 className="text-2xl font-bold text-foreground">{t('auth.start_free_trial')}</h1>
          <div className="ml-auto">
            <LanguageToggle />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">14-day free trial. No credit card required.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Restaurant Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={form.tenant_name} onChange={(e) => update('tenant_name', e.target.value)}
                placeholder="My Restaurant Dubai" required
                className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
              <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)}
                placeholder="Ahmed" required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
              <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)}
                placeholder="Al Maktoum" required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              placeholder="admin@restaurant.ae" required
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
              placeholder="Min 6 characters" required minLength={6}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? 'Creating account...' : 'Start Free Trial'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <a href="/login" className="text-accent hover:text-accent-dark">Sign in</a>
        </p>
      </div>
    </div>
  );
}
