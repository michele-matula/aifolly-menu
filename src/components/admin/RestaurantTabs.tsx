'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface RestaurantTabsProps {
  restaurantId: string;
}

const TABS = [
  { label: 'Info', segment: '' },
  { label: 'Categorie', segment: '/categories' },
  { label: 'Piatti', segment: '/dishes' },
  { label: 'Media', segment: '/media' },
  { label: 'Tema', segment: '/theme' },
  { label: 'QR Code', segment: '/qr' },
];

export default function RestaurantTabs({ restaurantId }: RestaurantTabsProps) {
  const pathname = usePathname();
  const basePath = `/admin/restaurants/${restaurantId}`;

  return (
    <nav className="flex gap-0 border-b border-[#e7e5e4] overflow-x-auto">
      {TABS.map(tab => {
        const href = basePath + tab.segment;
        const isActive = tab.segment === ''
          ? pathname === basePath
          : pathname.startsWith(href);

        return (
          <Link
            key={tab.segment}
            href={href}
            className={`shrink-0 px-4 py-3 text-[13px] font-medium no-underline border-b-2 transition-colors ${
              isActive
                ? 'border-[#c9b97a] text-[#1c1917]'
                : 'border-transparent text-[#a8a29e] hover:text-[#78716c]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
