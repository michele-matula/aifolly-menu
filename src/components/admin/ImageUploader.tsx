'use client';

import { useState, useRef, useCallback } from 'react';
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validators/upload';

type Props = {
  restaurantId: string;
  kind: 'LOGO' | 'COVER' | 'DISH' | 'GENERIC';
  value: string | null;
  onChange: (url: string | null) => void;
  aspectRatio?: 'square' | '16/9' | '4/3' | 'free';
  label?: string;
};

const ASPECT_MAP = {
  square: 'aspect-square',
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  free: '',
};

export default function ImageUploader({
  restaurantId,
  kind,
  value,
  onChange,
  aspectRatio = 'free',
  label,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  // Traccia l'id del MediaAsset creato in questa sessione per cleanup
  const currentAssetId = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
      return 'Formato non supportato. Usa JPEG, PNG, WebP o AVIF.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Il file supera il limite di 5MB.';
    }
    return null;
  }, []);

  const upload = useCallback(async (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Se c'era un asset precedente caricato in questa sessione, eliminalo
      if (currentAssetId.current) {
        await fetch(`/api/admin/media/${currentAssetId.current}`, { method: 'DELETE' });
        currentAssetId.current = null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurantId', restaurantId);
      formData.append('kind', kind);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Errore durante il caricamento.');
        return;
      }

      currentAssetId.current = data.mediaAssetId;
      onChange(data.url);
    } catch {
      setError('Errore di rete durante il caricamento.');
    } finally {
      setUploading(false);
    }
  }, [restaurantId, kind, onChange, validate]);

  const handleRemove = useCallback(async () => {
    // Elimina il MediaAsset solo se è stato creato in questa sessione
    if (currentAssetId.current) {
      await fetch(`/api/admin/media/${currentAssetId.current}`, { method: 'DELETE' });
      currentAssetId.current = null;
    }
    onChange(null);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }, [upload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    // Reset input per permettere re-upload dello stesso file
    e.target.value = '';
  }, [upload]);

  const aspectClass = ASPECT_MAP[aspectRatio] || '';

  return (
    <div>
      {label && (
        <label className="block text-[13px] font-medium text-[#44403c] mb-1.5">{label}</label>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="mb-2 px-3 py-2 text-[12px] text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {value ? (
        /* Preview con azioni */
        <div className="relative group">
          <div className={`relative overflow-hidden rounded-md border border-[#e7e5e4] bg-[#fafaf9] ${aspectClass}`}>
            <img
              src={value}
              alt="Preview"
              className={`w-full h-full object-cover ${aspectClass ? '' : 'max-h-48'}`}
            />
            {/* Overlay con azioni */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 text-[12px] font-medium text-white bg-white/20 backdrop-blur rounded border border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
              >
                Sostituisci
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 text-[12px] font-medium text-white bg-red-500/70 backdrop-blur rounded border border-red-400/30 cursor-pointer hover:bg-red-500/90 transition-colors"
              >
                Rimuovi
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone */
        <div
          role="button"
          tabIndex={0}
          aria-label={label ? `Carica ${label}` : 'Carica immagine'}
          aria-busy={uploading}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !uploading) { e.preventDefault(); inputRef.current?.click(); } }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${aspectClass} ${
            dragOver
              ? 'border-[#c9b97a] bg-[#c9b97a]/5'
              : 'border-[#e7e5e4] bg-[#fafaf9] hover:border-[#d6d3d1]'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#c9b97a] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-[13px] text-[#78716c]">Caricamento...</p>
            </>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-[13px] text-[#78716c]">Clicca o trascina un&apos;immagine</p>
              <p className="text-[11px] text-[#a8a29e] mt-1">JPEG, PNG, WebP, AVIF · Max 5MB</p>
            </>
          )}
        </div>
      )}

      {/* Upload durante preview: overlay */}
      {uploading && value && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md">
          <div className="w-6 h-6 border-2 border-[#c9b97a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
