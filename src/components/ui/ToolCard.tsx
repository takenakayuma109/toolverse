'use client';

import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import { Star, Users } from 'lucide-react';
import type { Tool } from '@/types';

interface ToolCardProps {
  tool: Tool;
  variant?: 'grid' | 'list';
  className?: string;
}

export default function ToolCard({ tool, variant = 'grid', className }: ToolCardProps) {
  const { t } = useTranslation();

  if (variant === 'list') {
    return (
      <Card hover className={cn('flex items-center gap-4', className)}>
        <div className="text-3xl flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/30 border border-white/20 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5">
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{tool.name}</h3>
            {tool.isOfficial && <Badge variant="gradient" size="sm">{t('common.official')}</Badge>}
            {tool.isTrending && <Badge variant="warning" size="sm">{t('common.trending')}</Badge>}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{tool.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tool.rating}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(tool.userCount)}</span>
            <span>{tool.pricing.type === 'free' ? t('common.free') : tool.pricing.price ? `¥${tool.pricing.price}/mo` : t('common.freemium')}</span>
          </div>
        </div>
        <Button size="sm" variant="outline" className="whitespace-nowrap flex-shrink-0">{t('marketplace.view') || 'View'}</Button>
      </Card>
    );
  }

  return (
    <Card hover className={cn('flex flex-col', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl w-14 h-14 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/30 border border-white/20 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5">
          {tool.icon}
        </div>
        <div className="flex gap-1">
          {tool.isOfficial && <Badge variant="gradient" size="sm">{t('common.official')}</Badge>}
          {tool.isTrending && <Badge variant="warning" size="sm">🔥</Badge>}
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{tool.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 flex-1">{tool.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {tool.rating}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formatNumber(tool.userCount)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {tool.pricing.type === 'free' ? t('common.free') : tool.pricing.price ? `¥${tool.pricing.price}/mo` : t('common.freemium')}
        </span>
        <Button size="sm" className="whitespace-nowrap flex-shrink-0">{t('marketplace.view') || 'View'}</Button>
      </div>
    </Card>
  );
}
