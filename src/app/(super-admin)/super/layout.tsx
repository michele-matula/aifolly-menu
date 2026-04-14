import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth-helpers';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100">
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#1c1917] border-r border-stone-800 flex flex-col">
        <div className="px-5 py-5 border-b border-stone-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Super Admin
          </p>
          <p className="mt-1 text-sm text-stone-300">AiFolly Menu</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SuperNavLink href="/super">Dashboard</SuperNavLink>
          <SuperNavLink href="/super/tenants">Tenant</SuperNavLink>
          <SuperNavLink href="/super/plans">Piani</SuperNavLink>
        </nav>

        <div className="px-5 py-4 border-t border-stone-800">
          <p className="text-xs text-stone-400 truncate" title={user.email}>
            {user.email}
          </p>
        </div>
      </aside>

      <main className="ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function SuperNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors no-underline"
    >
      {children}
    </Link>
  );
}
