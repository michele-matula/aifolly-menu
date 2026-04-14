'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PresetPicker, { type PresetData } from './PresetPicker';

type Props = {
  restaurantId: string;
  presets: PresetData[];
};

// Versione ridotta di EmptyThemeState usata quando Plan.customTheme e' false:
// il ristoratore puo' solo scegliere tra i preset, non ha accesso al theme builder.
export default function PresetOnlyThemeState({ restaurantId, presets }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-2xl">
      <div className="px-5 py-4 border border-sky-200 bg-sky-50 rounded-lg mb-5">
        <h2 className="text-sm font-semibold text-sky-900 mb-1">
          Modalità solo preset
        </h2>
        <p className="text-[13px] text-sky-800 leading-relaxed">
          Il tuo piano consente di scegliere tra i preset di tema disponibili, ma
          non include la personalizzazione avanzata (font, colori, layout).
        </p>
        <Link
          href={`/admin/upgrade?restaurantId=${restaurantId}`}
          className="inline-block mt-2 text-xs font-medium text-sky-900 underline"
        >
          Scopri il piano Pro →
        </Link>
      </div>

      <PresetPicker
        restaurantId={restaurantId}
        presets={presets}
        onPresetApplied={() => router.refresh()}
      />
    </div>
  );
}
