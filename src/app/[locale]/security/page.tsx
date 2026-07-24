import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Bug, ExternalLink, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { locales, type Locale } from '@/lib/i18n/config';
import { siteConfig } from '@/config/site';
import { generateBaseMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateBaseMetadata({
    locale: locale as Locale,
    path: '/security',
    title: 'Security',
    description: 'NoStressPDF security approach, supported reporting channel, and product security boundaries.',
    keywords: ['NoStressPDF security', 'vulnerability disclosure', 'private PDF processing'],
    noIndex: true,
  });
}

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const advisoryUrl = `${siteConfig.links.source}/security/advisories/new`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale as Locale} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="bg-gradient-to-br from-[hsl(var(--color-primary)/0.1)] via-[hsl(var(--color-background))] to-[hsl(var(--color-secondary)/0.1)] py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <ShieldCheck className="mx-auto mb-6 h-14 w-14 text-[hsl(var(--color-primary))]" />
            <h1 className="mb-5 text-4xl font-bold md:text-5xl">Security</h1>
            <p className="text-lg text-[hsl(var(--color-muted-foreground))]">
              NoStressPDF is designed so standard PDF processing happens on your device. Account and billing features are kept separate from document processing.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto max-w-3xl space-y-7 px-4">
            <article className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-7">
              <div className="mb-3 flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-[hsl(var(--color-primary))]" />
                <h2 className="text-xl font-semibold">Product boundaries</h2>
              </div>
              <ul className="list-disc space-y-2 pl-6 text-[hsl(var(--color-muted-foreground))]">
                <li>Standard PDF files, filenames, extracted text, and document metadata are processed locally and are not sent to account or billing services.</li>
                <li>Identity and subscription access use dedicated managed services; payment-card details are handled by the payment provider.</li>
                <li>Security controls and dependencies evolve. This page describes design goals, not a security certification or guarantee.</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-7">
              <div className="mb-3 flex items-center gap-3">
                <Bug className="h-5 w-5 text-[hsl(var(--color-primary))]" />
                <h2 className="text-xl font-semibold">Report a vulnerability</h2>
              </div>
              <p className="mb-4 text-[hsl(var(--color-muted-foreground))]">
                Please do not publish suspected vulnerabilities in a public issue. Use the repository&apos;s private security-advisory channel and include reproducible steps, affected components, impact, and a sanitized proof of concept.
              </p>
              <a className="inline-flex items-center gap-2 text-[hsl(var(--color-primary))] hover:underline" href={advisoryUrl}>
                Open private security advisory <ExternalLink className="h-4 w-4" />
              </a>
            </article>

            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              Do not test against other users, access data that is not yours, degrade service, or use social engineering. Reports should demonstrate impact to a server-side boundary, another user, protected data, billing integrity, or availability.
            </p>
          </div>
        </section>
      </main>
      <Footer locale={locale as Locale} />
    </div>
  );
}
