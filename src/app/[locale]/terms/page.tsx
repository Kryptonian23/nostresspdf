import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PolicyPage } from '@/components/layout/PolicyPage';
import { locales, type Locale } from '@/lib/i18n/config';
import { generateBaseMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  return generateBaseMetadata({
    locale: validLocale,
    path: '/terms',
    title: 'Beta terms',
    description: 'Terms that apply while evaluating the NoStressPDF beta.',
    noIndex: validLocale !== 'en',
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <PolicyPage locale={locale as Locale} title="Beta terms" intro="Last updated July 28, 2026. These terms cover evaluation of the NoStressPDF beta.">
      <section><h2 className="mb-2 text-2xl font-bold">Evaluation service</h2><p className="text-[hsl(var(--color-muted-foreground))]">The beta is provided for testing and may change, become unavailable, or produce incorrect output. Keep originals and independently verify results.</p></section>
      <section><h2 className="mb-2 text-2xl font-bold">Your responsibility</h2><p className="text-[hsl(var(--color-muted-foreground))]">You must have the right to process each document. Do not use the service unlawfully, attempt to bypass access controls, interfere with other users, or rely on beta output for regulated, legal, safety-critical, or compliance decisions.</p></section>
      <section><h2 className="mb-2 text-2xl font-bold">Privacy and accounts</h2><p className="text-[hsl(var(--color-muted-foreground))]">Supported tools process files on your device. Managed authentication and sandbox billing handle account-related data separately and do not receive document contents. You are responsible for protecting your account.</p></section>
      <section><h2 className="mb-2 text-2xl font-bold">No warranty</h2><p className="text-[hsl(var(--color-muted-foreground))]">The beta is provided “as is” and “as available,” without warranties to the extent permitted by law. A final commercial agreement and verified operating identity will replace these beta terms before paid launch.</p></section>
    </PolicyPage>
  );
}
