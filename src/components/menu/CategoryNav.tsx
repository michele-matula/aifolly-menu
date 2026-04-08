'use client';

import { useEffect, useRef } from 'react';
import FilterBar from './FilterBar';

interface CategoryNavProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory: string;
  onCategoryClick: (slug: string) => void;
  scrolled: boolean;
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
}

export default function CategoryNav({
  categories,
  activeCategory,
  onCategoryClick,
  scrolled,
  activeFilters,
  onToggleFilter,
}: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Auto-scroll nav to active category button
  useEffect(() => {
    const btn = btnRefs.current[activeCategory];
    const nav = navRef.current;
    if (btn && nav) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const offset = btnRect.left - navRect.left - navRect.width / 2 + btnRect.width / 2;
      nav.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? `color-mix(in srgb, var(--menu-nav-bg) 95%, transparent)` : 'var(--menu-nav-bg)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--menu-divider-color)' : 'transparent'}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Categories */}
      <div
        ref={navRef}
        style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          padding: '0 8px 4px',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {categories.map(cat => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              ref={el => { btnRefs.current[cat.slug] = el; }}
              className={`menu-cat-btn ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryClick(cat.slug)}
              style={{
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--menu-nav-font)',
                fontSize: 'var(--menu-nav-size)',
                letterSpacing: 'var(--menu-nav-spacing)',
                textTransform: 'var(--menu-nav-transform)' as React.CSSProperties['textTransform'],
                fontWeight: isActive ? 500 : 300,
                color: isActive ? 'var(--menu-section-color)' : 'var(--menu-nav-color)',
                padding: '14px 16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <FilterBar activeFilters={activeFilters} onToggleFilter={onToggleFilter} />
    </div>
  );
}
