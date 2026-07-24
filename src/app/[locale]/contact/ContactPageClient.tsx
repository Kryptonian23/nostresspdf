'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { type Locale } from '@/lib/i18n/config';

interface ContactPageClientProps {
  locale: Locale;
}

export default function ContactPageClient({ locale }: ContactPageClientProps) {
  const t = useTranslations('contactPage');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {/* Hero Section */}
        <section className="bg-[hsl(var(--color-muted)/0.3)] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--color-foreground))] mb-4">
                {t('hero.title')}
              </h1>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                {t('hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Support availability */}
        <section className="py-12 bg-[hsl(var(--color-muted)/0.3)]">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mb-2">
                  Support setup in progress
                </h2>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  NoStressPDF has not published a support inbox yet. Please do not submit sensitive documents or account information through an unverified channel.
                </p>
              </div>
              <Card className="p-6 md:p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--color-success)/0.12)] mb-4">
                  <ShieldCheck className="h-7 w-7 text-[hsl(var(--color-success))]" aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed text-[hsl(var(--color-muted-foreground))]">
                  A verified support channel and privacy-preserving contact workflow will be published before public launch.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--color-muted-foreground))]" />
              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mb-4">
                {t('faq.title')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-6">
                {t('faq.description', { brand: tCommon('brand') })}
              </p>
              <Link href={`/${locale}/faq`}>
                <Button variant="outline">
                  {t('faq.button')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
