'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Eye, EyeOff, LogIn, Shield, Users, ShoppingCart, ChefHat, Crown } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    demoLogin(role);
    if (role === 'super_admin') {
      router.push('/super-admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white font-bold text-xl">
              R
            </div>
            <h1 className="text-3xl font-bold">Restaurant ERP</h1>
          </div>
          <p className="text-lg text-white/70 mb-6">
            AI-powered restaurant management platform built for the Dubai market.
          </p>
          <div className="space-y-4 text-sm text-white/60">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Multi-tenant SaaS with role-based access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>POS, Inventory, HR & Payroll management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>UAE VAT-compliant invoicing with TRN</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>AI-driven sales forecasting & analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white font-bold">
              R
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('app.name')}</h1>
            <div className="ml-auto">
              <LanguageToggle />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground">{t('auth.welcome_back')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('auth.sign_in_to_continue')}</p>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo-restaurant.ae"
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 px-4 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/register" className="text-sm text-accent hover:text-accent-dark">
              {t('auth.dont_have_account')}
            </a>
          </div>

          {/* Quick Demo Login Buttons */}
          <div className="mt-6 rounded-lg bg-muted border border-border p-4">
            <p className="text-xs font-bold text-foreground mb-3">{t('auth.quick_demo_login')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('restaurant_admin')}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-accent hover:bg-accent/5 transition-all"
              >
                <Shield className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{t('auth.admin')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('auth.full_access')}</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin('manager')}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-secondary hover:bg-secondary/5 transition-all"
              >
                <Users className="h-4 w-4 text-secondary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{t('auth.manager')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('auth.operations')}</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin('cashier')}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-warning hover:bg-warning/5 transition-all"
              >
                <ShoppingCart className="h-4 w-4 text-warning shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{t('auth.cashier')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('auth.pos_orders')}</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin('super_admin')}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-info hover:bg-info/5 transition-all"
              >
                <Crown className="h-4 w-4 text-info shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{t('auth.super_admin')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('auth.platform_level')}</p>
                </div>
              </button>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground text-center">
              Or type: admin@demo-restaurant.ae / Admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
