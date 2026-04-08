'use client';

import { useState } from 'react';
import ContrastWarning from './ContrastWarning';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  bgColor?: string;
};

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export default function ColorField({ label, value, onChange, bgColor }: Props) {
  const [hexInput, setHexInput] = useState(value);

  const handleColorInput = (hex: string) => {
    setHexInput(hex);
    if (HEX_REGEX.test(hex)) {
      onChange(hex);
    }
  };

  const handleBlur = () => {
    if (!HEX_REGEX.test(hexInput)) {
      setHexInput(value);
    }
  };

  // Sync external value changes
  if (HEX_REGEX.test(value) && value !== hexInput && HEX_REGEX.test(hexInput) && value.toLowerCase() !== hexInput.toLowerCase()) {
    setHexInput(value);
  }

  return (
    <div>
      <span className="block text-[13px] font-medium text-[#44403c] mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setHexInput(e.target.value);
          }}
          className="w-9 h-9 rounded border border-[#e7e5e4] cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={hexInput}
          onChange={e => handleColorInput(e.target.value)}
          onBlur={handleBlur}
          maxLength={7}
          className="flex-1 px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors font-mono"
        />
      </div>
      {bgColor && <ContrastWarning textColor={value} bgColor={bgColor} />}
    </div>
  );
}
