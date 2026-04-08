'use client';

import { getContrastRatio, getContrastLevel } from '@/lib/theme/contrast';

type Props = {
  textColor: string;
  bgColor: string;
};

export default function ContrastWarning({ textColor, bgColor }: Props) {
  const ratio = getContrastRatio(textColor, bgColor);
  const level = getContrastLevel(ratio);

  if (level === 'aa' || level === 'aaa') return null;

  const isFailure = level === 'fail';

  return (
    <span
      className={`inline-flex items-center gap-1 mt-1 text-[11px] font-medium ${
        isFailure
          ? 'text-red-600'
          : 'text-amber-600'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isFailure ? 'bg-red-500' : 'bg-amber-500'}`} />
      {isFailure
        ? `Contrasto insufficiente (${ratio.toFixed(1)}:1)`
        : `Contrasto basso (${ratio.toFixed(1)}:1)`}
    </span>
  );
}
