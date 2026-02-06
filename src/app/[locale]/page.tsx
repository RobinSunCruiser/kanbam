import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Hero accent orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-150 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Hero */}
        <div className="text-center relative">
          <div className="flex justify-center mb-8">
            <Image src="/favicon.png" alt="KanBam" width={120} height={120} className="drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-linear-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {t('heroTitle1')}
            </span>
            <br />
            <span className="bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('heroTitle2')}
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            {t('heroDescription')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl font-medium bg-linear-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 transform transition-all duration-300 hover:scale-105 active:scale-100 relative overflow-hidden"
            >
              {t('getStarted')}
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl font-medium glass-medium text-slate-700 dark:text-slate-200 border border-white/20 dark:border-slate-700/40 hover:bg-white/70 dark:hover:bg-slate-700/60 transform transition-all duration-300 hover:scale-105 active:scale-100"
            >
              {t('logIn')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
