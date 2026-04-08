'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userEmail: string;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Ristoranti', href: '/admin', icon: '◻' },
  ];

  const sidebar = (
    <aside className="flex flex-col h-full bg-white border-r border-[#e7e5e4]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#e7e5e4]">
        <Link href="/admin" className="block no-underline">
          <span className="text-lg font-semibold text-[#1c1917] tracking-tight">AiFolly</span>
          <span className="block text-[11px] font-medium text-[#c9b97a] tracking-widest uppercase mt-0.5">
            Menu Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium no-underline transition-colors ${
                isActive
                  ? 'bg-[#f5f3ef] text-[#1c1917]'
                  : 'text-[#78716c] hover:bg-[#fafaf9] hover:text-[#1c1917]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-[#e7e5e4]">
        <p className="text-[12px] text-[#78716c] truncate mb-2">{userEmail}</p>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-[12px] text-[#a8a29e] hover:text-[#c9b97a] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Esci
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-[#e7e5e4] rounded-md p-2 shadow-sm cursor-pointer"
        aria-label="Menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1c1917" strokeWidth="1.5">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <>
              <path d="M3 5h14M3 10h14M3 15h14" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-in, desktop: fixed */}
      <div
        className={`fixed top-0 left-0 h-full w-60 z-40 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>
    </>
  );
}
