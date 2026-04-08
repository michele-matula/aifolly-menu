'use client';

import type { DishTheme, FontConfig } from '@/lib/validators/theme';
import ColorField from './ColorField';
import FontConfigEditor from './FontConfigEditor';
import SelectField from './SelectField';

type Props = {
  value: DishTheme;
  onChange: <K extends keyof DishTheme>(field: K, value: DishTheme[K]) => void;
  cardBgColor: string;
};

const SEPARATOR_STYLE_OPTIONS = [
  { value: 'dashed', label: 'Tratteggiato' },
  { value: 'solid', label: 'Continuo' },
  { value: 'dotted', label: 'Puntini' },
  { value: 'none', label: 'Nessuno' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h5 className="text-[12px] font-semibold text-[#a8a29e] uppercase tracking-wider">{title}</h5>
      {children}
    </div>
  );
}

export default function DishControls({ value, onChange, cardBgColor }: Props) {
  const handleFontChange = (
    field: 'nameFont' | 'descriptionFont' | 'priceFont' | 'tagFont',
    prop: keyof FontConfig,
    v: FontConfig[keyof FontConfig],
  ) => {
    onChange(field, { ...value[field], [prop]: v });
  };

  return (
    <div className="space-y-6">
      <Section title="Nome piatto">
        <FontConfigEditor
          label="Font nome"
          value={value.nameFont}
          onChange={(prop, v) => handleFontChange('nameFont', prop, v)}
          usage="menu"
        />
        <ColorField
          label="Colore nome"
          value={value.nameColor}
          onChange={v => onChange('nameColor', v)}
          bgColor={cardBgColor}
        />
      </Section>

      <Section title="Descrizione">
        <FontConfigEditor
          label="Font descrizione"
          value={value.descriptionFont}
          onChange={(prop, v) => handleFontChange('descriptionFont', prop, v)}
          usage="menu"
        />
        <ColorField
          label="Colore descrizione"
          value={value.descriptionColor}
          onChange={v => onChange('descriptionColor', v)}
          bgColor={cardBgColor}
        />
      </Section>

      <Section title="Prezzo">
        <FontConfigEditor
          label="Font prezzo"
          value={value.priceFont}
          onChange={(prop, v) => handleFontChange('priceFont', prop, v)}
          usage="menu"
        />
        <ColorField
          label="Colore prezzo"
          value={value.priceColor}
          onChange={v => onChange('priceColor', v)}
          bgColor={cardBgColor}
        />
      </Section>

      <Section title="Tag e badge">
        <FontConfigEditor
          label="Font tag"
          value={value.tagFont}
          onChange={(prop, v) => handleFontChange('tagFont', prop, v)}
          usage="menu"
        />
        <ColorField
          label="Colore bordo tag"
          value={value.tagBorderColor}
          onChange={v => onChange('tagBorderColor', v)}
        />
        <ColorField
          label="Colore testo tag"
          value={value.tagTextColor}
          onChange={v => onChange('tagTextColor', v)}
          bgColor={cardBgColor}
        />
      </Section>

      <Section title="Allergeni">
        <ColorField
          label="Colore testo allergeni"
          value={value.allergenTextColor}
          onChange={v => onChange('allergenTextColor', v)}
          bgColor={cardBgColor}
        />
      </Section>

      <Section title="Separatore">
        <SelectField
          label="Stile separatore"
          value={value.separatorStyle}
          onChange={v => onChange('separatorStyle', v as DishTheme['separatorStyle'])}
          options={SEPARATOR_STYLE_OPTIONS}
        />
        <ColorField
          label="Colore separatore"
          value={value.separatorColor}
          onChange={v => onChange('separatorColor', v)}
        />
      </Section>

      <Section title="Scelta dello chef">
        <ColorField
          label="Colore indicatore"
          value={value.chefChoiceColor}
          onChange={v => onChange('chefChoiceColor', v)}
        />
      </Section>
    </div>
  );
}
