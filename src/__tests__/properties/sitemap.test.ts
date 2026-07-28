import { describe, expect, it } from 'vitest';
import sitemap, { getSitemapUrlCount } from '@/app/sitemap';
import { indexableLocales } from '@/lib/i18n/config';

describe('sitemap', () => {
  it('publishes canonical, translated URLs with language alternates', () => {
    const entries = sitemap();

    expect(entries).toHaveLength(getSitemapUrlCount());
    expect(entries.length % indexableLocales.length).toBe(0);
    expect(entries.every((entry) => entry.url.endsWith('/'))).toBe(true);
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
    expect(entries.some((entry) => entry.url.includes('/ro/'))).toBe(false);
    expect(entries.some((entry) => entry.url.endsWith('/en/tools/category/secure-pdf/'))).toBe(true);
    expect(entries.some((entry) => entry.url.endsWith('/en/beta/'))).toBe(true);
    expect(entries.some((entry) => entry.url.endsWith('/en/terms/'))).toBe(true);

    for (const entry of entries) {
      const languages = entry.alternates?.languages;
      expect(languages?.ro).toBeUndefined();
      expect(languages?.['x-default']).toContain('/en/');
    }
  });
});
