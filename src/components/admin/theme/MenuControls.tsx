'use client';

import type { MenuTheme, FontConfig } from '@/lib/validators/theme';
import ColorField from './ColorField';
import FontConfigEditor from './FontConfigEditor';
import NumberField from './NumberField';
import SelectField from './SelectField';
import ToggleField from './ToggleField';

type Props = {
  value: MenuTheme;
  onChange: <K extends keyof MenuTheme>(field: K, value: MenuTheme[K]) => void;
};

const DIVIDER_STYLE_OPTIONS = [
  { value: 'line', label: 'Linea' },
  { value: 'dotted', label: 'Puntini' },
  { value: 'ornament', label: 'Ornamento' },
  { value: 'none', label: 'Nessuno' },
];

const NAV_INDICATOR_OPTIONS = [
  { value: 'underline', label: 'Sottolineato' },
  { value: 'pill', label: 'Pillola' },
  { value: 'dot', label: 'Punto' },
  { value: 'none', label: 'Nessuno' },
];

const CARD_STYLE_OPTIONS = [
  { value: 'elevated', label: 'Rialzato' },
  { value: 'flat', label: 'Piatto' },
  { value: 'bordered', label: 'Con bordo' },
  { value: 'minimal', label: 'Minimale' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h5 className="text-[12px] font-semibold text-[#a8a29e] uppercase tracking-wider">{title}</h5>
      {children}
    </div>
  );
}

export default function MenuControls({ value, onChange }: Props) {
  const handleFontChange = (
    field: 'sectionHeaderFont' | 'navFont',
    prop: keyof FontConfig,
    v: FontConfig[keyof FontConfig],
  ) => {
    onChange(field, { ...value[field], [prop]: v });
  };

  return (
    <div className="space-y-6">
      <Section title="Sfondo pagina">
        <ColorField label="Colore sfondo" value={value.backgroundColor} onChange={v => onChange('backgroundColor', v)} />
      </Section>

      <Section title="Header sezione">
        <FontConfigEditor
          label="Font titolo sezione"
          value={value.sectionHeaderFont}
          onChange={(prop, v) => handleFontChange('sectionHeaderFont', prop, v)}
          usage="menu"
        />
        <ColorField
          label="Colore titolo sezione"
          value={value.sectionHeaderColor}
          onChange={v => onChange('sectionHeaderColor', v)}
          bgColor={value.backgroundColor}
        />
        <ColorField
          label="Colore divisore"
          value={value.sectionDividerColor}
          onChange={v => onChange('sectionDividerColor', v)}
        />
        <SelectField
          label="Stile divisore"
          value={value.sectionDividerStyle}
          onChange={v => onChange('sectionDividerStyle', v as MenuTheme['sectionDividerStyle'])}
          options={DIVIDER_STYLE_OPTIONS}
        />
      </Section>

      <Section title="Navigazione categorie">
        <ColorField
          label="Sfondo navigazione"
          value={value.navBackgroundColor}
          onChange={v => onChange('navBackgroundColor', v)}
        />
        <ColorField
          label="Testo navigazione"
          value={value.navTextColor}
          onChange={v => onChange('navTextColor', v)}
          bgColor={value.navBackgroundColor}
        />
        <ColorField
          label="Colore attivo"
          value={value.navActiveColor}
          onChange={v => onChange('navActiveColor', v)}
        />
        <FontConfigEditor
          label="Font navigazione"
          value={value.navFont}
          onChange={(prop, v) => handleFontChange('navFont', prop, v)}
          usage="menu"
        />
        <SelectField
          label="Indicatore attivo"
          value={value.navIndicatorStyle}
          onChange={v => onChange('navIndicatorStyle', v as MenuTheme['navIndicatorStyle'])}
          options={NAV_INDICATOR_OPTIONS}
        />
      </Section>

      <Section title="Card piatto">
        <ColorField
          label="Sfondo card"
          value={value.cardBackgroundColor}
          onChange={v => onChange('cardBackgroundColor', v)}
        />
        <ColorField
          label="Bordo card"
          value={value.cardBorderColor}
          onChange={v => onChange('cardBorderColor', v)}
        />
        <NumberField
          label="Raggio bordo card"
          value={value.cardBorderRadius}
          onChange={v => onChange('cardBorderRadius', v)}
          min={0} max={24} step={1} unit="px"
        />
        <SelectField
          label="Stile card"
          value={value.cardStyle}
          onChange={v => onChange('cardStyle', v as MenuTheme['cardStyle'])}
          options={CARD_STYLE_OPTIONS}
        />
        <ToggleField
          label="Mostra immagine piatto"
          checked={value.cardShowImage}
          onChange={v => onChange('cardShowImage', v)}
        />
        {value.cardShowImage && (
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Raggio immagine"
              value={value.cardImageRadius}
              onChange={v => onChange('cardImageRadius', v)}
              min={0} max={24} step={1} unit="px"
            />
            <NumberField
              label="Dimensione immagine"
              value={value.cardImageSize}
              onChange={v => onChange('cardImageSize', v)}
              min={60} max={120} step={4} unit="px"
            />
          </div>
        )}
      </Section>

      <Section title="Filtri">
        <ColorField
          label="Colore pillola"
          value={value.filterPillColor}
          onChange={v => onChange('filterPillColor', v)}
        />
        <ColorField
          label="Testo pillola"
          value={value.filterPillTextColor}
          onChange={v => onChange('filterPillTextColor', v)}
          bgColor={value.filterPillColor}
        />
        <ColorField
          label="Testo pillola attiva"
          value={value.filterPillActiveTextColor}
          onChange={v => onChange('filterPillActiveTextColor', v)}
          bgColor={value.filterPillColor}
        />
      </Section>

      <Section title="Footer">
        <ColorField
          label="Sfondo footer"
          value={value.footerBackgroundColor}
          onChange={v => onChange('footerBackgroundColor', v)}
        />
        <ColorField
          label="Testo footer"
          value={value.footerTextColor}
          onChange={v => onChange('footerTextColor', v)}
          bgColor={value.footerBackgroundColor}
        />
        <ColorField
          label="Accento footer"
          value={value.footerAccentColor}
          onChange={v => onChange('footerAccentColor', v)}
        />
      </Section>

      <Section title="Effetti">
        <ToggleField
          label="Texture grana"
          checked={value.showGrainTexture}
          onChange={v => onChange('showGrainTexture', v)}
        />
        {value.showGrainTexture && (
          <NumberField
            label="Opacità grana"
            value={value.grainOpacity}
            onChange={v => onChange('grainOpacity', v)}
            min={0} max={0.1} step={0.005}
          />
        )}
      </Section>
    </div>
  );
}
