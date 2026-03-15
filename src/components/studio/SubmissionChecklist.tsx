'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';
import {
  REVIEW_CHECKLIST_ITEMS,
  CHECKLIST_CATEGORIES,
  type ChecklistCategory,
} from '@/lib/review-checklist';
import Button from '@/components/ui/Button';
import {
  Shield,
  Zap,
  FileText,
  Lock,
  Server,
  DollarSign,
  CheckCircle2,
  Circle,
  BotIcon,
  Send,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

/* ── Category metadata ──────────────────────────────────── */

const CATEGORY_META: Record<
  ChecklistCategory,
  { icon: typeof Shield; labelKey: string; colorClass: string }
> = {
  security: {
    icon: Shield,
    labelKey: 'studio.checklist.categorySecurity',
    colorClass: 'text-red-500 dark:text-red-400',
  },
  performance: {
    icon: Zap,
    labelKey: 'studio.checklist.categoryPerformance',
    colorClass: 'text-amber-500 dark:text-amber-400',
  },
  content: {
    icon: FileText,
    labelKey: 'studio.checklist.categoryContent',
    colorClass: 'text-blue-500 dark:text-blue-400',
  },
  privacy: {
    icon: Lock,
    labelKey: 'studio.checklist.categoryPrivacy',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
  },
  technical: {
    icon: Server,
    labelKey: 'studio.checklist.categoryTechnical',
    colorClass: 'text-violet-500 dark:text-violet-400',
  },
  business: {
    icon: DollarSign,
    labelKey: 'studio.checklist.categoryBusiness',
    colorClass: 'text-cyan-500 dark:text-cyan-400',
  },
};

/* ── Component ──────────────────────────────────────────── */

export default function SubmissionChecklist() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'universe';
  const isEarth = theme === 'earth';

  // Track manually-checked items
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  // Track expanded/collapsed categories
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHECKLIST_CATEGORIES.map((c) => [c, true]))
  );

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCategory = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // Group items by category
  const grouped = useMemo(() => {
    const map = new Map<ChecklistCategory, typeof REVIEW_CHECKLIST_ITEMS>();
    for (const cat of CHECKLIST_CATEGORIES) map.set(cat, []);
    for (const item of REVIEW_CHECKLIST_ITEMS) {
      map.get(item.category)!.push(item);
    }
    return map;
  }, []);

  // Progress
  const totalRequired = REVIEW_CHECKLIST_ITEMS.filter((i) => i.required).length;
  const checkedRequired = REVIEW_CHECKLIST_ITEMS.filter(
    (i) => i.required && (i.automated || checked[i.id])
  ).length;
  const progress = totalRequired === 0 ? 100 : Math.round((checkedRequired / totalRequired) * 100);
  const allRequiredDone = checkedRequired === totalRequired;

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 md:p-8 space-y-6',
        isDark && 'bg-gray-900 border-gray-800',
        isEarth && 'bg-white border-gray-200'
      )}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div>
        <h2
          className={cn(
            'text-xl font-bold',
            isDark && 'text-white',
            isEarth && 'text-gray-900'
          )}
        >
          {t('studio.checklist.title')}
        </h2>
        <p
          className={cn(
            'mt-1 text-sm',
            isDark && 'text-gray-400',
            isEarth && 'text-gray-500'
          )}
        >
          {t('studio.checklist.subtitle')}
        </p>
      </div>

      {/* ── Progress bar ─────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span
            className={cn(
              'font-medium',
              isDark && 'text-gray-300',
              isEarth && 'text-gray-700'
            )}
          >
            {t('studio.checklist.progress')}
          </span>
          <span
            className={cn(
              'font-semibold tabular-nums',
              allRequiredDone
                ? 'text-emerald-500'
                : isDark
                  ? 'text-gray-300'
                  : 'text-gray-700'
            )}
          >
            {checkedRequired}/{totalRequired} ({progress}%)
          </span>
        </div>
        <div
          className={cn(
            'h-2.5 w-full rounded-full overflow-hidden',
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              allRequiredDone
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Category groups ──────────────────────────────── */}
      <div className="space-y-3">
        {CHECKLIST_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const items = grouped.get(cat)!;
          const isExpanded = expanded[cat];
          const catDone = items
            .filter((i) => i.required)
            .every((i) => i.automated || checked[i.id]);

          return (
            <div
              key={cat}
              className={cn(
                'rounded-xl border overflow-hidden',
                isDark && 'border-gray-800 bg-gray-900/50',
                isEarth && 'border-gray-100 bg-gray-50/50'
              )}
            >
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                  isDark && 'hover:bg-gray-800/60',
                  isEarth && 'hover:bg-gray-100/80'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', meta.colorClass)} />
                <span
                  className={cn(
                    'flex-1 text-sm font-semibold',
                    isDark && 'text-white',
                    isEarth && 'text-gray-900'
                  )}
                >
                  {t(meta.labelKey)}
                </span>
                {catDone && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                {isExpanded ? (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    )}
                  />
                ) : (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    )}
                  />
                )}
              </button>

              {/* Items */}
              {isExpanded && (
                <div
                  className={cn(
                    'divide-y',
                    isDark ? 'divide-gray-800' : 'divide-gray-100'
                  )}
                >
                  {items.map((item) => {
                    const isChecked = item.automated || !!checked[item.id];
                    return (
                      <label
                        key={item.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 transition-colors select-none',
                          !item.automated && 'cursor-pointer',
                          isDark && 'hover:bg-gray-800/40',
                          isEarth && 'hover:bg-gray-100/60'
                        )}
                      >
                        {/* Checkbox / auto indicator */}
                        <span className="mt-0.5 shrink-0">
                          {item.automated ? (
                            <span
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-md text-xs',
                                isDark
                                  ? 'bg-violet-500/20 text-violet-400'
                                  : 'bg-violet-100 text-violet-600'
                              )}
                              title={t('studio.checklist.automated')}
                            >
                              <BotIcon className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="relative flex h-5 w-5 items-center justify-center">
                              <input
                                type="checkbox"
                                checked={!!checked[item.id]}
                                onChange={() => toggle(item.id)}
                                className="peer sr-only"
                              />
                              {isChecked ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <Circle
                                  className={cn(
                                    'h-5 w-5',
                                    isDark ? 'text-gray-600' : 'text-gray-300'
                                  )}
                                />
                              )}
                            </span>
                          )}
                        </span>

                        {/* Text */}
                        <span className="flex-1 min-w-0">
                          <span
                            className={cn(
                              'block text-sm font-medium leading-5',
                              isChecked
                                ? isDark
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                                : isDark
                                  ? 'text-white'
                                  : 'text-gray-900'
                            )}
                          >
                            {t(item.titleKey)}
                            {item.required && (
                              <span className="ml-1 text-red-400 text-xs align-super">*</span>
                            )}
                          </span>
                          <span
                            className={cn(
                              'block text-xs mt-0.5 leading-4',
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            )}
                          >
                            {t(item.descKey)}
                          </span>
                        </span>

                        {/* Badge for automated items */}
                        {item.automated && (
                          <span
                            className={cn(
                              'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                              isDark
                                ? 'bg-violet-500/15 text-violet-400'
                                : 'bg-violet-50 text-violet-600'
                            )}
                          >
                            {t('studio.checklist.autoVerified')}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Legend ────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-4 text-xs',
          isDark ? 'text-gray-500' : 'text-gray-400'
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-red-400">*</span> {t('studio.checklist.requiredLabel')}
        </span>
        <span className="flex items-center gap-1.5">
          <BotIcon className="h-3.5 w-3.5 text-violet-500" />
          {t('studio.checklist.automatedLabel')}
        </span>
      </div>

      {/* ── Submit button ────────────────────────────────── */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!allRequiredDone}
      >
        <Send className="h-4 w-4" />
        {t('studio.checklist.submitForReview')}
      </Button>
    </div>
  );
}
