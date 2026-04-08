'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import CategoryNav from './CategoryNav';
import DishCard from './DishCard';
import type { DishData } from './DishCard';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  dishes: DishData[];
}

interface MenuContentProps {
  categories: CategoryData[];
}

export default function MenuContent({ categories }: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug ?? '');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cat = entry.target.getAttribute('data-cat');
            if (cat) setActiveCategory(cat);
          }
        });
      },
      { threshold: 0.15, rootMargin: '-100px 0px -65% 0px' }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 180);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((catSlug: string) => {
    setActiveCategory(catSlug);
    sectionRefs.current[catSlug]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
  }, []);

  // AND logic: dish must have ALL selected tags
  const filterDishes = (dishes: DishData[]) => {
    if (!activeFilters.length) return dishes;
    return dishes.filter(d => activeFilters.every(f => d.tags.includes(f)));
  };

  return (
    <>
      <CategoryNav
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        activeCategory={activeCategory}
        onCategoryClick={scrollTo}
        scrolled={scrolled}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
      />

      {/* Menu sections */}
      <div style={{ padding: '8px 24px 80px' }}>
        {categories.map(cat => {
          const dishes = filterDishes(cat.dishes);

          return (
            <section
              key={cat.slug}
              ref={el => { sectionRefs.current[cat.slug] = el; }}
              data-cat={cat.slug}
              style={{ marginBottom: 20, scrollMarginTop: 110 }}
            >
              {/* Section header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '28px 0 4px',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--menu-section-font)',
                    fontSize: 'var(--menu-section-size)',
                    fontWeight: 'var(--menu-section-weight)',
                    fontStyle: 'var(--menu-section-style)',
                    color: 'var(--menu-section-color)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name}
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: `linear-gradient(90deg, var(--menu-divider-color), transparent)`,
                  }}
                />
              </div>

              {/* Dishes */}
              {dishes.length > 0 ? (
                dishes.map((dish, i) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    index={i}
                    isLast={i === dishes.length - 1}
                  />
                ))
              ) : (
                <p
                  style={{
                    fontFamily: 'var(--dish-desc-font)',
                    fontSize: 12,
                    color: 'var(--menu-nav-color)',
                    textAlign: 'center',
                    padding: '28px 0',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    letterSpacing: '0.04em',
                  }}
                >
                  Nessun piatto con i filtri selezionati
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
