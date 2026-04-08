import Link from 'next/link';
import type { Metadata } from 'next';
import { requireOwnership } from '@/lib/auth-helpers';
import RestaurantTabs from '@/components/admin/RestaurantTabs';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await requireOwnership(id);
  return { title: restaurant.name };
}

export default async function RestaurantLayout({ params, children }: Props) {
  const { id } = await params;
  const restaurant = await requireOwnership(id);

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] text-[#a8a29e] mb-3">
          <Link href="/admin" className="hover:text-[#78716c] no-underline transition-colors">
            Ristoranti
          </Link>
          <span>›</span>
          <span className="text-[#78716c]">{restaurant.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#1c1917] tracking-tight">
            {restaurant.name}
          </h1>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              restaurant.isPublished
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            {restaurant.isPublished ? 'Pubblicato' : 'Bozza'}
          </span>
        </div>

        {restaurant.city && (
          <p className="text-sm text-[#78716c] mt-1">{restaurant.city}</p>
        )}
      </div>

      {/* Tabs */}
      <RestaurantTabs restaurantId={id} />

      {/* Tab content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
