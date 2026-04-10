'use client';

import { useRouter } from 'next/navigation';
import PresetPicker, { type PresetData } from './PresetPicker';

type Props = {
  restaurantId: string;
  presets: PresetData[];
};

export default function EmptyThemeState({ restaurantId, presets }: Props) {
  const router = useRouter();

  // After a preset is applied, the restaurant has populated theme JSON in DB.
  // Reload the page so the parent server component re-evaluates isThemeEmpty
  // and mounts the full ThemeBuilder.
  const handlePresetApplied = () => {
    router.refresh();
  };

  return (
    <div className="max-w-2xl">
      <div className="px-6 py-8 border border-dashed border-[#e7e5e4] rounded-lg bg-[#fafaf9]">
        <h2 className="text-base font-semibold text-[#1c1917] mb-1">
          Nessun tema configurato
        </h2>
        <p className="text-[13px] text-[#78716c] mb-6">
          Questo ristorante non ha ancora un tema. Scegli un preset per iniziare —
          potrai personalizzarlo in seguito dal theme builder.
        </p>

        <PresetPicker
          restaurantId={restaurantId}
          presets={presets}
          onPresetApplied={handlePresetApplied}
        />
      </div>
    </div>
  );
}
