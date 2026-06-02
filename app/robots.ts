import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/api/", "/_next/", "/api/auth/test-email"],
      },
      {
        userAgent: "GPTBot",
        disallow:  "/",
      },
      {
        userAgent: "CCBot",
        disallow:  "/",
      },
    ],
    sitemap: "https://flonextv.vercel.app/sitemap.xml",
    host:    "https://flonextv.vercel.app",
  };
}
