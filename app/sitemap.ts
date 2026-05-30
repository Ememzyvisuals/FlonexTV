import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://flonextv.vercel.app";
  const now  = new Date();
  return [
    { url: base,                     lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/#movies`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/#shorts`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/#courses`,       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/#library`,       lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/#profile`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
