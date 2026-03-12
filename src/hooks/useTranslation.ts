'use client';

import { useCallback } from 'react';
import { useLocaleStore } from '@/store/locale';
import ja from '@/i18n/messages/ja.json';
import en from '@/i18n/messages/en.json';
import zh from '@/i18n/messages/zh.json';
import ko from '@/i18n/messages/ko.json';
import fr from '@/i18n/messages/fr.json';
import de from '@/i18n/messages/de.json';
import es from '@/i18n/messages/es.json';
import pt from '@/i18n/messages/pt.json';
import ar from '@/i18n/messages/ar.json';
import ru from '@/i18n/messages/ru.json';
import hi from '@/i18n/messages/hi.json';

const messages = { ja, en, zh, ko, fr, de, es, pt, ar, ru, hi } as const;

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

type TranslationKey = NestedKeyOf<typeof ja>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const msg = messages[locale];

  const t = useCallback(
    (key: TranslationKey | (string & {})): string => {
      return getNestedValue(msg as unknown as Record<string, unknown>, key);
    },
    [msg]
  );

  return { t, locale };
}
