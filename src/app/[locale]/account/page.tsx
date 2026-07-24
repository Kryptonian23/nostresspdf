import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/lib/i18n/config';
import { generateBaseMetadata } from '@/lib/seo/metadata';
import AccountPageClient from './AccountPageClient';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateBaseMetadata({
    locale: locale as Locale,
    path: '/account',
    title: 'NoStressPDF Account',
    description: 'Manage your private NoStressPDF account, trial, and subscription.',
    keywords: ['NoStressPDF account', 'NoStressPDF subscription', 'private PDF software'],
    noIndex: true,
  });
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  setRequestLocale(validLocale);
  return <AccountPageClient locale={validLocale} />;
}
