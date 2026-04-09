import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma con output custom in src/generated/prisma:
  // - serverExternalPackages dice a Next.js di non bundle-are @prisma/client
  // - outputFileTracingIncludes forza l'inclusione dei file generati (incluso
  //   il binario libquery_engine-rhel-openssl-3.0.x.so.node) nel bundle delle
  //   server functions, altrimenti Turbopack non li traccia.
  // Vedi: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;