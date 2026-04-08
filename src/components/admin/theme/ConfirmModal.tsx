'use client';

import { useEffect } from 'react';

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isPending,
}: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel, isPending]);

  const confirmClass =
    confirmVariant === 'destructive'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-[#c9b97a] hover:bg-[#b5a468] text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={isPending ? undefined : onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-[#1c1917] mb-2">{title}</h3>
        <p className="text-sm text-[#78716c] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-[13px] text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer disabled:opacity-60"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors cursor-pointer disabled:opacity-60 ${confirmClass}`}
          >
            {isPending ? 'Attendere...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
