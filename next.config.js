/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      { protocol:"https", hostname:"image.tmdb.org" },
      { protocol:"https", hostname:"archive.org" },
      { protocol:"https", hostname:"*.supabase.co" },
      { protocol:"https", hostname:"img.youtube.com" },
      { protocol:"https", hostname:"i.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source:"/(.*)",
        headers:[
          {
            key:"Content-Security-Policy",
            value:[
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://apis.google.com https://www.googletagmanager.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://archive.org",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https: blob:",
              "connect-src 'self' https: wss:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "worker-src blob: 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
