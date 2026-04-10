'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { updateRestaurantInfo, setRestaurantPublished, type InfoActionState } from './actions';
import ImageUploader from '@/components/admin/ImageUploader';
import ToggleField from '@/components/admin/theme/ToggleField';
import ConfirmModal from '@/components/admin/theme/ConfirmModal';
import { toastSuccess, toastError } from '@/lib/toast';

interface InfoFormProps {
  restaurantId: string;
  isPublished: boolean;
  slug: string;
  defaultValues: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    city: string;
    province: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
    coverUrl: string;
  };
}

const FIELDS: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
  textarea?: boolean;
}[] = [
  { name: 'name', label: 'Nome ristorante', required: true },
  { name: 'slug', label: 'Slug (URL)', required: true, hint: 'Usato nell\'URL pubblico: /{slug}. Attenzione: cambiarlo rompe i QR già stampati.' },
  { name: 'tagline', label: 'Tagline' },
  { name: 'description', label: 'Descrizione', textarea: true },
  { name: 'city', label: 'Città' },
  { name: 'province', label: 'Provincia' },
  { name: 'address', label: 'Indirizzo' },
  { name: 'phone', label: 'Telefono', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'website', label: 'Sito web', type: 'url' },
];

export default function InfoForm({ restaurantId, isPublished, slug, defaultValues }: InfoFormProps) {
  const boundAction = updateRestaurantInfo.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState<InfoActionState, FormData>(
    boundAction,
    { success: false },
  );

  const [logoUrl, setLogoUrl] = useState<string | null>(defaultValues.logoUrl || null);
  const [coverUrl, setCoverUrl] = useState<string | null>(defaultValues.coverUrl || null);

  const [published, setPublished] = useState(isPublished);
  const [pendingNext, setPendingNext] = useState<boolean | null>(null);
  const [isPublishPending, startPublishTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      toastSuccess('Modifiche salvate.');
    }
  }, [state]);

  const confirmPublishChange = () => {
    if (pendingNext === null) return;
    const next = pendingNext;
    startPublishTransition(async () => {
      const result = await setRestaurantPublished(restaurantId, next);
      if (result.success) {
        setPublished(next);
        setPendingNext(null);
        toastSuccess(next ? 'Ristorante pubblicato.' : 'Ristorante depubblicato.');
      } else {
        setPendingNext(null);
        toastError(result.error ?? 'Errore durante l\'aggiornamento.');
      }
    });
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors';
  const errorInputClass =
    'w-full px-3 py-2 text-sm border border-red-300 rounded-md bg-white text-[#1c1917] outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-colors';

  return (
    <>
    <div className="max-w-xl">
    <form action={formAction}>
      {/* General error */}
      {state.error && !state.success && (
        <div className="mb-6 px-4 py-3 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-5">
        {FIELDS.map(field => {
          const fieldErrors = state.fieldErrors?.[field.name];
          const hasError = fieldErrors && fieldErrors.length > 0;

          return (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-[13px] font-medium text-[#44403c] mb-1.5"
              >
                {field.label}
                {field.required && <span className="text-[#c9b97a] ml-0.5">*</span>}
              </label>

              {field.textarea ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  defaultValue={defaultValues[field.name as keyof typeof defaultValues]}
                  required={field.required}
                  rows={4}
                  className={hasError ? errorInputClass : inputClass}
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || 'text'}
                  defaultValue={defaultValues[field.name as keyof typeof defaultValues]}
                  required={field.required}
                  className={hasError ? errorInputClass : inputClass}
                />
              )}

              {field.name === 'slug' && (
                <p className="mt-1.5 px-2.5 py-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded">
                  Usato nell&apos;URL pubblico: /{'{slug}'}. Cambiarlo invalida i QR già stampati.
                </p>
              )}
              {field.hint && field.name !== 'slug' && !hasError && (
                <p className="mt-1 text-[11px] text-[#a8a29e]">{field.hint}</p>
              )}

              {hasError && (
                <p className="mt-1 text-[12px] text-red-600">{fieldErrors[0]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Images */}
      <div className="mt-8 space-y-6">
        <h3 className="text-sm font-semibold text-[#44403c] uppercase tracking-wider">Immagini</h3>
        <input type="hidden" name="logoUrl" value={logoUrl ?? ''} />
        <input type="hidden" name="coverUrl" value={coverUrl ?? ''} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploader
            restaurantId={restaurantId}
            kind="LOGO"
            value={logoUrl}
            onChange={setLogoUrl}
            aspectRatio="square"
            label="Logo"
          />
          <ImageUploader
            restaurantId={restaurantId}
            kind="COVER"
            value={coverUrl}
            onChange={setCoverUrl}
            aspectRatio="16/9"
            label="Foto di copertina"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isPending ? 'Salvataggio...' : 'Salva modifiche'}
        </button>
      </div>
    </form>

    {/* Stato pubblicazione — controllo indipendente dal form */}
    <div className="mt-12 pt-8 border-t border-[#e7e5e4]">
      <h3 className="text-sm font-semibold text-[#44403c] uppercase tracking-wider mb-4">
        Stato pubblicazione
      </h3>
      <div className="px-4 py-4 border border-[#e7e5e4] rounded-md bg-[#fafaf9]">
        <ToggleField
          label="Visibile pubblicamente"
          checked={published}
          onChange={next => setPendingNext(next)}
        />
        <p className="mt-2 ml-12 text-[12px] text-[#78716c]">
          {published ? (
            <>I clienti possono vedere il menu su <code className="text-[#44403c]">/{slug}</code>.</>
          ) : (
            <>Il ristorante è in <strong>bozza</strong>: non è raggiungibile dai clienti.</>
          )}
        </p>
      </div>
    </div>
    </div>
    {pendingNext !== null && (
      <ConfirmModal
        title={pendingNext ? 'Pubblicare il ristorante?' : 'Depubblicare il ristorante?'}
        message={
          pendingNext
            ? `Il ristorante diventerà visibile a chiunque visiti /${slug}. Vuoi pubblicarlo ora?`
            : 'I clienti non potranno più vedere il menu. Vuoi depubblicare il ristorante?'
        }
        confirmLabel={pendingNext ? 'Pubblica' : 'Depubblica'}
        confirmVariant={pendingNext ? 'primary' : 'destructive'}
        onConfirm={confirmPublishChange}
        onCancel={() => setPendingNext(null)}
        isPending={isPublishPending}
      />
    )}
    </>
  );
}
