'use client';

import { useState, useCallback } from 'react';

type Props = {
  slug: string;
  activeTab: 'cover' | 'menu';
  iframeKey: number;
};

export default function ThemePreviewFrame({ slug, activeTab, iframeKey }: Props) {
  const [loading, setLoading] = useState(true);

  const src =
    activeTab === 'cover'
      ? `/${slug}?previewDraft=1&_k=${iframeKey}`
      : `/${slug}/menu?previewDraft=1&_k=${iframeKey}`;

  const handleLoad = useCallback(() => setLoading(false), []);

  // Reset loading state quando cambia src
  const frameKey = `${activeTab}-${iframeKey}`;

  return (
    <div className="relative h-full flex flex-col items-center">
      {/* Device frame */}
      <div className="relative w-full max-w-[400px] h-full bg-[#1c1917] rounded-[2rem] p-2 shadow-xl">
        {/* Screen area */}
        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-white">
          <iframe
            key={frameKey}
            src={src}
            className="w-full h-full border-0"
            title="Anteprima tema"
            onLoad={handleLoad}
          />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#c9b97a] border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] text-[#a8a29e]">Aggiornamento anteprima...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
