import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Footer from '@/components/ui/Footer';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DatenschutzPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('legal');
  const td = await getTranslations('legal.datenschutz');

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
          {td('title')}
        </h1>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm">
          <section>
            <h2 className="font-medium text-base mb-2">{td('responsibleTitle')}</h2>
            <p>
              Verantwortlich für die Datenverarbeitung ist der im{' '}
              <Link href="/impressum" className="text-orange-500 hover:underline">
                Impressum
              </Link>{' '}
              genannte Betreiber.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">{td('dataTitle')}</h2>
            <p>{td('dataIntro')}</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>{td('dataEmail')}</li>
              <li>{td('dataBoards')}</li>
              <li>{td('dataActivity')}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">{td('thirdPartyTitle')}</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>{td('thirdPartyNeon')}</li>
              <li>{td('thirdPartyResend')}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">{td('cookiesTitle')}</h2>
            <p>{td('cookiesText')}</p>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">{td('rightsTitle')}</h2>
            <p>{td('rightsIntro')}</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>{td('rightsAccess')}</li>
              <li>{td('rightsCorrection')}</li>
              <li>{td('rightsDeletion')}</li>
              <li>{td('rightsPortability')}</li>
              <li>{td('rightsComplaint')}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">{td('contactTitle')}</h2>
            <p>
              Bei Fragen zum Datenschutz wenden Sie sich an die im{' '}
              <Link href="/impressum" className="text-orange-500 hover:underline">
                Impressum
              </Link>{' '}
              angegebene E-Mail-Adresse.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
