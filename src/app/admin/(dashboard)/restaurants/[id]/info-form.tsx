'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateRestaurantInfo, type InfoActionState } from './actions';

interface InfoFormProps {
  restaurantId: string;
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

export default function InfoForm({ restaurantId, defaultValues }: InfoFormProps) {
  const boundAction = updateRestaurantInfo.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState<InfoActionState, FormData>(
    boundAction,
    { success: false },
  );

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const inputClass =
    'w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors';
  const errorInputClass =
    'w-full px-3 py-2 text-sm border border-red-300 rounded-md bg-white text-[#1c1917] outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-colors';

  return (
    <form action={formAction} className="max-w-xl">
      {/* General error */}
      {state.error && !state.success && (
        <div className="mb-6 px-4 py-3 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="mb-6 px-4 py-3 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
          Modifiche salvate.
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

              {field.hint && !hasError && (
                <p className="mt-1 text-[11px] text-[#a8a29e]">{field.hint}</p>
              )}

              {hasError && (
                <p className="mt-1 text-[12px] text-red-600">{fieldErrors[0]}</p>
              )}
            </div>
          );
        })}
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
  );
}
