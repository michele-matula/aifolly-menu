import { getCurrentUser } from '@/lib/auth-helpers';
import { signOut } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';
import { Toaster } from 'sonner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Sidebar userEmail={user.email ?? ''} />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="lg:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>

      <Toaster position="top-right" richColors closeButton duration={4000} />
    </div>
  );
}
