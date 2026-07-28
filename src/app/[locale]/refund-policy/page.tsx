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
    path: '/refund-policy',
    title: 'Beta billing and refunds',
    description: 'NoStressPDF beta billing, cancellation, and refund information.',
    noIndex: validLocale !== 'en',
  });
}

export default async function RefundPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <PolicyPage locale={locale as Locale} title="Beta billing and refunds" intro="NoStressPDF beta billing runs only in Stripe test mode; no real money is collected.">
      <section><h2 className="mb-2 text-2xl font-bold">No beta charges</h2><p className="text-[hsl(var(--color-muted-foreground))]">Test cards, invoices, balances, and subscription amounts shown during the beta are simulated. Because no real payment is collected, there is nothing to refund.</p></section>
      <section><h2 className="mb-2 text-2xl font-bold">Cancellation</h2><p className="text-[hsl(var(--color-muted-foreground))]">Test subscriptions can be changed or canceled from the Stripe sandbox customer portal on the Account page.</p></section>
      <section><h2 className="mb-2 text-2xl font-bold">Before paid launch</h2><p className="text-[hsl(var(--color-muted-foreground))]">A final pricing, cancellation, and refund policy—together with the verified business identity and support contact—will be published before live payments are enabled.</p></section>
    </PolicyPage>
  );
}
