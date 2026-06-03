import type { Metadata, Viewport } from "next";

/* ================================================================
   FlonexTV — Full Production SEO Layout
   OG image: /og-image.jpg (1500×600 banner)
   Canonical: https://flonextv.vercel.app
   Structured data: Organization + WebSite + SearchAction
   ================================================================ */

const BASE = "https://flonextv.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),

  /* ── Core ── */
  title: {
    default:  "FlonexTV — Free Streaming, Courses & Comedy Shorts | Nigeria",
    template: "%s | FlonexTV",
  },
  description:
    "FlonexTV is Nigeria's free legal streaming and learning platform. Watch Nollywood, Bollywood, Hollywood & Korean movies, enjoy ad-free comedy shorts from Mark Angel, Broda Shaggi & Taaooma, and earn verifiable AI-certified courses — 100% free, no subscription.",

  keywords: [
    "FlonexTV", "flonex tv", "flonextv streaming", "free streaming Nigeria",
    "Nollywood movies free", "Nigerian movies online free", "watch Nollywood free",
    "free online courses Nigeria", "free certified courses Nigeria",
    "Nigerian comedy shorts", "comedy shorts Nigeria", "Mark Angel comedy",
    "Broda Shaggi videos", "Taaooma videos", "WoliAgba shorts",
    "Yoruba movies free", "Christian movies Nigeria", "Mount Zion films free",
    "Bollywood movies free YouTube", "Korean movies free online",
    "Hollywood movies free legal", "free AI certificate course",
    "learn web development Nigeria free", "free streaming platform Africa",
    "Nigerian streaming app", "Nollywood streaming", "African movies free",
    "free education Nigeria", "AI exam certificate", "EMEMZYVISUALS",
  ],

  authors:   [{ name: "Emmanuel Ariyo", url: "https://github.com/Ememzyvisuals" }],
  creator:   "Emmanuel Ariyo — EMEMZYVISUALS DIGITALS",
  publisher: "FlonexTV",
  generator: "Next.js",
  referrer:  "origin-when-cross-origin",

  /* ── Canonical + alternates ── */
  alternates: {
    canonical: BASE,
    languages: {
      "en-NG": BASE,
      "en-GB": BASE,
      "en-US": BASE,
    },
  },

  /* ── Robots ── */
  robots: {
    index:               true,
    follow:              true,
    nocache:             false,
    googleBot: {
      index:             true,
      follow:            true,
      noimageindex:      false,
      "max-image-preview":  "large",
      "max-snippet":        -1,
      "max-video-preview":  -1,
    },
  },

  /* ── Open Graph ── */
  openGraph: {
    type:        "website",
    url:          BASE,
    siteName:    "FlonexTV",
    title:       "FlonexTV — Free Streaming, Courses & Comedy Shorts | Nigeria",
    description: "Watch Nollywood, Bollywood & Korean movies free. Comedy shorts with zero ads. Free AI-certified courses. 100% legal. No subscription.",
    locale:      "en_NG",
    alternateLocale: ["en_US", "en_GB"],
    images: [
      {
        url:    `${BASE}/og-image.jpg`,
        width:  1500,
        height: 600,
        alt:    "FlonexTV — Stream · Learn · Enjoy | Nigeria's Free Streaming Platform",
        type:   "image/jpeg",
      },
    ],
  },

  /* ── Twitter / X ── */
  twitter: {
    card:        "summary_large_image",
    site:        "@ememzyvisuals",
    creator:     "@ememzyvisuals",
    title:       "FlonexTV — Free Streaming & Learning Platform | Nigeria",
    description: "Nollywood, Bollywood, Korean films. Ad-free comedy shorts. Free AI-certified courses. 100% legal, no subscription.",
    images:      [`${BASE}/og-image.jpg`],
  },

  /* ── Icons / PWA ── */
  icons: {
    icon:     [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple:    [{ url: "/icon.svg", sizes: "any" }],
    shortcut:  "/icon.svg",
  },
  manifest: "/manifest.json",

  /* ── Category ── */
  category:       "Entertainment & Education",
  classification: "Free Streaming and Learning Platform",

  /* ── Verification (add after Search Console setup) ── */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
    // yandex: "your-yandex-token",
    // bing:   "your-bing-token",
  },

  /* ── App metadata ── */
  appleWebApp: {
    capable:        true,
    title:          "FlonexTV",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },

  /* ── Other ── */
  other: {
    "theme-color":           "#E50914",
    "msapplication-TileColor": "#E50914",
    "rating":                "general",
    "revisit-after":         "3 days",
    "language":              "English",
    "geo.region":            "NG",
    "geo.country":           "Nigeria",
  },
};

export const viewport: Viewport = {
  width:              "device-width",
  initialScale:       1,
  maximumScale:       5,
  themeColor:         [
    { media: "(prefers-color-scheme: dark)",  color: "#E50914" },
    { media: "(prefers-color-scheme: light)", color: "#E50914" },
  ],
  colorScheme: "dark",
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type":  "Organization",
      "@id":    `${BASE}/#organization`,
      name:     "FlonexTV",
      url:       BASE,
      logo: {
        "@type":       "ImageObject",
        "@id":         `${BASE}/#logo`,
        url:           `${BASE}/icon.svg`,
        width:         512,
        height:        512,
        caption:       "FlonexTV Logo",
      },
      image:        { "@id": `${BASE}/#logo` },
      description:  "Nigeria's free legal streaming and learning platform. Nollywood, Bollywood, Hollywood & Korean movies. Ad-free comedy shorts. Free AI-certified courses.",
      sameAs: [
        "https://github.com/Ememzyvisuals/flonextv",
        "https://twitter.com/ememzyvisuals",
        "https://x.com/ememzyvisuals",
      ],
      foundingDate:  "2026",
      founder: {
        "@type": "Person",
        name:    "Emmanuel Ariyo",
        url:     "https://github.com/Ememzyvisuals",
      },
      areaServed:    "Nigeria",
      knowsAbout:    ["Streaming", "E-Learning", "Nollywood", "Nigerian Content"],
    },
    {
      "@type":    "WebSite",
      "@id":      `${BASE}/#website`,
      url:         BASE,
      name:        "FlonexTV",
      description: "Free streaming and learning platform for Nigeria and Africa",
      publisher:   { "@id": `${BASE}/#organization` },
      inLanguage:  ["en-NG", "yo", "ha", "ig", "fr", "hi", "ko", "ja"],
      potentialAction: [
        {
          "@type":       "SearchAction",
          target: {
            "@type":     "EntryPoint",
            urlTemplate: `${BASE}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type":     "WebPage",
      "@id":       `${BASE}/#webpage`,
      url:          BASE,
      name:         "FlonexTV — Free Streaming, Courses & Comedy Shorts",
      description:  "Watch free movies, comedy shorts, and earn AI-certified course certificates on FlonexTV.",
      isPartOf:    { "@id": `${BASE}/#website` },
      about:       { "@id": `${BASE}/#organization` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url:     `${BASE}/og-image.jpg`,
        width:   1500,
        height:  600,
      },
      breadcrumb: {
        "@type":           "BreadcrumbList",
        itemListElement:   [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        ],
      },
    },
    {
      "@type":           "VideoObject",
      "@id":             `${BASE}/#platformvideo`,
      name:              "FlonexTV — Nigeria's Free Streaming & Learning Platform",
      description:       "Watch Nollywood, Bollywood, Hollywood and Korean movies free. Enjoy ad-free Nigerian comedy shorts. Earn AI-certified course certificates. 100% legal, no subscription.",
      thumbnailUrl:      `${BASE}/og-image.jpg`,
      uploadDate:        "2026-04-01T00:00:00+01:00",
      contentUrl:        `${BASE}/og-image.jpg`,
      embedUrl:          `${BASE}`,
      duration:          "PT1M",
      inLanguage:        "en-NG",
      isFamilyFriendly:  true,
      publisher:         { "@id": `${BASE}/#organization` },
      author:            { "@id": `${BASE}/#organization` },
      potentialAction: {
        "@type":  "WatchAction",
        target:   `${BASE}`,
      },
    },
    {
      "@type":   "ItemList",
      name:      "FlonexTV Features",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Free Nollywood & Bollywood Movies", url: BASE },
        { "@type": "ListItem", position: 2, name: "Ad-Free Nigerian Comedy Shorts",    url: BASE },
        { "@type": "ListItem", position: 3, name: "Free AI-Certified Courses",         url: BASE },
        { "@type": "ListItem", position: 4, name: "Verifiable Digital Certificates",   url: BASE },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" dir="ltr">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link rel="preconnect" href="https://api.themoviedb.org"/>
        <link rel="preconnect" href="https://image.tmdb.org"/>
        <link rel="preconnect" href="https://www.youtube-nocookie.com"/>

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* HLS.js for Archive.org streams */}
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js" async/>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ margin: 0, background: "#0F0F0F", fontFamily: "'Nunito', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
