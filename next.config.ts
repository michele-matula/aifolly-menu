import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma deve essere trattato come pacchetto esterno (non bundle-ato) per
  // garantire che i binari del query engine siano disponibili al runtime
  // delle serverless function.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;