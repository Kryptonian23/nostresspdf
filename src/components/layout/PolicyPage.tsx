import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Locale } from '@/lib/i18n/config';

export function PolicyPage({
  locale,
  title,
  intro,
  children,
}: {
  locale: Locale;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--color-background))]">
      <Header locale={locale} />
      <main id="main-content" className="flex-1 pt-28 pb-20" tabIndex={-1}>
        <article className="container mx-auto max-w-3xl px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mb-10 text-lg leading-relaxed text-[hsl(var(--color-muted-foreground))]">{intro}</p>
          <div className="space-y-8 leading-relaxed text-[hsl(var(--color-foreground))]">{children}</div>
        </article>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
