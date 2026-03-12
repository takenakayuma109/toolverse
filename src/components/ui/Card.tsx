'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({ children, className, hover = false, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800',
        hover && 'hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer',
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
