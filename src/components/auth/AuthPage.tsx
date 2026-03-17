'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { isValidEmail, validatePassword as secureValidatePassword, sanitizeInput, RateLimiter } from '@/lib/security';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, User, Github, Apple, CheckCircle2, ArrowLeft } from 'lucide-react';

type AuthTab = 'signin' | 'signup' | 'forgot-password' | 'reset-password';

const authRateLimiter = new RateLimiter(5, 60000);

export default function AuthPage() {
  const { t } = useTranslation();
  const {
    isLoading,
    isAuthenticated,
    signInWithGoogle,
    signInWithGitHub,
    signInWithApple,
    signInWithEmail,
    signUp,
    forgotPassword,
    resetPassword,
  } = useAuthStore();

  const [tab, setTab] = useState<AuthTab>(() => {
    if (typeof window === 'undefined') return 'signin';
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'reset-password' && params.get('token') && params.get('email')) {
      return 'reset-password';
    }
    return 'signin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [nameError, setNameError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Token from URL for password reset
  const [resetToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('token') ?? '';
  });
  const [resetEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    return emailParam ? decodeURIComponent(emailParam) : '';
  });

  const isSignUp = tab === 'signup';
  const isForgotPassword = tab === 'forgot-password';
  const isResetPassword = tab === 'reset-password';

  const validateEmailField = (v: string) => {
    if (!v) return t('auth.emailRequired') || 'Email is required';
    if (!isValidEmail(v)) return t('auth.emailInvalid') || 'Invalid email address';
    return '';
  };

  const validatePasswordField = (v: string) => {
    if (!v) return t('auth.passwordRequired') || 'Password is required';
    const result = secureValidatePassword(v);
    if (!result.valid) return t('auth.passwordWeak') || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    return '';
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const { allowed, retryAfterMs } = authRateLimiter.check('forgot-password');
    if (!allowed) {
      const seconds = Math.ceil(retryAfterMs / 1000);
      setEmailError(t('auth.rateLimited') || `Too many attempts. Please wait ${seconds} seconds.`);
      return;
    }

    const eErr = validateEmailField(email);
    setEmailError(eErr);
    if (eErr) return;

    try {
      await forgotPassword(email);
      setSuccessMessage(t('auth.resetLinkSent') || 'If an account with that email exists, a password reset link has been sent.');
    } catch {
      // Still show success to avoid leaking email existence
      setSuccessMessage(t('auth.resetLinkSent') || 'If an account with that email exists, a password reset link has been sent.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const { allowed, retryAfterMs } = authRateLimiter.check('reset-password');
    if (!allowed) {
      const seconds = Math.ceil(retryAfterMs / 1000);
      setPasswordError(t('auth.rateLimited') || `Too many attempts. Please wait ${seconds} seconds.`);
      return;
    }

    const pErr = validatePasswordField(password);
    const cErr = password !== confirmPassword ? (t('auth.passwordMismatch') || 'Passwords do not match') : '';
    setPasswordError(pErr);
    setConfirmError(cErr);
    if (pErr || cErr) return;

    try {
      await resetPassword(resetToken, resetEmail, password);
      setSuccessMessage(t('auth.resetPasswordSuccess') || 'Your password has been reset successfully. You can now sign in.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('expired')) {
        setPasswordError(t('auth.resetTokenExpired') || 'This reset link has expired. Please request a new one.');
      } else {
        setPasswordError(t('auth.resetTokenInvalid') || 'Invalid reset link. Please request a new one.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { allowed, retryAfterMs } = authRateLimiter.check('auth-submit');
    if (!allowed) {
      const seconds = Math.ceil(retryAfterMs / 1000);
      setEmailError(t('auth.rateLimited') || `Too many attempts. Please wait ${seconds} seconds.`);
      return;
    }

    const eErr = validateEmailField(email);
    const pErr = validatePasswordField(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (isSignUp) {
      const sanitizedName = sanitizeInput(name.trim());
      const nErr = sanitizedName ? '' : 'Name is required';
      const cErr = password !== confirmPassword ? 'Passwords do not match' : '';
      setNameError(nErr);
      setConfirmError(cErr);
      if (eErr || pErr || nErr || cErr || !agreeTerms) return;
      await signUp(email, password, sanitizedName);
    } else {
      if (eErr || pErr) return;
      await signInWithEmail(email, password);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.loginSuccess') || 'Login successful'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('auth.redirecting') || 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

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

        <Card padding="lg" className="shadow-2xl shadow-gray-200/50 dark:shadow-none">
          {/* Forgot Password View */}
          {isForgotPassword && (
            <>
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setSuccessMessage('');
                  setEmailError('');
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToSignIn') || 'Back to Sign In'}
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.forgotPasswordTitle') || 'Reset your password'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('auth.forgotPasswordDescription') || "Enter your email address and we'll send you a link to reset your password."}
              </p>

              {successMessage ? (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      {successMessage}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input
                    type="email"
                    label={t('auth.email')}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    icon={<Mail className="w-4 h-4" />}
                    error={emailError}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                  >
                    {t('auth.sendResetLink') || 'Send Reset Link'}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Reset Password View */}
          {isResetPassword && (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.resetPasswordTitle') || 'Set a new password'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('auth.resetPasswordDescription') || 'Enter your new password below.'}
              </p>

              {successMessage ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    onClick={() => {
                      setTab('signin');
                      setSuccessMessage('');
                      setPassword('');
                      setConfirmPassword('');
                      // Clean up URL params
                      if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', '/auth');
                      }
                    }}
                  >
                    {t('common.signIn')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <Input
                    type="password"
                    label={t('auth.newPassword') || 'New Password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    icon={<Lock className="w-4 h-4" />}
                    error={passwordError}
                  />
                  <Input
                    type="password"
                    label={t('auth.confirmNewPassword') || 'Confirm New Password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError('');
                    }}
                    icon={<Lock className="w-4 h-4" />}
                    error={confirmError}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                  >
                    {t('auth.resetPassword') || 'Reset Password'}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Sign In / Sign Up View */}
          {!isForgotPassword && !isResetPassword && (
            <>
              {/* Tabs */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    tab === 'signin'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {t('common.signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    tab === 'signup'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {t('common.signUp')}
                </button>
              </div>

              {/* Social login buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  onClick={signInWithGoogle}
                  className="flex items-center justify-center gap-3 border-2 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 font-medium"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="truncate">{t('auth.google')}</span>
                </Button>
              </div>

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

              {/* Email/password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <Input
                    type="text"
                    label={t('auth.name') || 'Name'}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    icon={<User className="w-4 h-4" />}
                    error={nameError}
                  />
                )}
                <Input
                  type="email"
                  label={t('auth.email')}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  icon={<Mail className="w-4 h-4" />}
                  error={emailError}
                />
                <Input
                  type="password"
                  label={t('auth.password')}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  icon={<Lock className="w-4 h-4" />}
                  error={passwordError}
                />
                {isSignUp && (
                  <>
                    <Input
                      type="password"
                      label={t('auth.confirmPassword')}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmError) setConfirmError('');
                      }}
                      icon={<Lock className="w-4 h-4" />}
                      error={confirmError}
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
                      onClick={() => {
                        setTab('forgot-password');
                        setSuccessMessage('');
                        setEmailError('');
                        setPasswordError('');
                      }}
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
                  isLoading={isLoading}
                  disabled={isSignUp && !agreeTerms}
                >
                  {isSignUp ? t('common.signUp') : t('common.signIn')}
                </Button>
              </form>

              {/* Toggle hint */}
              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setTab(isSignUp ? 'signin' : 'signup')}
                  className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {isSignUp ? t('common.signIn') : t('common.signUp')}
                </button>
              </p>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          {t('auth.agreeTermsLong') || 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
        </p>
      </div>
    </div>
  );
}
