import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // SAMEORIGIN (non DENY come da spec §13.5) perché il theme builder
  // usa un iframe same-origin per la preview live del menu.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS: Vercel serve già in HTTPS, rendiamo esplicito l'enforcement.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Prisma deve essere trattato come pacchetto esterno (non bundle-ato) per
  // garantire che i binari del query engine siano disponibili al runtime
  // delle serverless function.
  serverExternalPackages: ["@prisma/client"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
