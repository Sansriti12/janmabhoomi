import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.janmabhoomi.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en", "/gu", "/en/*", "/gu/*"],
        disallow: ["/api/*", "/_next/*", "/private/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
