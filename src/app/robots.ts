import type { MetadataRoute } from "next";

// Spec §14.5.
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://aifolly-menu.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          // /preview/ e /super/ arriveranno nelle fasi successive.
          "/preview/",
          "/super/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
