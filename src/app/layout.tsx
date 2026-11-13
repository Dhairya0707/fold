import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { SITE_CONFIG } from "@/lib/site";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE_CONFIG.themeColors.paper },
    { media: "(prefers-color-scheme: dark)", color: SITE_CONFIG.themeColors.ink },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "Fold: Private local-first notes app without the noise",
    template: "%s | Fold",
  },
  description: SITE_CONFIG.description,
  applicationName: "Fold",
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.x }],
  creator: SITE_CONFIG.author.name,
  publisher: "Fold",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: "Fold",
    title: "Fold: Private local-first notes app without the noise",
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fold: Private local-first notes app without the noise",
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.author.handle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="paper"
      data-scroll-behavior="smooth"
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem("fold.theme.v1");
                const prefersInk = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const theme = stored === "ink" || stored === "paper" ? stored : (prefersInk ? "ink" : "paper");
                document.documentElement.dataset.theme = theme;
              } catch (e) {}

              if ("serviceWorker" in navigator) {
                // Never register service worker on localhost to prevent infinite reload loops and stale dev cache
                if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const reg of registrations) {
                      reg.unregister();
                    }
                  });
                  if ("caches" in window) {
                    caches.keys().then((names) => {
                      for (const name of names) caches.delete(name);
                    });
                  }
                } else {
                  window.addEventListener("load", () => {
                    navigator.serviceWorker.register("/sw.js").catch(() => {});
                  });
                }
              }
            })();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
