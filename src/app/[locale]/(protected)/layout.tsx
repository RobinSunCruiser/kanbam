import { redirect } from '@/i18n/navigation';
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let user;

  try {
    user = await requireAuth();
  } catch {
    redirect({ href: '/login', locale });
  }

  return (
    <div className="min-h-screen relative">
      <Navbar user={user} />
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
