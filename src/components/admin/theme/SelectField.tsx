'use client';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

const selectClass =
  'w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors cursor-pointer';

export default function SelectField({ label, value, onChange, options }: Props) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[#44403c]">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${selectClass} mt-1`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
