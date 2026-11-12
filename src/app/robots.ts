import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site";

export const dynamic = "force-static";

const BASE_URL = SITE_CONFIG.url.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog", "/privacy", "/terms"],
      disallow: ["/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
