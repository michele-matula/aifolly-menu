'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface MediaItem {
  id: string;
  url: string;
  kind: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface Props {
  restaurantId: string;
  initialAssets: MediaItem[];
  totalSize: number;
}

const KIND_LABELS: Record<string, string> = {
  LOGO: 'Logo',
  COVER: 'Cover',
  DISH: 'Piatti',
  GENERIC: 'Altro',
};

const FILTERS = ['ALL', 'LOGO', 'COVER', 'DISH', 'GENERIC'] as const;
const FILTER_LABELS: Record<string, string> = {
  ALL: 'Tutti',
  LOGO: 'Logo',
  COVER: 'Cover',
  DISH: 'Piatti',
  GENERIC: 'Altro',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ restaurantId, initialAssets, totalSize }: Props) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [filter, setFilter] = useState<string>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? assets : assets.filter(a => a.kind === filter);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/media/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      setAssets(prev => prev.filter(a => a.id !== deleteTarget.id));
      showToast('Immagine eliminata.');
    } else {
      showToast('Errore nell\'eliminazione.');
    }
    setDeleteTarget(null);
  }, [deleteTarget, showToast]);

  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL copiato.');
  }, [showToast]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1c1917]">Media</h2>
        <p className="text-sm text-[#78716c] mt-0.5">
          {assets.length} file · {formatSize(totalSize)} occupati
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 px-4 py-3 rounded-md text-[13px] bg-emerald-50 text-emerald-700 border border-emerald-200">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors cursor-pointer ${
              filter === f
                ? 'border-[#c9b97a] bg-[#c9b97a]/10 text-[#8a7a4a] font-medium'
                : 'border-[#e7e5e4] text-[#78716c] hover:border-[#d6d3d1]'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#e7e5e4] rounded-lg">
          <p className="text-[#78716c] text-sm">
            {assets.length === 0
              ? 'Nessuna immagine caricata. Le immagini appaiono qui quando le carichi dai form Info o Piatti.'
              : 'Nessuna immagine in questa categoria.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(asset => (
            <div key={asset.id} className="group relative rounded-md overflow-hidden border border-[#e7e5e4] bg-[#fafaf9]">
              <div className="aspect-square">
                <img
                  src={asset.url}
                  alt={asset.filename}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <span className="text-[10px] text-white/80 bg-black/30 px-2 py-0.5 rounded">
                  {KIND_LABELS[asset.kind] ?? asset.kind}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyUrl(asset.url)}
                    className="px-2 py-1 text-[11px] text-white bg-white/20 backdrop-blur rounded border border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    Copia URL
                  </button>
                  <button
                    onClick={() => setDeleteTarget(asset)}
                    className="px-2 py-1 text-[11px] text-white bg-red-500/60 backdrop-blur rounded border border-red-400/30 cursor-pointer hover:bg-red-500/80 transition-colors"
                  >
                    Elimina
                  </button>
                </div>
                <span className="text-[10px] text-white/60">{formatSize(asset.sizeBytes)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-[#1c1917] mb-2">Elimina immagine</h3>
            <p className="text-sm text-[#78716c] mb-1">
              Sei sicuro di voler eliminare <strong>{deleteTarget.filename}</strong>?
            </p>
            <p className="text-[12px] text-[#a8a29e] mb-6">
              Se questa immagine è in uso, il menu pubblico mostrerà un&apos;immagine mancante.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-[13px] text-[#78716c] cursor-pointer">Annulla</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-[13px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors cursor-pointer">Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
