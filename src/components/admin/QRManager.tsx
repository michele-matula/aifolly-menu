'use client';

import { useState, useCallback } from 'react';
import { generateQRPng, generateQRSvg } from '@/lib/qr/generate';
import { triggerDownload, triggerBlobDownload } from '@/lib/qr/download';

type Props = {
  slug: string;
  publicUrl: string;
  previewDataUrl: string;
  restaurantName: string;
};

export default function QRManager({
  slug,
  publicUrl,
  previewDataUrl,
  restaurantName,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [publicUrl]);

  const handleDownloadPng = useCallback(
    async (size: number, label: string, suffix = '') => {
      setDownloading(label);
      try {
        const dataUrl = await generateQRPng(publicUrl, { size });
        triggerDownload(dataUrl, `qr-${slug}${suffix}.png`);
      } finally {
        setDownloading(null);
      }
    },
    [publicUrl, slug],
  );

  const handleDownloadSvg = useCallback(async () => {
    setDownloading('svg');
    try {
      const svg = await generateQRSvg(publicUrl);
      triggerBlobDownload(svg, 'image/svg+xml', `qr-${slug}.svg`);
    } finally {
      setDownloading(null);
    }
  }, [publicUrl, slug]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1c1917] mb-1">QR Code</h2>
      <p className="text-sm text-[#78716c] mb-6">
        Stampa questo QR e posizionalo ai tavoli. I clienti lo inquadreranno con la fotocamera per vedere il menu.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Colonna sinistra — Preview */}
        <div className="w-full lg:w-1/2">
          <div className="border border-[#e7e5e4] rounded-lg p-8 bg-white flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewDataUrl}
              alt={`QR Code per ${restaurantName}`}
              width={400}
              height={400}
              className="w-full max-w-[400px]"
            />

            <div className="mt-4 flex items-center gap-2">
              <code className="text-[13px] text-[#78716c] break-all">{publicUrl}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 px-3 py-1.5 text-[12px] font-medium border border-[#e7e5e4] rounded-md hover:bg-[#fafaf9] transition-colors cursor-pointer text-[#44403c]"
              >
                {copied ? (
                  <span className="text-emerald-600">Copiato ✓</span>
                ) : (
                  'Copia URL'
                )}
              </button>
            </div>

            <p className="mt-2 text-[13px] text-[#a8a29e]">{restaurantName}</p>
          </div>
        </div>

        {/* Colonna destra — Download */}
        <div className="w-full lg:w-1/2 space-y-4">
          <DownloadCard
            title="PNG alta risoluzione"
            description="Formato immagine 1024×1024 px. Ideale per stampa su carta o plastica fino a A4."
            buttonLabel="Scarica PNG"
            isLoading={downloading === 'png'}
            onClick={() => handleDownloadPng(1024, 'png')}
          />

          <DownloadCard
            title="PNG extra-large"
            description="Formato immagine 2048×2048 px. Per stampe grandi (poster, vetrine)."
            buttonLabel="Scarica PNG XL"
            isLoading={downloading === 'png-xl'}
            onClick={() => handleDownloadPng(2048, 'png-xl', '-xl')}
          />

          <DownloadCard
            title="SVG vettoriale"
            description="Formato scalabile senza perdita. Per grafici e rifiniture professionali."
            buttonLabel="Scarica SVG"
            isLoading={downloading === 'svg'}
            onClick={handleDownloadSvg}
          />

          {/* Suggerimenti */}
          <div className="border border-[#e7e5e4] rounded-lg p-5 bg-[#fafaf9]">
            <h4 className="text-[13px] font-semibold text-[#44403c] mb-3">
              Suggerimenti per la stampa
            </h4>
            <ul className="space-y-2 text-[12px] text-[#78716c]">
              <li>Dimensione minima consigliata: 4×4 cm per una scansione affidabile da distanza normale.</li>
              <li>Stampa in nero su sfondo bianco per massimo contrasto.</li>
              <li>Plastifica o proteggi con vernice trasparente per resistere all&apos;usura sui tavoli.</li>
              <li>Testa il QR con più smartphone prima di stamparne molti esemplari.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadCard({
  title,
  description,
  buttonLabel,
  isLoading,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-[#e7e5e4] rounded-lg p-5 bg-white">
      <h4 className="text-[13px] font-semibold text-[#1c1917] mb-1">{title}</h4>
      <p className="text-[12px] text-[#78716c] mb-3">{description}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="px-5 py-2 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] disabled:opacity-60 transition-colors cursor-pointer"
      >
        {isLoading ? 'Generazione...' : buttonLabel}
      </button>
    </div>
  );
}
