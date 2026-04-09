'use client';

import { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { DishTag, Allergen } from '@prisma/client';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  createDish,
  updateDish,
  deleteDish,
  type DishActionState,
} from '@/app/admin/(dashboard)/restaurants/[id]/dishes/actions';

// ── Label maps ──────────────────────────────────────────────

const TAG_LABELS: Record<string, string> = {
  VEGETARIANO: 'Vegetariano',
  VEGANO: 'Vegano',
  SENZA_GLUTINE: 'Senza Glutine',
  PICCANTE: 'Piccante',
  BIOLOGICO: 'Biologico',
  KM_ZERO: 'Km 0',
  SURGELATO: 'Surgelato',
};

const ALLERGEN_LABELS: Record<string, string> = {
  GLUTINE: 'Glutine',
  CROSTACEI: 'Crostacei',
  UOVA: 'Uova',
  PESCE: 'Pesce',
  ARACHIDI: 'Arachidi',
  SOIA: 'Soia',
  LATTE: 'Latte',
  FRUTTA_A_GUSCIO: 'Frutta a guscio',
  SEDANO: 'Sedano',
  SENAPE: 'Senape',
  SESAMO: 'Sesamo',
  ANIDRIDE_SOLFOROSA: 'Anidride solforosa',
  LUPINI: 'Lupini',
  MOLLUSCHI: 'Molluschi',
};

// ── Types ───────────────────────────────────────────────────

interface VariantRow {
  id?: string;
  label: string;
  price: string;
}

interface DishData {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  priceLabel: string | null;
  categoryId: string;
  tags: string[];
  allergens: string[];
  isChefChoice: boolean;
  isAvailable: boolean;
  isVisible: boolean;
  variants: { id: string; label: string; price: number }[];
}

interface Props {
  mode: 'create' | 'edit';
  restaurantId: string;
  categories: { id: string; name: string }[];
  dish?: DishData;
  defaultCategoryId?: string;
}

// ── Component ───────────────────────────────────────────────

export default function DishForm({ mode, restaurantId, categories, dish, defaultCategoryId }: Props) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(dish?.imageUrl ?? null);

  // Tags & allergens state
  const [selectedTags, setSelectedTags] = useState<string[]>(dish?.tags ?? []);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(dish?.allergens ?? []);

  // Variants state
  const [variants, setVariants] = useState<VariantRow[]>(
    dish?.variants.map(v => ({ id: v.id, label: v.label, price: String(v.price) })) ?? []
  );
  const [showVariants, setShowVariants] = useState(variants.length > 0);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form action
  const boundAction = isEdit
    ? updateDish.bind(null, restaurantId, dish!.id)
    : createDish.bind(null, restaurantId);

  const [state, formAction, isPending] = useActionState<DishActionState, FormData>(
    boundAction,
    { success: false },
  );

  useEffect(() => {
    if (state.success) {
      const catId = isEdit ? dish?.categoryId : defaultCategoryId;
      const url = `/admin/restaurants/${restaurantId}/dishes${catId ? `?category=${catId}` : ''}`;
      router.push(url);
      router.refresh();
    }
  }, [state.success, restaurantId, router, isEdit, dish?.categoryId, defaultCategoryId]);

  const handleDelete = async () => {
    if (!dish) return;
    const result = await deleteDish(restaurantId, dish.id);
    if (result.success) {
      router.push(`/admin/restaurants/${restaurantId}/dishes`);
      router.refresh();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleAllergen = (a: string) => {
    setSelectedAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-[#e7e5e4] rounded-md bg-white text-[#1c1917] outline-none focus:border-[#c9b97a] focus:ring-1 focus:ring-[#c9b97a]/30 transition-colors';

  return (
    <form action={formAction} className="max-w-2xl">
      {/* Error banner */}
      {state.error && !state.success && (
        <div className="mb-6 px-4 py-3 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      {/* Hidden fields for arrays */}
      {selectedTags.map(t => <input key={t} type="hidden" name="tags" value={t} />)}
      {selectedAllergens.map(a => <input key={a} type="hidden" name="allergens" value={a} />)}
      <input type="hidden" name="variants" value={JSON.stringify(
        showVariants ? variants.map(v => ({
          ...(v.id ? { id: v.id } : {}),
          label: v.label,
          price: parseFloat(v.price) || 0,
        })) : []
      )} />
      <input type="hidden" name="isAvailable" value={dish?.isAvailable !== false ? 'on' : 'off'} />
      <input type="hidden" name="isVisible" value={dish?.isVisible !== false ? 'on' : 'off'} />

      {/* ── Base ── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[#44403c] mb-4 uppercase tracking-wider">Informazioni base</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-[#44403c] mb-1">
              Nome <span className="text-[#c9b97a]">*</span>
            </label>
            <input id="name" name="name" required defaultValue={dish?.name ?? ''} className={inputClass} />
            {state.fieldErrors?.name && <p className="mt-1 text-[12px] text-red-600">{state.fieldErrors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-[13px] font-medium text-[#44403c] mb-1">Descrizione</label>
            <textarea id="description" name="description" rows={3} defaultValue={dish?.description ?? ''} className={inputClass} />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-[13px] font-medium text-[#44403c] mb-1">
              Categoria <span className="text-[#c9b97a]">*</span>
            </label>
            <select id="categoryId" name="categoryId" required defaultValue={dish?.categoryId ?? defaultCategoryId ?? ''} className={inputClass}>
              <option value="">Seleziona...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {state.fieldErrors?.categoryId && <p className="mt-1 text-[12px] text-red-600">{state.fieldErrors.categoryId[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-[13px] font-medium text-[#44403c] mb-1">Prezzo (€)</label>
              <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={dish?.price ?? ''} className={inputClass} placeholder="0.00" />
              {state.fieldErrors?.price && <p className="mt-1 text-[12px] text-red-600">{state.fieldErrors.price[0]}</p>}
            </div>
            <div>
              <label htmlFor="priceLabel" className="block text-[13px] font-medium text-[#44403c] mb-1">Etichetta prezzo</label>
              <input id="priceLabel" name="priceLabel" defaultValue={dish?.priceLabel ?? ''} className={inputClass} placeholder="es. Su richiesta" />
            </div>
          </div>

          <div>
            <input type="hidden" name="imageUrl" value={imageUrl ?? ''} />
            <ImageUploader
              restaurantId={restaurantId}
              kind="DISH"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="4/3"
              label="Immagine piatto"
            />
          </div>
        </div>
      </section>

      {/* ── Attributes ── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[#44403c] mb-4 uppercase tracking-wider">Attributi</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-[13px] text-[#44403c] cursor-pointer">
            <input name="isChefChoice" type="checkbox" defaultChecked={dish?.isChefChoice ?? false} className="accent-[#c9b97a]" />
            Proposta dello chef
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#44403c] cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={dish?.isVisible !== false}
              onChange={e => {
                const hidden = e.target.form?.querySelector<HTMLInputElement>('input[name="isVisible"]');
                if (hidden) hidden.value = e.target.checked ? 'on' : 'off';
              }}
              className="accent-[#c9b97a]"
            />
            Visibile nel menu
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#44403c] cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={dish?.isAvailable !== false}
              onChange={e => {
                const hidden = e.target.form?.querySelector<HTMLInputElement>('input[name="isAvailable"]');
                if (hidden) hidden.value = e.target.checked ? 'on' : 'off';
              }}
              className="accent-[#c9b97a]"
            />
            Disponibile
          </label>
        </div>
      </section>

      {/* ── Tags ── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[#44403c] mb-4 uppercase tracking-wider">Tag</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(DishTag).map(tag => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#c9b97a] bg-[#c9b97a]/10 text-[#8a7a4a] font-medium'
                    : 'border-[#e7e5e4] text-[#78716c] hover:border-[#d6d3d1]'
                }`}
              >
                {TAG_LABELS[tag] ?? tag}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Allergens ── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[#44403c] mb-4 uppercase tracking-wider">Allergeni</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(Allergen).map(a => {
            const active = selectedAllergens.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergen(a)}
                className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors cursor-pointer ${
                  active
                    ? 'border-amber-300 bg-amber-50 text-amber-800 font-medium'
                    : 'border-[#e7e5e4] text-[#78716c] hover:border-[#d6d3d1]'
                }`}
              >
                {ALLERGEN_LABELS[a] ?? a}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Price Variants ── */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[#44403c] mb-3 uppercase tracking-wider">Varianti di prezzo</h3>
        <label className="flex items-center gap-2 text-[13px] text-[#44403c] cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={showVariants}
            onChange={e => {
              setShowVariants(e.target.checked);
              if (!e.target.checked) setVariants([]);
            }}
            className="accent-[#c9b97a]"
          />
          Questo piatto ha più formati di prezzo
        </label>

        {showVariants && (
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={v.label}
                  onChange={e => {
                    const next = [...variants];
                    next[idx] = { ...next[idx], label: e.target.value };
                    setVariants(next);
                  }}
                  placeholder="es. Calice"
                  className={`${inputClass} flex-1`}
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-sm">€</span>
                  <input
                    value={v.price}
                    onChange={e => {
                      const next = [...variants];
                      next[idx] = { ...next[idx], price: e.target.value };
                      setVariants(next);
                    }}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`${inputClass} w-28 pl-7`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                  className="p-1.5 text-[#a8a29e] hover:text-red-500 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setVariants([...variants, { label: '', price: '' }])}
              className="text-[13px] text-[#c9b97a] hover:text-[#b5a468] font-medium cursor-pointer"
            >
              + Aggiungi variante
            </button>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <div className="flex items-center gap-4 pt-6 border-t border-[#e7e5e4]">
        {isEdit && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[13px] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Elimina piatto
          </button>
        )}
        <div className="flex-1" />
        <a
          href={`/admin/restaurants/${restaurantId}/dishes`}
          className="px-4 py-2 text-[13px] text-[#78716c] hover:text-[#1c1917] no-underline transition-colors"
        >
          Annulla
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isPending ? 'Salvataggio...' : 'Salva piatto'}
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-[#1c1917] mb-2">Elimina piatto</h3>
            <p className="text-sm text-[#78716c] mb-6">
              Sei sicuro di voler eliminare <strong>{dish?.name}</strong>? Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[13px] text-[#78716c] cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-[13px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
