'use client';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ToggleField({ label, checked, onChange }: Props) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#c9b97a]' : 'bg-[#e7e5e4]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5 ${
            checked ? 'translate-x-[18px] ml-0' : 'translate-x-[2px]'
          }`}
        />
      </button>
      <span className="text-[13px] font-medium text-[#44403c]">{label}</span>
    </label>
  );
}
