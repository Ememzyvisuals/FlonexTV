import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*",     allow: "/",      disallow: ["/api/", "/_next/"] },
      { userAgent: "GPTBot", disallow: "/"  },
    ],
    sitemap: "https://flonextv.vercel.app/sitemap.xml",
    host:    "https://flonextv.vercel.app",
  };
}
