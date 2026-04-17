import { describe, it, expect } from 'vitest';
import { deriveAccessStatus, type AccessStatusInput } from './access-status';

const base: AccessStatusInput = {
  isSuspended: false,
  suspendedReason: null,
  trialEndsAt: null,
  stripeSubscriptionStatus: null,
  plan: null,
};

describe('deriveAccessStatus', () => {
  it('returns suspended if isSuspended (regardless of plan or trial)', () => {
    const r = deriveAccessStatus({
      ...base,
      isSuspended: true,
      suspendedReason: 'abuso',
      plan: { isFreeEternal: true, slug: 'free-eternal' },
      trialEndsAt: new Date(Date.now() + 1e9),
    });
    expect(r).toEqual({ status: 'suspended', reason: 'abuso' });
  });

  it('suspended preserves null reason', () => {
    const r = deriveAccessStatus({ ...base, isSuspended: true });
    expect(r).toEqual({ status: 'suspended', reason: null });
  });

  it('returns ok for Free Perenne even if trial expired', () => {
    const r = deriveAccessStatus({
      ...base,
      plan: { isFreeEternal: true, slug: 'free-eternal' },
      trialEndsAt: new Date(Date.now() - 1e9),
    });
    expect(r).toEqual({ status: 'ok' });
  });

  it('returns ok for active Stripe subscription', () => {
    const r = deriveAccessStatus({ ...base, stripeSubscriptionStatus: 'active' });
    expect(r).toEqual({ status: 'ok' });
  });

  it('returns ok for trialing Stripe subscription', () => {
    const r = deriveAccessStatus({ ...base, stripeSubscriptionStatus: 'trialing' });
    expect(r).toEqual({ status: 'ok' });
  });

  it('returns trial_expired for past_due or canceled subscription past trial', () => {
    const r = deriveAccessStatus({
      ...base,
      stripeSubscriptionStatus: 'past_due',
      trialEndsAt: new Date(Date.now() - 1e6),
    });
    expect(r).toEqual({ status: 'trial_expired' });
  });

  it('returns trial with daysLeft rounded up for future trialEndsAt', () => {
    const now = new Date('2026-04-14T10:00:00Z');
    const trialEndsAt = new Date('2026-04-20T10:00:00Z'); // esattamente 6 giorni
    const r = deriveAccessStatus({ ...base, trialEndsAt }, now);
    expect(r).toEqual({ status: 'trial', trialEndsAt, daysLeft: 6 });
  });

  it('ceils fractional days upward', () => {
    const now = new Date('2026-04-14T10:00:00Z');
    const trialEndsAt = new Date('2026-04-15T11:00:00Z'); // 1 giorno e 1 ora
    const r = deriveAccessStatus({ ...base, trialEndsAt }, now);
    expect(r).toEqual({ status: 'trial', trialEndsAt, daysLeft: 2 });
  });

  it('returns trial_expired exactly at trialEndsAt', () => {
    const now = new Date('2026-04-14T10:00:00Z');
    const r = deriveAccessStatus({ ...base, trialEndsAt: now }, now);
    expect(r).toEqual({ status: 'trial_expired' });
  });

  it('returns trial_expired for past trialEndsAt', () => {
    const r = deriveAccessStatus({ ...base, trialEndsAt: new Date(Date.now() - 1e9) });
    expect(r).toEqual({ status: 'trial_expired' });
  });

  it('returns ok for paid plan assigned by Super Admin (no Stripe yet)', () => {
    const r = deriveAccessStatus({
      ...base,
      plan: { isFreeEternal: false, slug: 'basic' },
    });
    expect(r).toEqual({ status: 'ok' });
  });

  it('returns ok for pro plan assigned by Super Admin (no Stripe yet)', () => {
    const r = deriveAccessStatus({
      ...base,
      plan: { isFreeEternal: false, slug: 'pro' },
    });
    expect(r).toEqual({ status: 'ok' });
  });

  it('defensive: no plan, no trial, no subscription → trial_expired', () => {
    const r = deriveAccessStatus(base);
    expect(r).toEqual({ status: 'trial_expired' });
  });
});
