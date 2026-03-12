'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Home, Compass, LayoutGrid, Wrench, User } from 'lucide-react';

type PageView = 'home' | 'discover' | 'workspace' | 'studio' | 'account' | 'auth' | 'billing' | 'admin';

const NAV_ITEMS = [
  { key: 'home' as PageView, Icon: Home },
  { key: 'discover' as PageView, Icon: Compass },
  { key: 'workspace' as PageView, Icon: LayoutGrid },
  { key: 'studio' as PageView, Icon: Wrench },
  { key: 'account' as PageView, Icon: User },
] as const;

interface MobileNavProps {
  onNavigate: (page: PageView) => void;
  currentPage: PageView;
}

export default function MobileNav({ onNavigate, currentPage }: MobileNavProps) {
  const { t } = useTranslation();

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 md:hidden',
        'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl',
        'border-t border-gray-200/50 dark:border-gray-800/50',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ key, Icon }) => {
          const isActive = currentPage === key;
          const label = t(`nav.${key}`);
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 rounded-xl transition-all duration-200 active:scale-95',
                isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <span
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                  isActive && 'bg-violet-100 dark:bg-violet-950/50'
                )}
              >
                <Icon
                  className="w-6 h-6 transition-all duration-200"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </span>
              <span
                className={cn(
                  'mt-1 text-xs font-medium truncate max-w-full',
                  isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
