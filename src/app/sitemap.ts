import type { MetadataRoute } from "next";
import { games } from "@/data/games";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "maaz-arif-portfolio.vercel.app"
).replace(/^\/+|\/+$/g, "");

const normalizedSiteUrl = siteUrl.startsWith("http")
  ? siteUrl
  : `https://${siteUrl}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${normalizedSiteUrl}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${normalizedSiteUrl}/games`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...games.map((game) => ({
      url: `${normalizedSiteUrl}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}