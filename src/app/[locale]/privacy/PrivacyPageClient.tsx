'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, Eye, Server, Database, Cookie, Globe, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { type Locale } from '@/lib/i18n/config';

interface PrivacyPageClientProps {
  locale: Locale;
}

export default function PrivacyPageClient({ locale }: PrivacyPageClientProps) {
  const t = useTranslations();

  const privacyHighlights = [
    {
      icon: Server,
      title: 'No Server Uploads',
      description: 'Your files are never uploaded to any server. All processing happens locally in your browser.',
    },
    {
      icon: Lock,
      title: 'Local Processing',
      description: 'PDF operations are performed using JavaScript and WebAssembly directly on your device.',
    },
    {
      icon: Database,
      title: 'Local browser storage',
      description: 'Preferences and selected workflow details may be stored in your browser and can be cleared from your browser settings.',
    },
    {
      icon: Eye,
      title: 'No Tracking',
      description: 'We don\'t track your file contents or personal information. Your documents remain private.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[hsl(var(--color-primary)/0.1)] via-[hsl(var(--color-background))] to-[hsl(var(--color-secondary)/0.1)] py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--color-foreground))] mb-6">
                Privacy Policy
              </h1>
              <p className="text-lg text-[hsl(var(--color-muted-foreground))]">
                Your privacy is our top priority. {t('common.brand')} is designed from the ground up 
                to protect your data.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Highlights */}
        <section className="py-12 bg-[hsl(var(--color-muted)/0.3)]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {privacyHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="p-6 text-center" hover>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-[hsl(var(--color-foreground))] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                      {item.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-8">
                Last updated: July 2026
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                1. Introduction
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we handle your information when you use our PDF tools.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                2. How Our Service Works
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} is a client-side application. This means:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>All PDF processing happens directly in your web browser</li>
                <li>PDF files, filenames, extracted text, and document metadata are not sent to NoStressPDF account or billing services</li>
                <li>We cannot see, access, or store your documents</li>
                <li>Your files remain on your device at all times</li>
              </ul>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                3. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold text-[hsl(var(--color-foreground))] mt-6 mb-3">
                3.1 Your Files
              </h3>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                <strong>We do not collect your files.</strong> When you use our PDF tools, your files 
                are processed entirely within your browser. They are never transmitted to our servers.
              </p>

              <h3 className="text-xl font-semibold text-[hsl(var(--color-foreground))] mt-6 mb-3">
                3.2 Usage Data
              </h3>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                When you create an account or subscription, the services that provide identity and billing process limited account and transaction information, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>Your email address and account identifier for sign-in and subscription access</li>
                <li>Subscription status and plan information</li>
                <li>Payment and invoice information handled by our payment provider</li>
                <li>Technical request information needed to secure, operate, and troubleshoot the service</li>
              </ul>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                We do not use this account or billing information to inspect, process, or profile the contents of your PDF files.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                4. Local Storage
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} may use your browser&apos;s local storage to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>Remember your language preference</li>
                <li>Store your recent tool history</li>
                <li>Save work-in-progress for interrupted sessions</li>
              </ul>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                This data is stored only on your device unless you choose to use an account or billing feature. It may include recent file names, file sizes, selected tool settings, and saved workflow metadata. PDF file contents are not stored by these browser features.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                5. Cookies
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                We use essential browser storage and session mechanisms for functionality such as sign-in, security, language preferences, and billing access:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                <li><strong>Preference cookies:</strong> Remember your settings like language preference</li>
              </ul>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                We do not use advertising cookies or sell personal information for targeted advertising.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                6. Third-Party Services
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                We use carefully selected service providers to operate account and billing features. Depending on the feature you use, these providers include Amazon Web Services and Amazon Cognito for hosting and identity, and Stripe for payments and customer billing. These providers receive only the information needed to provide their services; they do not receive PDF file contents for account or billing operations.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>Advertising networks or social-media tracking pixels in the application</li>
                <li>External PDF processing services for the standard local-processing tools</li>
                <li>Payment card numbers; Stripe processes card details directly</li>
              </ul>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                7. Data Security
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                Since your files never leave your device, they are protected by your own device&apos;s 
                security measures. We recommend:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--color-muted-foreground))] mb-4">
                <li>Using an up-to-date browser</li>
                <li>Keeping your operating system updated</li>
                <li>Using secure networks when handling sensitive documents</li>
              </ul>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                8. Your Rights
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                Depending on where you live, you may have rights to request access to, correction of, or deletion of personal information associated with your account. You can clear browser-stored preferences and local workflow metadata through your browser settings. Account and billing deletion requests must be handled with the identity and payment records required to maintain security, prevent fraud, and meet applicable legal obligations.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                {t('common.brand')} is not directed at children under 13. We do not knowingly collect 
                any information from children.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>

              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mt-8 mb-4">
                11. Contact Us
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-4">
                If you have questions about this Privacy Policy or want to make a privacy request, please contact us through our
                contact page. Before public paid launch, NoStressPDF will publish its operating business identity, support contact method, and retention details here.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Badge */}
        <section className="py-12 bg-[hsl(var(--color-muted)/0.3)]">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-semibold text-green-800">
                    {t('common.footer.privacyBadge')}
                  </p>
                  <p className="text-sm text-green-600">
                    Your documents are processed securely in your browser
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
