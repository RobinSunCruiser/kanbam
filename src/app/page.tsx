import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Welcome to CanBam
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            A clean and modern Kanban board for organizing your tasks.
            Collaborate with your team and boost productivity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Simple & Intuitive
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop cards between columns. No learning curve required.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Multiple Boards
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create unlimited boards for different projects and teams.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Access Control
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Grant read or write access to boards for team collaboration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
