'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  CURATED_FONTS,
  type CuratedFont,
  type FontCategory,
  buildFontsPreviewUrl,
} from '@/lib/theme/google-fonts';

type Props = {
  value: string;
  onChange: (family: string) => void;
  usage?: 'cover' | 'menu';
};

const CATEGORY_LABELS: Record<FontCategory, string> = {
  serif: 'Serif',
  'sans-serif': 'Sans Serif',
  display: 'Display',
  handwriting: 'Handwriting',
  monospace: 'Monospace',
};

const CATEGORY_ORDER: FontCategory[] = ['serif', 'sans-serif', 'display', 'handwriting', 'monospace'];

export default function FontFamilyPicker({ value, onChange, usage }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableFonts = useMemo(
    () =>
      usage
        ? CURATED_FONTS.filter(f => f.usage === usage || f.usage === 'both')
        : [...CURATED_FONTS],
    [usage],
  );

  const filtered = search
    ? availableFonts.filter(f =>
        f.family.toLowerCase().includes(search.toLowerCase()),
      )
    : availableFonts;

  // Raggruppa per categoria
  const grouped = CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      fonts: filtered.filter(f => f.category === cat),
    }))
    .filter(g => g.fonts.length > 0);

  // Carica i font per il preview quando si apre il dropdown
  useEffect(() => {
    if (!open || fontsLoaded) return;

    const families = availableFonts.map(f => f.family);
    const url = buildFontsPreviewUrl(families);
    if (!url) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    // Inject dello stylesheet Google Fonts nel <head>: side effect
    // sul DOM esterno (platform API). setFontsLoaded qui sincronizza
    // lo stato React con il fatto che la risorsa esterna e' stata
    // richiesta — caso d'uso legittimo di useEffect, la regola
    // set-state-in-effect e' un falso positivo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFontsLoaded(true);

    return () => {
      document.head.removeChild(link);
    };
  }, [open, fontsLoaded, availableFonts]);

  // Chiudi dropdown su click esterno
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = useCallback(
    (font: CuratedFont) => {
      onChange(font.family);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] text-left outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors cursor-pointer flex items-center justify-between"
        style={{ fontFamily: value }}
      >
        <span className="truncate">{value}</span>
        <svg
          className={`w-4 h-4 text-[#a8a29e] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border border-[#e7e5e4] rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#e7e5e4]">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca font..."
              className="w-full px-2 py-1.5 text-sm border border-[#e7e5e4] rounded bg-[#fafaf9] text-[#1c1917] outline-none focus:border-[#c9b97a] transition-colors"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {grouped.length === 0 && (
              <p className="px-3 py-4 text-sm text-[#a8a29e] text-center">Nessun font trovato</p>
            )}
            {grouped.map(group => (
              <div key={group.category}>
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider bg-[#fafaf9] sticky top-0">
                  {CATEGORY_LABELS[group.category]}
                </div>
                {group.fonts.map(font => (
                  <button
                    key={font.family}
                    type="button"
                    onClick={() => handleSelect(font)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer hover:bg-[#fafaf9] ${
                      font.family === value ? 'bg-[#c9b97a]/10 text-[#1c1917] font-medium' : 'text-[#44403c]'
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.family}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
