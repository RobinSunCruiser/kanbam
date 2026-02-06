import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Footer from '@/components/ui/Footer';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImpressumPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('legal');
  const ti = await getTranslations('legal.impressum');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 mb-8 inline-block"
        >
          {t('back')}
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          {ti('title')}
        </h1>

        <Image
          src="/liontransparent.png"
          alt="Logo"
          width={400}
          height={400}
          className="mb-6"
        />

        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <p className="font-medium">{ti('legalBasis')}</p>

          <div>
            <p className="font-medium">{ti('name')}</p>
            <p>{ti('occupation')}</p>
          </div>

          <div>
            <p className="font-medium mb-1">{ti('addressLabel')}</p>
            <Image
              src="/address.png"
              alt="Address"
              width={200}
              height={50}
            />
          </div>

          <div>
            <p className="font-medium mb-1">{ti('contactLabel')}</p>
            <Image
              src="/mail.png"
              alt="Email"
              width={200}
              height={24}
            />
          </div>

          <div className="pt-4 text-sm text-slate-500 dark:text-slate-400">
            <p className="font-medium">{ti('disclaimerTitle')}</p>
            <p>{ti('disclaimerText')}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
