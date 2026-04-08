'use client';

import { useState } from 'react';
import type { FontConfig } from '@/lib/validators/theme';
import { getFontWeightsForFamily } from '@/lib/theme/google-fonts';
import FontFamilyPicker from './FontFamilyPicker';
import NumberField from './NumberField';
import SelectField from './SelectField';

type Props = {
  label: string;
  value: FontConfig;
  onChange: (prop: keyof FontConfig, value: FontConfig[keyof FontConfig]) => void;
  usage?: 'cover' | 'menu';
};

const TRANSFORM_OPTIONS = [
  { value: 'none', label: 'Nessuno' },
  { value: 'uppercase', label: 'MAIUSCOLO' },
  { value: 'lowercase', label: 'minuscolo' },
  { value: 'capitalize', label: 'Capitalizzato' },
];

const STYLE_OPTIONS = [
  { value: 'normal', label: 'Normale' },
  { value: 'italic', label: 'Corsivo' },
];

export default function FontConfigEditor({ label, value, onChange, usage }: Props) {
  const [expanded, setExpanded] = useState(false);
  const availableWeights = getFontWeightsForFamily(value.family);

  const weightOptions = availableWeights.map(w => ({
    value: w,
    label: `${w}${w === '400' ? ' (Regular)' : w === '700' ? ' (Bold)' : ''}`,
  }));

  return (
    <div className="border border-[#e7e5e4] rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between bg-[#fafaf9] hover:bg-[#f5f5f4] transition-colors cursor-pointer"
      >
        <div className="text-left">
          <span className="text-[13px] font-medium text-[#44403c]">{label}</span>
          <span className="text-[12px] text-[#a8a29e] ml-2">
            {value.family}, {value.weight}, {value.size}px
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-[#a8a29e] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-3 space-y-3 border-t border-[#e7e5e4]">
          <div>
            <span className="block text-[13px] font-medium text-[#44403c] mb-1">Font</span>
            <FontFamilyPicker
              value={value.family}
              onChange={family => {
                onChange('family', family);
                // Se il peso corrente non è disponibile nel nuovo font, resetta a 400
                const newWeights = getFontWeightsForFamily(family);
                if (!newWeights.includes(value.weight)) {
                  onChange('weight', '400');
                }
              }}
              usage={usage}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Peso"
              value={value.weight}
              onChange={v => onChange('weight', v)}
              options={weightOptions}
            />
            <SelectField
              label="Stile"
              value={value.style}
              onChange={v => onChange('style', v as FontConfig['style'])}
              options={STYLE_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Dimensione"
              value={value.size}
              onChange={v => onChange('size', v)}
              min={10}
              max={120}
              step={0.5}
              unit="px"
            />
            <NumberField
              label="Spaziatura lettere"
              value={value.letterSpacing}
              onChange={v => onChange('letterSpacing', v)}
              min={-5}
              max={20}
              step={0.5}
              unit="px"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Interlinea"
              value={value.lineHeight}
              onChange={v => onChange('lineHeight', v)}
              min={0.8}
              max={3}
              step={0.1}
            />
            <SelectField
              label="Trasformazione"
              value={value.textTransform}
              onChange={v => onChange('textTransform', v as FontConfig['textTransform'])}
              options={TRANSFORM_OPTIONS}
            />
          </div>
        </div>
      )}
    </div>
  );
}
