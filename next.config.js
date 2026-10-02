/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Level data + engine scripts for every game. These are hand-edited and
        // shipped as plain static files, so a browser can easily hold a stale
        // copy and silently run old level content. max-age=0 with
        // must-revalidate lets the browser store the file (cheap revalidation
        // via ETag returns a 304) but forbids reusing it without asking.
        source: "/games/:slug/levels.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/games/:slug/game.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/maaz962/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media2.dev.to",
      },
      {
        protocol: "https",
        hostname: "dev-to-uploads.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  webpack: (config) => {
    // Next.js unconditionally bundles a legacy polyfill chunk (trimStart,
    // Array.at, Object.hasOwn, ...) into the App Router runtime regardless
    // of browserslist targets. Our browserslist targets (see package.json)
    // all ship these features natively, so drop the module entirely.
    config.resolve.alias["../build/polyfills/polyfill-module"] = false;
    return config;
  },
};

module.exports = nextConfig;
