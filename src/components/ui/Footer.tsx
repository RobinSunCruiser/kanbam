import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
      © {new Date().getFullYear()} Dr. Robin Nicolay
      <span className="mx-2">·</span>
      <Link href="/impressum" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
        Impressum
      </Link>
      <span className="mx-2">·</span>
      <Link href="/datenschutz" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
        Datenschutz
      </Link>
    </footer>
  );
}
