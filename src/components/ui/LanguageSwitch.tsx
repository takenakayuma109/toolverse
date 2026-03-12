'use client';

import { useLocaleStore } from '@/store/locale';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export default function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleStore();

  return (
    <button
      onClick={() => setLocale(locale === 'ja' ? 'en' : 'ja')}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
        className
      )}
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{locale === 'ja' ? 'EN' : 'JP'}</span>
    </button>
  );
}
