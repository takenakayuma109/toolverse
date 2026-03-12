'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        {
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300': variant === 'default',
          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400': variant === 'success',
          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': variant === 'warning',
          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400': variant === 'error',
          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': variant === 'info',
          'bg-gradient-to-r from-violet-600 to-indigo-600 text-white': variant === 'gradient',
        },
        {
          'text-xs px-2 py-0.5': size === 'sm',
          'text-sm px-3 py-1': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
