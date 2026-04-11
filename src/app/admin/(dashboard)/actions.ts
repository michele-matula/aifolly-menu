'use server';

import { signOut } from '@/lib/auth';

// Server Action for logging out from the admin dashboard. Invoked by
// the Sidebar form as `<form action={signOutAction}>`.
//
// Why a Server Action instead of the stock `<form action="/api/auth/signout">`:
// NextAuth v5 enforces OWASP double-submit-cookie CSRF on the /signout
// HTTP route, and a plain HTML form has no csrfToken field to send —
// the POST is rejected with `MissingCSRF`, the user is redirected to
// the login page with `?error=MissingCSRF`, and crucially the session
// cookie is NOT cleared (the validateCSRF throw happens before
// actions.signOut runs). The logout button is decorative in that state.
//
// A Server Action bypasses the HTTP surface entirely: it invokes the
// server-side signOut() from the NextAuth instance directly, which
// clears the session cookie and triggers the redirect. CSRF is still
// protected — Next.js Server Actions have framework-level CSRF built
// in via signed action IDs and Origin/Host header checks.
export async function signOutAction() {
  await signOut({ redirectTo: '/admin/login' });
}
