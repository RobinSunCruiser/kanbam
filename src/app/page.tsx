import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-orange-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Image src="/favicon.png" alt="CanBam" width={120} height={120} className="drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-linear-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Organize with
            </span>
            <br />
            <span className="bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              CanBam
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            A modern Kanban board that helps you organize tasks, collaborate with your team, and boost productivity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200/50 dark:border-slate-700/50"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
      <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Dr. Robin Nicolay
      </footer>
    </div>
  );
}
