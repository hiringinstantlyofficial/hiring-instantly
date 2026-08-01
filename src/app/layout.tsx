import type { Metadata, Viewport } from "next";
import { Epilogue } from "next/font/google";

import { absoluteUrl, siteConfig } from "@/lib/site";

import "./globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-epilogue",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: absoluteUrl("/"),
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    // No `site:` handle — the card still renders large-image previews without
    // one, and pointing it at an account that doesn't exist yet is worse than
    // omitting it. Add it back alongside a real profile.
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  other: {
    "google-adsense-account": "ca-pub-5256112741449349",
  },
};

export const viewport: Viewport = {
  themeColor: "#4640de",
  width: "device-width",
  initialScale: 1,
};

/**
 * Document shell only — fonts, metadata and the body element.
 *
 * The public header and footer belong to `(public)/layout.tsx`, so the admin
 * dashboard renders chrome-free. Anything added here appears on /admin too.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={epilogue.variable}>
      {/*
        suppressHydrationWarning covers attributes that browser extensions
        (Grammarly, ColorZilla, password managers) inject into <body> before
        React hydrates. It applies to this element only, not its descendants,
        so a genuine mismatch anywhere inside the app is still reported.
      */}
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-surface"
      >
        {children}

        {/*
          Google AdSense.

          Deliberately a plain <script>, not next/script. Every next/script
          strategy other than beforeInteractive emits only a <link rel=preload>
          into the server-rendered HTML and injects the real tag after
          hydration — invisible to AdSense's verification crawler, which reads
          the raw response and does not run the client bundle. React 19 hoists
          this async script into <head> during SSR, so it lands in the initial
          payload where the crawler can see it.
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5256112741449349"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
