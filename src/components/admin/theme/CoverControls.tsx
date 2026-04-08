'use client';

import type { CoverTheme, FontConfig } from '@/lib/validators/theme';
import ColorField from './ColorField';
import FontConfigEditor from './FontConfigEditor';
import NumberField from './NumberField';
import SelectField from './SelectField';
import ToggleField from './ToggleField';

type Props = {
  value: CoverTheme;
  onChange: <K extends keyof CoverTheme>(field: K, value: CoverTheme[K]) => void;
};

const ALIGNMENT_OPTIONS = [
  { value: 'center', label: 'Centro' },
  { value: 'left', label: 'Sinistra' },
  { value: 'right', label: 'Destra' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h5 className="text-[12px] font-semibold text-[#a8a29e] uppercase tracking-wider">{title}</h5>
      {children}
    </div>
  );
}

export default function CoverControls({ value, onChange }: Props) {
  const handleFontChange = (
    field: 'titleFont' | 'descriptionFont' | 'ctaFont',
    prop: keyof FontConfig,
    v: FontConfig[keyof FontConfig],
  ) => {
    onChange(field, { ...value[field], [prop]: v });
  };

  return (
    <div className="space-y-6">
      <Section title="Sfondo">
        <ColorField label="Colore sfondo" value={value.backgroundColor} onChange={v => onChange('backgroundColor', v)} />
        <ColorField label="Colore overlay" value={value.backgroundOverlayColor} onChange={v => onChange('backgroundOverlayColor', v)} />
        <NumberField
          label="Opacità overlay"
          value={value.backgroundOverlayOpacity}
          onChange={v => onChange('backgroundOverlayOpacity', v)}
          min={0} max={1} step={0.05}
        />
      </Section>

      <Section title="Logo">
        <ToggleField label="Mostra logo" checked={value.showLogo} onChange={v => onChange('showLogo', v)} />
        {value.showLogo && (
          <NumberField
            label="Altezza massima logo"
            value={value.logoMaxHeight}
            onChange={v => onChange('logoMaxHeight', v)}
            min={40} max={200} step={5} unit="px"
          />
        )}
      </Section>

      <Section title="Titolo">
        <FontConfigEditor
          label="Font titolo"
          value={value.titleFont}
          onChange={(prop, v) => handleFontChange('titleFont', prop, v)}
          usage="cover"
        />
        <ColorField
          label="Colore titolo"
          value={value.titleColor}
          onChange={v => onChange('titleColor', v)}
          bgColor={value.backgroundColor}
        />
      </Section>

      <Section title="Descrizione">
        <FontConfigEditor
          label="Font descrizione"
          value={value.descriptionFont}
          onChange={(prop, v) => handleFontChange('descriptionFont', prop, v)}
          usage="cover"
        />
        <ColorField
          label="Colore descrizione"
          value={value.descriptionColor}
          onChange={v => onChange('descriptionColor', v)}
          bgColor={value.backgroundColor}
        />
      </Section>

      <Section title="Pulsante CTA">
        <label className="block">
          <span className="text-[13px] font-medium text-[#44403c]">Testo pulsante</span>
          <input
            type="text"
            value={value.ctaText}
            onChange={e => onChange('ctaText', e.target.value)}
            maxLength={30}
            className="w-full mt-1 px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors"
          />
        </label>
        <FontConfigEditor
          label="Font pulsante"
          value={value.ctaFont}
          onChange={(prop, v) => handleFontChange('ctaFont', prop, v)}
          usage="cover"
        />
        <ColorField
          label="Colore testo pulsante"
          value={value.ctaColor}
          onChange={v => onChange('ctaColor', v)}
          bgColor={value.backgroundColor}
        />
        <ColorField
          label="Colore bordo pulsante"
          value={value.ctaBorderColor}
          onChange={v => onChange('ctaBorderColor', v)}
        />
      </Section>

      <Section title="Decorazioni">
        <ToggleField label="Mostra ornamento" checked={value.showOrnament} onChange={v => onChange('showOrnament', v)} />
        {value.showOrnament && (
          <ColorField
            label="Colore ornamento"
            value={value.ornamentColor}
            onChange={v => onChange('ornamentColor', v)}
          />
        )}
      </Section>

      <Section title="Layout">
        <SelectField
          label="Allineamento contenuto"
          value={value.contentAlignment}
          onChange={v => onChange('contentAlignment', v as CoverTheme['contentAlignment'])}
          options={ALIGNMENT_OPTIONS}
        />
        <NumberField
          label="Padding verticale"
          value={value.paddingVertical}
          onChange={v => onChange('paddingVertical', v)}
          min={20} max={120} step={5} unit="px"
        />
      </Section>
    </div>
  );
}
