import { create } from 'zustand';
import type { User } from '@/types';

const STORAGE_KEY = 'toolverse-auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  getInitialAuth: () => void;
}

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'usr_' + Math.random().toString(36).slice(2, 10),
    email: 'yuma@toolverse.com',
    name: 'Yuma Takenaka',
    avatar: 'gradient:violet-indigo',
    role: 'admin',
    locale: 'ja',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function saveSession(user: User) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  signInWithGoogle: async () => {
    set({ isLoading: true });
    await delay(800);
    const user = createMockUser({
      name: 'Yuma Takenaka',
      email: 'yuma@toolverse.com',
      avatar: 'gradient:violet-indigo',
      role: 'admin',
    });
    saveSession(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  signInWithGitHub: async () => {
    set({ isLoading: true });
    await delay(800);
    const user = createMockUser({
      name: 'Yuma Takenaka',
      email: 'yuma@github.com',
      avatar: 'gradient:gray-slate',
      role: 'admin',
    });
    saveSession(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    await delay(800);
    const user = createMockUser({
      name: 'Yuma Takenaka',
      email: 'yuma@icloud.com',
      avatar: 'gradient:zinc-neutral',
      role: 'admin',
    });
    saveSession(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  signInWithEmail: async (email: string, _password: string) => {
    set({ isLoading: true });
    await delay(800);
    const user = createMockUser({
      email,
      name: email.split('@')[0],
      avatar: 'gradient:emerald-teal',
      role: 'user',
    });
    saveSession(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  signUp: async (email: string, _password: string, name: string) => {
    set({ isLoading: true });
    await delay(800);
    const user = createMockUser({
      email,
      name,
      avatar: 'gradient:rose-pink',
      role: 'user',
    });
    saveSession(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  signOut: () => {
    clearSession();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  getInitialAuth: () => {
    const user = loadSession();
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },
}));
