import * as Sentry from "@sentry/nextjs";

export function GET() {
  Sentry.captureException(new Error("Smoke test aifolly-menu — server side"));
  return Response.json({ ok: true });
}
