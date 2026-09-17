import { describe, expect, it } from 'vitest';
import { sanitizeText, sanitizeUrl } from './sanitize';

describe('sanitizeText', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('trims whitespace and strips control characters', () => {
    expect(sanitizeText('  hello\u0007world  ')).toBe('helloworld');
  });

  it('neutralizes leading formula-injection characters', () => {
    expect(sanitizeText('=cmd|/c calc')).toBe("'=cmd|/c calc");
    expect(sanitizeText('+1+1')).toBe("'+1+1");
  });
});

describe('sanitizeUrl', () => {
  it('accepts http/https/mailto URLs', () => {
    expect(sanitizeUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(sanitizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com');
  });

  it('rejects unsafe protocols like javascript:', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects malformed URLs safely instead of throwing', () => {
    expect(sanitizeUrl('not a url')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(sanitizeUrl('')).toBeUndefined();
    expect(sanitizeUrl(undefined)).toBeUndefined();
  });
});
