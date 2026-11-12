import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: CSP_DIRECTIVES,
  },
];

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Keep the product screenshots clean; compile/runtime errors still surface.
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Production security/cache headers for static hosting live in firebase.json;
  // apply Next.js headers() only during local `next dev` so `output: "export"` emits no warnings.
  ...(isDev
    ? {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: SECURITY_HEADERS,
            },
            {
              source: "/sw.js",
              headers: [
                {
                  key: "Cache-Control",
                  value: "no-cache, no-store, must-revalidate",
                },
              ],
            },
            {
              source: "/manifest.webmanifest",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=0, must-revalidate",
                },
              ],
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
