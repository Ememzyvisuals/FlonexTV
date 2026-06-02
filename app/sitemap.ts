import { MetadataRoute } from "next";

const BASE = "https://flonextv.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url:            BASE,
      lastModified:   now,
      changeFrequency:"daily",
      priority:       1.0,
    },
    {
      url:            `${BASE}/#movies`,
      lastModified:   now,
      changeFrequency:"daily",
      priority:       0.9,
    },
    {
      url:            `${BASE}/#shorts`,
      lastModified:   now,
      changeFrequency:"daily",
      priority:       0.9,
    },
    {
      url:            `${BASE}/#courses`,
      lastModified:   now,
      changeFrequency:"weekly",
      priority:       0.85,
    },
    {
      url:            `${BASE}/#library`,
      lastModified:   now,
      changeFrequency:"weekly",
      priority:       0.7,
    },
    {
      url:            `${BASE}/#profile`,
      lastModified:   now,
      changeFrequency:"monthly",
      priority:       0.6,
    },
  ];
}
