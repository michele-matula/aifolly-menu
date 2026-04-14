'use client';

import { useActionState } from 'react';
import { changeTenantPlan, extendTenantTrial, type TenantActionState } from './actions';

type Plan = { id: string; name: string; slug: string };

type Props = {
  tenantId: string;
  plans: Plan[];
  currentPlanId: string | null;
};

const initialState: TenantActionState = { success: false };

export default function TenantActionForms({ tenantId, plans, currentPlanId }: Props) {
  const boundChange = changeTenantPlan.bind(null, tenantId);
  const boundExtend = extendTenantTrial.bind(null, tenantId);
  const [changeState, changeAction, changePending] = useActionState(boundChange, initialState);
  const [extendState, extendAction, extendPending] = useActionState(boundExtend, initialState);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        action={changeAction}
        className="rounded-lg border border-stone-800 bg-[#1c1917] p-5"
      >
        <h3 className="text-sm font-semibold text-stone-100 mb-1">Cambia piano</h3>
        <p className="text-xs text-stone-400 mb-4">
          Assegna un nuovo piano al tenant. Free Perenne e piani paid azzerano il trial.
        </p>
        <select
          name="planId"
          defaultValue={currentPlanId ?? ''}
          required
          className="w-full bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 mb-3"
        >
          <option value="" disabled>
            Seleziona un piano
          </option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.slug})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={changePending}
          className="w-full px-4 py-2 rounded-md bg-amber-500 text-stone-900 text-sm font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {changePending ? 'Applico...' : 'Applica cambio piano'}
        </button>
        {changeState.error && (
          <p className="mt-2 text-xs text-red-400">{changeState.error}</p>
        )}
        {changeState.success && (
          <p className="mt-2 text-xs text-emerald-400">Piano aggiornato.</p>
        )}
      </form>

      <form
        action={extendAction}
        className="rounded-lg border border-stone-800 bg-[#1c1917] p-5"
      >
        <h3 className="text-sm font-semibold text-stone-100 mb-1">Estendi trial</h3>
        <p className="text-xs text-stone-400 mb-4">
          Aggiunge N giorni alla data di scadenza del trial. Se scaduto, riparte da oggi.
        </p>
        <input
          type="number"
          name="days"
          min={1}
          max={365}
          defaultValue={15}
          required
          className="w-full bg-stone-900 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 mb-3"
        />
        <button
          type="submit"
          disabled={extendPending}
          className="w-full px-4 py-2 rounded-md bg-stone-700 text-stone-100 text-sm font-medium hover:bg-stone-600 disabled:opacity-50 transition-colors"
        >
          {extendPending ? 'Estendo...' : 'Estendi trial'}
        </button>
        {extendState.error && (
          <p className="mt-2 text-xs text-red-400">{extendState.error}</p>
        )}
        {extendState.success && (
          <p className="mt-2 text-xs text-emerald-400">Trial aggiornato.</p>
        )}
      </form>
    </div>
  );
}
