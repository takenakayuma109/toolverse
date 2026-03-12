'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, Github, Apple } from 'lucide-react';

export default function AuthPage() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - no actual auth
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/20">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-2xl font-bold shadow-xl shadow-violet-500/30 mb-4">
            T
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('common.appName')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('common.tagline')}
          </p>
        </div>

        {/* Auth card */}
        <Card padding="lg" className="shadow-2xl shadow-gray-200/50 dark:shadow-none">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">
            {isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label={t('auth.email')}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              type="password"
              label={t('auth.password')}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
            {isSignUp && (
              <>
                <Input
                  type="password"
                  label={t('auth.confirmPassword')}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required={isSignUp}
                />
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {t('auth.agreeTerms')}
                  </span>
                </label>
              </>
            )}
            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isSignUp && !agreeTerms}
            >
              {isSignUp ? t('common.signUp') : t('common.signIn')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex flex-col items-center gap-1 py-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-xs hidden sm:inline">{t('auth.google')}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex flex-col items-center gap-1 py-3"
            >
              <Apple className="w-5 h-5" />
              <span className="text-xs hidden sm:inline">{t('auth.apple')}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex flex-col items-center gap-1 py-3"
            >
              <Github className="w-5 h-5" />
              <span className="text-xs hidden sm:inline">{t('auth.github')}</span>
            </Button>
          </div>

          {/* Toggle sign in / sign up */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              {isSignUp ? t('common.signIn') : t('common.signUp')}
            </button>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
