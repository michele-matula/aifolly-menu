import Link from 'next/link';
import type { AccessStatus } from '@/lib/access-status';

type Props = {
  restaurantId: string;
  planName: string | null;
  planSlug: string | null;
  access: AccessStatus;
};

const PLAN_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'free-trial':   { label: 'Trial',        bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200' },
  'free-eternal': { label: 'Free Perenne', bg: 'bg-violet-50',  text: 'text-violet-800',  border: 'border-violet-200' },
  'basic':        { label: 'Basic',        bg: 'bg-sky-50',     text: 'text-sky-800',     border: 'border-sky-200' },
  'pro':          { label: 'Pro',          bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

export default function PlanStatusBar({ restaurantId, planName, planSlug, access }: Props) {
  const style =
    planSlug && PLAN_STYLES[planSlug]
      ? PLAN_STYLES[planSlug]
      : { label: planName ?? 'Nessun piano', bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200' };

  const showUpgradeCta = access.status === 'trial' || access.status === 'trial_expired';

  return (
    <div
      className={`flex flex-wrap items-center gap-3 mb-6 px-4 py-2.5 rounded-lg border ${style.bg} ${style.border}`}
    >
      <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
        Piano · {style.label}
      </span>

      {access.status === 'trial' && (
        <span className="text-sm text-amber-900">
          Scade tra <strong>{access.daysLeft}</strong>{' '}
          {access.daysLeft === 1 ? 'giorno' : 'giorni'}
        </span>
      )}

      {showUpgradeCta && (
        <Link
          href={`/admin/upgrade?restaurantId=${restaurantId}`}
          className="ml-auto text-xs font-medium px-3 py-1 rounded-md bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 transition-colors no-underline"
        >
          Scegli un piano →
        </Link>
      )}
    </div>
  );
}
