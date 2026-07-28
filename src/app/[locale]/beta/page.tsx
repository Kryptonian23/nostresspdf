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
    path: '/beta',
    title: 'Beta program',
    description: 'Current NoStressPDF beta scope, testing guidance, limitations, and feedback expectations.',
  });
}

export default async function BetaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <PolicyPage
      locale={locale as Locale}
      title="NoStressPDF beta"
      intro="The beta is a controlled test of private, on-device PDF tools—not a finished production service."
    >
      <section>
        <h2 className="mb-2 text-2xl font-bold">How to test safely</h2>
        <ul className="list-disc space-y-2 pl-6 text-[hsl(var(--color-muted-foreground))]">
          <li>Use copies of non-sensitive documents during beta testing.</li>
          <li>Verify every important output before deleting the original or using it professionally.</li>
          <li>Do not use beta output as a substitute for legal, compliance, archival, or security review.</li>
          <li>Account and billing tests use sandbox services and cannot create a real charge.</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-2xl font-bold">Privacy model</h2>
        <p className="text-[hsl(var(--color-muted-foreground))]">
          Supported PDF operations run in your browser. Authentication and subscription checks receive account data, but they do not receive your PDF files, filenames, extracted text, or document metadata.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-2xl font-bold">Report a problem</h2>
        <p className="text-[hsl(var(--color-muted-foreground))]">
          Use the Contact page for general feedback or the Security page for a potential vulnerability. Never attach a confidential document; describe the behavior with a synthetic example instead.
        </p>
      </section>
    </PolicyPage>
  );
}
