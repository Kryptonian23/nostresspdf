import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n/config';

export function BetaBanner({ locale }: { locale: Locale }) {
  if (!siteConfig.betaMode) return null;

  return (
    <aside
      aria-label="Beta notice"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-amber-500/40 bg-[hsl(var(--color-background)/0.96)] px-4 py-2 text-center text-sm text-[hsl(var(--color-foreground))] shadow-lg backdrop-blur"
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <FlaskConical className="h-4 w-4 text-amber-500" aria-hidden="true" />
        <strong>Beta:</strong>
        <span>test with non-sensitive copies and verify important output before relying on it.</span>
        <Link className="font-semibold underline underline-offset-2" href={`/${locale}/beta`}>
          Read beta notes
        </Link>
      </span>
    </aside>
  );
}
