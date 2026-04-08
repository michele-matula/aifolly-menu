'use client';

import { useState, useCallback } from 'react';
import { publishTheme, discardDraft } from '@/app/admin/(dashboard)/restaurants/[id]/theme/actions';
import type { CoverTheme, MenuTheme, DishTheme } from '@/lib/validators/theme';
import { toastSuccess, toastError } from '@/lib/toast';
import ConfirmModal from './ConfirmModal';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  restaurantId: string;
  saveStatus: SaveStatus;
  hasDraft: boolean;
  onPublished: () => void;
  onDiscarded: (liveTheme: { cover: CoverTheme; menu: MenuTheme; dish: DishTheme }) => void;
};

export default function ThemeActionsHeader({
  restaurantId,
  saveStatus,
  hasDraft,
  onPublished,
  onDiscarded,
}: Props) {
  const [confirmAction, setConfirmAction] = useState<'publish' | 'discard' | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handlePublish = useCallback(async () => {
    setIsPending(true);
    const result = await publishTheme(restaurantId);
    setIsPending(false);
    setConfirmAction(null);
    if (result.success) {
      toastSuccess('Tema pubblicato con successo.');
      onPublished();
    } else {
      toastError(result.error || 'Errore durante la pubblicazione.');
    }
  }, [restaurantId, onPublished]);

  const handleDiscard = useCallback(async () => {
    setIsPending(true);
    const result = await discardDraft(restaurantId);
    setIsPending(false);
    setConfirmAction(null);
    if (result.success && result.data) {
      toastSuccess('Modifiche annullate.');
      onDiscarded(result.data);
    } else {
      toastError(result.error || 'Errore durante l\'annullamento.');
    }
  }, [restaurantId, onDiscarded]);

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1c1917]">Tema del menu</h2>
          <p className="text-[13px] text-[#a8a29e] mt-0.5">
            Le modifiche sono salvate come bozza automaticamente. Clicca &quot;Pubblica&quot; per renderle visibili ai clienti.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Indicatore stato salvataggio */}
          <span className="text-[12px] text-[#a8a29e] min-w-[80px] text-right">
            {saveStatus === 'saving' && 'Salvataggio...'}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600">Salvato ✓</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600">Errore salvataggio</span>
            )}
          </span>

          {hasDraft && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Modifiche non pubblicate" />
              <button
                type="button"
                onClick={() => setConfirmAction('discard')}
                className="px-4 py-2 text-[13px] text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer"
              >
                Annulla modifiche
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setConfirmAction('publish')}
            disabled={!hasDraft}
            className="px-5 py-2 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Pubblica tema
          </button>
        </div>
      </div>

      {confirmAction === 'publish' && (
        <ConfirmModal
          title="Pubblicare il tema?"
          message="Le modifiche della bozza saranno visibili a tutti i clienti che visualizzano il menu."
          confirmLabel="Pubblica"
          onConfirm={handlePublish}
          onCancel={() => setConfirmAction(null)}
          isPending={isPending}
        />
      )}

      {confirmAction === 'discard' && (
        <ConfirmModal
          title="Annullare le modifiche?"
          message="La bozza verrà eliminata e il builder tornerà al tema attualmente pubblicato."
          confirmLabel="Annulla modifiche"
          confirmVariant="destructive"
          onConfirm={handleDiscard}
          onCancel={() => setConfirmAction(null)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
