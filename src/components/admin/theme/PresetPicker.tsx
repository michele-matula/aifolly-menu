'use client';

import { useState, useCallback } from 'react';
import type { CoverTheme, MenuTheme, DishTheme } from '@/lib/validators/theme';
import { applyPreset } from '@/app/admin/(dashboard)/restaurants/[id]/theme/actions';
import ConfirmModal from './ConfirmModal';

export type PresetData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  coverConfig: CoverTheme;
  menuConfig: MenuTheme;
  dishConfig: DishTheme;
};

type Props = {
  restaurantId: string;
  presets: PresetData[];
  onPresetApplied: (theme: { cover: CoverTheme; menu: MenuTheme; dish: DishTheme }) => void;
};

export default function PresetPicker({ restaurantId, presets, onPresetApplied }: Props) {
  const [confirmPreset, setConfirmPreset] = useState<PresetData | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleApply = useCallback(async () => {
    if (!confirmPreset) return;
    setIsPending(true);
    const result = await applyPreset(restaurantId, confirmPreset.id);
    setIsPending(false);
    if (result.success && result.data) {
      onPresetApplied(result.data);
    }
    setConfirmPreset(null);
  }, [confirmPreset, restaurantId, onPresetApplied]);

  return (
    <div>
      <h4 className="text-[13px] font-medium text-[#44403c] mb-2">Preset</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map(preset => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setConfirmPreset(preset)}
            className="p-2.5 border border-[#e7e5e4] rounded-md hover:border-[#c9b97a] hover:bg-[#fafaf9] transition-all cursor-pointer text-left group"
          >
            {/* Mini color preview */}
            <div className="flex gap-1 mb-1.5">
              <div
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: preset.coverConfig.backgroundColor }}
              />
              <div
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: preset.coverConfig.titleColor }}
              />
              <div
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: preset.coverConfig.ctaColor }}
              />
            </div>
            <p
              className="text-[12px] font-medium text-[#1c1917] truncate group-hover:text-[#c9b97a] transition-colors"
              style={{ fontFamily: preset.coverConfig.titleFont.family }}
            >
              {preset.name}
            </p>
          </button>
        ))}
      </div>

      {confirmPreset && (
        <ConfirmModal
          title={`Applicare "${confirmPreset.name}"?`}
          message="Le personalizzazioni attuali della bozza verranno sovrascritte dal preset selezionato."
          confirmLabel="Applica preset"
          onConfirm={handleApply}
          onCancel={() => setConfirmPreset(null)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
