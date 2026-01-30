import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200/50 dark:border-slate-700/50"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-28 grid md:grid-cols-3 gap-6">
          <div className="bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-orange-300/50 transition-colors">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Simple & Intuitive</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Drag and drop cards between columns. No learning curve required.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-orange-300/50 transition-colors">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Multiple Boards</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Create unlimited boards for different projects and teams.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-orange-300/50 transition-colors">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Access Control</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Grant read or write access to boards for team collaboration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
