import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Sitemap dinamica: include solo ristoranti pubblicati, attivi e non
// sospesi (stessi filtri di getPublicRestaurant). I ristoranti in
// bozza (isPublished=false) o sospesi non devono apparire nei motori
// di ricerca. Spec §14.3.
//
// Revalidation: daily. I nuovi ristoranti non hanno urgenza SEO
// immediata e la daily copre il changefreq che dichiariamo.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://aifolly-menu.vercel.app";

  const restaurants = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      isPublished: true,
      isSuspended: false,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  for (const r of restaurants) {
    // Cover page (higher priority: è la landing page del ristorante)
    entries.push({
      url: `${baseUrl}/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    });
    // Menu page
    entries.push({
      url: `${baseUrl}/${r.slug}/menu`,
      lastModified: r.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return entries;
}
