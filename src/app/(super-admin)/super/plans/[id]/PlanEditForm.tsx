'use client';

import { useActionState } from 'react';
import { updatePlan, type PlanEditState } from './actions';

type PlanData = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: string; // serializzato come string (Decimal → number non sempre affidabile)
  stripePriceId: string | null;
  maxDishes: number;
  maxCategories: number;
  maxImages: number;
  customTheme: boolean;
  googleFonts: boolean;
  removeBranding: boolean;
  analytics: boolean;
  isActive: boolean;
  isFreeEternal: boolean;
  restaurantCount: number;
};

type Props = { plan: PlanData };

const initialState: PlanEditState = { success: false };

export default function PlanEditForm({ plan }: Props) {
  const bound = updatePlan.bind(null, plan.id);
  const [state, action, pending] = useActionState(bound, initialState);

  const impactHint =
    plan.restaurantCount > 0
      ? `${plan.restaurantCount} tenant usa${plan.restaurantCount === 1 ? '' : 'no'} attualmente questo piano: le modifiche avranno effetto immediato su di lor${plan.restaurantCount === 1 ? 'o' : 'o'}.`
      : 'Nessun tenant usa attualmente questo piano.';

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
        {impactHint}
      </div>

      <Field
        label="Nome"
        name="name"
        type="text"
        defaultValue={plan.name}
        required
        help="Nome visibile ai ristoratori nella pagina upgrade e nel badge piano attivo."
        errors={state.fieldErrors?.name}
      />

      <Field
        label="Slug (read-only)"
        name="slug_display"
        type="text"
        defaultValue={plan.slug}
        disabled
        help="Identificatore tecnico immutabile. Usato dal codice per distinguere i piani (es. 'basic', 'pro', 'free-trial'). Non editabile per coerenza del sistema."
      />

      <Field
        label="Prezzo mensile (€)"
        name="priceMonthly"
        type="number"
        step="0.01"
        min="0"
        defaultValue={plan.priceMonthly}
        required
        help={`Importo fatturato mensilmente via Stripe. Metti 0 per piani gratuiti. Deve combaciare col Price creato in Stripe (linkato tramite stripePriceId).${plan.slug === 'free-trial' || plan.isFreeEternal ? ' Per questo piano dovrebbe restare 0.' : ''}`}
        errors={state.fieldErrors?.priceMonthly}
      />

      <Field
        label="Stripe Price ID"
        name="stripePriceId"
        type="text"
        defaultValue={plan.stripePriceId ?? ''}
        placeholder="price_xxx (vuoto per piani free)"
        help="ID del Price creato nel Dashboard Stripe. Modificarlo influenza solo i NUOVI checkout: le subscription attive continuano col vecchio Price fino alla cancellazione. Lascia vuoto per piani free."
        errors={state.fieldErrors?.stripePriceId}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Max piatti"
          name="maxDishes"
          type="number"
          min="0"
          step="1"
          defaultValue={String(plan.maxDishes)}
          required
          help="Numero massimo di piatti creabili. Oltre il limite, il ristoratore vede un errore e il bottone 'Nuovo piatto' diventa un CTA upgrade."
          errors={state.fieldErrors?.maxDishes}
        />
        <Field
          label="Max categorie"
          name="maxCategories"
          type="number"
          min="0"
          step="1"
          defaultValue={String(plan.maxCategories)}
          required
          help="Numero massimo di categorie di menu. Esempio: 5 = Antipasti, Primi, Secondi, Contorni, Dolci."
          errors={state.fieldErrors?.maxCategories}
        />
        <Field
          label="Max immagini"
          name="maxImages"
          type="number"
          min="0"
          step="1"
          defaultValue={String(plan.maxImages)}
          required
          help="Immagini totali (logo, cover, foto piatti) che il ristoratore puo' caricare nella Media Library."
          errors={state.fieldErrors?.maxImages}
        />
      </div>

      <Checkbox
        name="customTheme"
        label="Theme builder personalizzato"
        defaultChecked={plan.customTheme}
        help="Se attivo, il ristoratore vede il theme builder completo (font, colori, layout). Se disattivo, vede solo il preset picker. Tipicamente: true per Pro, false per Basic/Free."
      />

      <Checkbox
        name="googleFonts"
        label="Google Fonts abilitati"
        defaultChecked={plan.googleFonts}
        help="Se attivo, il ristoratore puo' scegliere qualsiasi Google Font nel theme builder. Se disattivo, solo una lista curata di font di sistema."
      />

      <Checkbox
        name="removeBranding"
        label="Rimuovi branding AiFolly"
        defaultChecked={plan.removeBranding}
        help='Se attivo, il menu pubblico del ristorante non mostra la scritta "Powered by AiFolly". Feature premium tipica di piani top tier.'
      />

      <Checkbox
        name="analytics"
        label="Analytics avanzate"
        defaultChecked={plan.analytics}
        help="Se attivo, il ristoratore accede a una dashboard con metriche avanzate (scansioni QR, piatti piu' visti). Placeholder: la dashboard arrivera' in una fase successiva."
      />

      <Checkbox
        name="isActive"
        label="Piano attivo"
        defaultChecked={plan.isActive}
        help="Se disattivo, il piano NON appare ai nuovi utenti nella pagina upgrade, ma i tenant esistenti con questo piano continuano a usarlo normalmente (grandfathering). Disattiva invece di cancellare per preservare la storia."
      />

      <div className="pt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-md bg-amber-500 text-stone-900 text-sm font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Salvo...' : 'Salva modifiche'}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-400">Configurazione aggiornata.</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  help,
  errors,
  ...input
}: {
  label: string;
  help?: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-200 mb-1">{label}</label>
      <input
        {...input}
        className="w-full bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {help && <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">{help}</p>}
      {errors && errors.length > 0 && (
        <p className="mt-1 text-xs text-red-400">{errors.join(' · ')}</p>
      )}
    </div>
  );
}

function Checkbox({
  name,
  label,
  help,
  defaultChecked,
}: {
  name: string;
  label: string;
  help?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        id={name}
        defaultChecked={defaultChecked}
        className="mt-1 w-4 h-4 rounded border-stone-600 bg-stone-900 accent-amber-500"
      />
      <div className="flex-1">
        <label htmlFor={name} className="block text-sm font-medium text-stone-200 cursor-pointer">
          {label}
        </label>
        {help && <p className="mt-0.5 text-xs text-stone-500 leading-relaxed">{help}</p>}
      </div>
    </div>
  );
}
