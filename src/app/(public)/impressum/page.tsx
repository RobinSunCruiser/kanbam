import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/ui/Footer';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 mb-8 inline-block"
        >
          ← Zurück
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Impressum
        </h1>

        <Image
          src="/liontransparent.png"
          alt="Logo"
          width={400}
          height={400}
          className="mb-6"
        />

        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <p className="font-medium">Angaben gemäß § 5 TMG</p>

          <div>
            <p className="font-medium">Dr.-Ing. Robin Nicolay</p>
            <p>AI Researcher & Consultant (Freiberufler)</p>
          </div>

          <div>
            <p className="font-medium mb-1">Adresse:</p>
            <Image
              src="/address.png"
              alt="Adresse"
              width={200}
              height={50}
            />
          </div>

          <div>
            <p className="font-medium mb-1">Kontakt:</p>
            <Image
              src="/mail.png"
              alt="E-Mail"
              width={200}
              height={24}
            />
          </div>

          <div className="pt-4 text-sm text-slate-500 dark:text-slate-400">
            <p className="font-medium">Haftungsausschluss</p>
            <p>
              Die Inhalte wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität wird keine Gewähr übernommen.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
