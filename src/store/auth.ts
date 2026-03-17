import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  getInitialAuth: () => void;
}

/**
 * Map a NextAuth session user to our app User type.
 */
function toAppUser(sessionUser: {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}): User {
  return {
    id: sessionUser.id ?? '',
    email: sessionUser.email ?? '',
    name: sessionUser.name ?? '',
    avatar: sessionUser.image ?? undefined,
    role: (sessionUser.role as User['role']) ?? 'user',
    locale: 'ja',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fetch the current session from NextAuth and return the user if authenticated.
 */
async function fetchSession(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.user?.email) {
      return toAppUser(data.user);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sign in via credentials using NextAuth's CSRF-protected flow.
 * NextAuth v5 expects the credentials POSTed to /api/auth/callback/credentials
 * along with a csrfToken obtained from /api/auth/csrf.
 */
async function credentialsSignIn(email: string, password: string): Promise<void> {
  // 1. Obtain CSRF token
  const csrfRes = await fetch('/api/auth/csrf');
  if (!csrfRes.ok) throw new Error('Failed to obtain CSRF token');
  const { csrfToken } = await csrfRes.json();

  // 2. POST credentials
  const res = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      redirect: 'false',
      json: 'true',
    }),
    redirect: 'manual',
  });

  // NextAuth returns a redirect (302) on success when using credentials.
  // With redirect: "manual" we get an opaque redirect or 200.
  // If it returns 401 or a body with error, auth failed.
  if (res.status === 401) {
    throw new Error('Invalid email or password');
  }

  // Some NextAuth versions return JSON with an error field
  if (res.headers.get('content-type')?.includes('application/json')) {
    const data = await res.json();
    if (data?.error) {
      throw new Error(data.error);
    }
  }
}

/**
 * Initiate OAuth sign-in via NextAuth's CSRF-protected flow.
 *
 * NextAuth v5 requires a POST to /api/auth/signin/{provider} with a valid
 * csrfToken. A bare GET redirect lands on NextAuth's built-in page which
 * then errors out when the server-side config doesn't match expectations.
 *
 * We build a hidden form, populate it with the csrfToken and a callbackUrl,
 * then submit it so the browser follows the 302 redirect to the OAuth
 * provider exactly like NextAuth expects.
 */
async function oauthSignIn(provider: 'google' | 'github' | 'apple'): Promise<void> {
  // 1. Obtain CSRF token
  const csrfRes = await fetch('/api/auth/csrf');
  if (!csrfRes.ok) throw new Error('Failed to obtain CSRF token');
  const { csrfToken } = await csrfRes.json();

  // 2. Build and submit a hidden form (POST) to initiate the OAuth redirect
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `/api/auth/signin/${provider}`;
  form.style.display = 'none';

  const csrfInput = document.createElement('input');
  csrfInput.type = 'hidden';
  csrfInput.name = 'csrfToken';
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  const callbackInput = document.createElement('input');
  callbackInput.type = 'hidden';
  callbackInput.name = 'callbackUrl';
  callbackInput.value = window.location.origin;
  form.appendChild(callbackInput);

  document.body.appendChild(form);
  form.submit();
}

/**
 * Sign out by calling NextAuth's sign-out endpoint.
 */
async function nextAuthSignOut(): Promise<void> {
  try {
    const csrfRes = await fetch('/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();

    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        csrfToken,
        redirect: 'false',
        json: 'true',
      }),
    });
  } catch {
    // Best-effort sign out
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      await oauthSignIn('google');
      // Browser will redirect, so loading stays true
    } catch (err) {
      console.error('[auth] Google sign-in failed:', err);
      set({ isLoading: false });
    }
  },

  signInWithGitHub: async () => {
    set({ isLoading: true });
    try {
      await oauthSignIn('github');
    } catch (err) {
      console.error('[auth] GitHub sign-in failed:', err);
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      await oauthSignIn('apple');
    } catch (err) {
      console.error('[auth] Apple sign-in failed:', err);
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await credentialsSignIn(email, password);
      // After successful sign-in, fetch the session to get user data
      const user = await fetchSession();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('Authentication failed');
      }
    } catch {
      set({ isLoading: false });
      throw new Error('Invalid email or password');
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      // 1. Create the account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sign up failed');
      }

      // 2. Auto sign-in after successful registration
      await credentialsSignIn(email, password);
      const user = await fetchSession();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('Auto sign-in after registration failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send reset email');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset password');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: () => {
    nextAuthSignOut();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  getInitialAuth: () => {
    // Fetch session from NextAuth on app load
    fetchSession().then((user) => {
      if (user) {
        set({ user, isAuthenticated: true });
      }
    });
  },
}));
