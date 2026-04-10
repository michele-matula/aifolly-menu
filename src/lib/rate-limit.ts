// In-memory sliding window rate limiter.
//
// Limitazioni note:
// - Su Vercel lo stato vive nella singola Lambda instance, quindi un client
//   distribuito su più instance può superare il limite globale. È una
//   mitigation, non enforcement forte. Per enforcement reale serve uno
//   store condiviso (Upstash Redis), pianificato come step futuro.
// - In dev locale (singolo processo) il limite è esatto.

type Timestamps = number[];

const buckets = new Map<string, Timestamps>();

// Cleanup periodico per evitare crescita illimitata in dev/long-running processes.
// Su Vercel le Lambda muoiono rapidamente, ma il cleanup è innocuo.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_WINDOW_MS = 60 * 1000;

let cleanupStarted = false;
function ensureCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  setInterval(() => {
    const cutoff = Date.now() - MAX_WINDOW_MS;
    for (const [key, timestamps] of buckets.entries()) {
      const last = timestamps[timestamps.length - 1];
      if (last === undefined || last < cutoff) {
        buckets.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const cutoff = now - windowMs;

  const existing = buckets.get(key) ?? [];
  const recent = existing.filter(t => t > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0];
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, oldest + windowMs - now),
    };
  }

  recent.push(now);
  buckets.set(key, recent);

  return {
    allowed: true,
    remaining: limit - recent.length,
    resetInMs: windowMs,
  };
}

// Estrae l'IP del client da una Request. Vercel setta x-forwarded-for
// con la lista degli IP del path; il primo è il client originale.
// Se nessun header è disponibile, restituisce "unknown" — tutti gli
// "unknown" condividono lo stesso budget (fail-safe).
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
