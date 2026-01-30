import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/middleware';
import Navbar from '@/components/ui/Navbar';

/**
 * Intercepts all route access to protected (group) routes and checks authentication
 * If fails redirects to login
 * If success renders page with navbar (passing user information)
 * @param param0 
 * @returns 
 */

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;

  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} />
      {children}
    </div>
  );
}
