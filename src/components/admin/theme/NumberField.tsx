'use client';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

const inputClass =
  'w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors';

export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: Props) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[#44403c]">{label}</span>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="number"
          value={value}
          onChange={e => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          min={min}
          max={max}
          step={step}
          className={inputClass}
        />
        {unit && <span className="text-[12px] text-[#a8a29e] shrink-0">{unit}</span>}
      </div>
    </label>
  );
}
