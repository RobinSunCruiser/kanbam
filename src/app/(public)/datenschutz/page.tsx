import Link from 'next/link';
import Footer from '@/components/ui/Footer';

export default function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm">
          <section>
            <h2 className="font-medium text-base mb-2">Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung ist der im{' '}
              <Link href="/impressum" className="text-orange-500 hover:underline">
                Impressum
              </Link>{' '}
              genannte Betreiber.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">Erhobene Daten</h2>
            <p>Bei der Nutzung von KanBam werden folgende Daten verarbeitet:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>E-Mail-Adresse und Name (Registrierung)</li>
              <li>Board-Inhalte (Spalten, Karten, Kommentare)</li>
              <li>Aktivitätsdaten (Erstellungs- und Änderungszeitpunkte)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">Drittanbieter</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Neon</strong> (Datenbank) – Speicherung aller Nutzerdaten,
                Server in der EU (Frankfurt)
              </li>
              <li>
                <strong>Resend</strong> (E-Mail-Dienst) – Versand von Verifizierungs-,
                Passwort-Reset- und Benachrichtigungs-E-Mails
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">Cookies</h2>
            <p>
              KanBam verwendet ausschließlich technisch notwendige Session-Cookies
              zur Authentifizierung. Es werden keine Tracking- oder Analyse-Cookies eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">Ihre Rechte</h2>
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Datenübertragbarkeit</li>
              <li>Beschwerde bei einer Aufsichtsbehörde</li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-base mb-2">Kontakt</h2>
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
