import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/app/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  // Transactional areas no crawler should index.
  const disallow = ["/api/", "/cart", "/checkout", "/order-status"];

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
