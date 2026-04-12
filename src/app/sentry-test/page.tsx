"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Sentry Test</h1>
      <button
        onClick={() => {
          Sentry.captureException(new Error("Smoke test aifolly-menu — client side"));
        }}
        style={{
          padding: "12px 24px",
          fontSize: 14,
          cursor: "pointer",
          marginRight: 12,
        }}
      >
        Invia errore client
      </button>
      <button
        onClick={async () => {
          await fetch("/api/sentry-test");
        }}
        style={{
          padding: "12px 24px",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Invia errore server
      </button>
    </div>
  );
}
