import type { Metadata, Viewport } from "next";

const BASE_URL = "https://flonextv.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  "FlonexTV — Free Legal Streaming, Courses & Comedy Shorts",
    template: "%s | FlonexTV",
  },
  description:
    "FlonexTV is a free global streaming platform. Watch Nollywood, Bollywood, Hollywood & Korean movies, take certified free courses, and enjoy comedy shorts from Nigeria's best creators. 100% legal, no subscription.",
  keywords: [
    "FlonexTV","flonex tv","free streaming platform","Nollywood movies free",
    "Nigerian movies YouTube","free online courses Nigeria","comedy shorts Nigeria",
    "Broda Shaggi","Mark Angel Comedy","Yoruba movies free","Christian movies Nigeria",
    "free certified courses","streaming learning platform","watch movies free Nigeria",
    "Bollywood movies free YouTube","Korean movies YouTube free",
  ],
  authors:   [{ name:"Emmanuel Ariyo", url:"https://github.com/Ememzyvisuals" }],
  creator:   "Emmanuel Ariyo — EMEMZYVISUALS",
  publisher: "FlonexTV",
  robots:    { index:true, follow:true, googleBot:{ index:true, follow:true, "max-image-preview":"large" } },
  alternates: { canonical: BASE_URL },
  openGraph: {
    type:        "website",
    url:          BASE_URL,
    title:       "FlonexTV — Free Legal Streaming, Courses & Comedy Shorts",
    description: "Watch Nollywood, Bollywood, Hollywood & Korean movies free. Take certified courses. Enjoy comedy shorts from Nigeria's best creators.",
    siteName:    "FlonexTV",
    images: [{
      url:`${BASE_URL}/og-image.svg`, width:1200, height:630,
      alt:"FlonexTV — Stream · Learn · Enjoy",
    }],
    locale: "en_US",
  },
  twitter: {
    card:        "summary_large_image",
    site:        "@ememzyvisuals",
    creator:     "@ememzyvisuals",
    title:       "FlonexTV — Free Legal Streaming & Learning Platform",
    description: "Free movies, certified courses, comedy shorts — all in one platform. 100% legal.",
    images:      [`${BASE_URL}/og-image.svg`],
  },
  icons: {
    icon:     [{ url:"/icon.svg", type:"image/svg+xml" }],
    apple:    "/icon.svg",
    shortcut: "/icon.svg",
  },
  manifest:    "/manifest.json",
  category:    "entertainment",
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor:   "#E50914",
  colorScheme:  "dark",
};

const structuredData = {
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"Organization","@id":`${BASE_URL}/#organization`,
      name:"FlonexTV", url:BASE_URL,
      logo:{"@type":"ImageObject",url:`${BASE_URL}/icon.svg`},
      sameAs:["https://github.com/Ememzyvisuals/FlonexTV","https://x.com/ememzyvisuals"],
      description:"Free global streaming and learning platform.",
    },
    {
      "@type":"WebSite","@id":`${BASE_URL}/#website`,
      url:BASE_URL, name:"FlonexTV",
      publisher:{"@id":`${BASE_URL}/#organization`},
      potentialAction:{
        "@type":"SearchAction",
        target:{"@type":"EntryPoint",urlTemplate:`${BASE_URL}/?q={search_term_string}`},
        "query-input":"required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <link rel="preconnect" href="https://api.themoviedb.org"/>
        <link rel="preconnect" href="https://image.tmdb.org"/>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js" async/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>
      </head>
      <body style={{margin:0,background:"#0F0F0F",fontFamily:"'Nunito',sans-serif"}}>
        {children}
      </body>
    </html>
  );
}
