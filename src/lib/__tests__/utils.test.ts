import { describe, it, expect } from 'vitest';
import { cn, formatNumber, formatCurrency, getStarRating } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('filters out falsy values', () => {
    expect(cn('a', undefined, null, '', 'b')).toBe('a b');
  });
});

describe('formatNumber', () => {
  it('returns plain number for values under 1000', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(12500)).toBe('12.5K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2500000)).toBe('2.5M');
    expect(formatNumber(10000000)).toBe('10.0M');
  });
});

describe('formatCurrency', () => {
  it('formats JPY by default', () => {
    const result = formatCurrency(1980);
    // JPY should not have decimal places
    expect(result).toContain('1,980');
  });

  it('formats USD', () => {
    const result = formatCurrency(19.99, 'USD');
    expect(result).toContain('$');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toBeDefined();
  });
});

describe('getStarRating', () => {
  it('returns all full stars for 5.0', () => {
    expect(getStarRating(5)).toBe('★★★★★');
  });

  it('returns all empty stars for 0', () => {
    expect(getStarRating(0)).toBe('☆☆☆☆☆');
  });

  it('handles half stars', () => {
    const result = getStarRating(3.5);
    // 3 full + 1 half(☆) + 1 empty(☆) = '★★★☆☆'
    expect(result).toBe('★★★☆☆');
  });

  it('rounds down partial ratings below 0.5', () => {
    const result = getStarRating(3.3);
    expect(result).toBe('★★★☆☆');
  });

  it('gives half star for 0.5 fraction', () => {
    const result = getStarRating(4.5);
    expect(result).toBe('★★★★☆');
  });

  it('handles rating of 1', () => {
    expect(getStarRating(1)).toBe('★☆☆☆☆');
  });
});
