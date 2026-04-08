'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface Props {
  restaurantId: string;
  categories: { id: string; name: string }[];
}

export default function DishesToolbar({ restaurantId, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') ?? '';
  const currentSearch = searchParams.get('search') ?? '';
  const [search, setSearch] = useState(currentSearch);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/restaurants/${restaurantId}/dishes?${params.toString()}`);
  }

  const selectClass = 'px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentCategory}
        onChange={e => updateParams('category', e.target.value)}
        className={selectClass}
      >
        <option value="">Tutte le categorie</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <form
        onSubmit={e => {
          e.preventDefault();
          updateParams('search', search);
        }}
        className="flex gap-2"
      >
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome..."
          className={`${selectClass} w-48`}
        />
        <button
          type="submit"
          className="px-3 py-2 text-sm text-[#78716c] border border-[#e7e5e4] rounded-md hover:border-[#d6d3d1] transition-colors cursor-pointer"
        >
          Cerca
        </button>
      </form>
    </div>
  );
}
