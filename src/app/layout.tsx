import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import NProgressProvider from "@/components/NProgressProvider";
import NProgressHandler from "@/components/NProgressHandler";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { Analytics } from "@vercel/analytics/next";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  metadataBase: new URL("https://ktcomputersupply.vercel.rw"),
  title: {
    default: "KT Computer Supply - Premium Electronics in Rwanda",
    template: "%s | KT Computer Supply",
  },
  description: "KT Computer Supply - Your trusted source for premium electronics, computers, and tech solutions in Rwanda. Best prices, fast delivery, expert support.",
  keywords: [
    "computer supply rwanda", "electronics store kigali", "laptop sales rwanda", "computer accessories rwanda",
    "tech solutions rwanda", "IT equipment kigali", "computer parts rwanda", "electronics retailer rwanda",
    "computer store kigali", "tech shop rwanda", "mobile money payments rwanda", "paypack payments",
    "apple products rwanda", "dell laptops rwanda", "hp printers rwanda", "samsung monitors rwanda",
    "gaming laptops rwanda", "office computers rwanda", "networking equipment rwanda", "audio systems rwanda"
  ],
  authors: { name: "KT Computer Supply" },
  creator: "KT Computer Supply",
  publisher: "KT Computer Supply",
  category: "Electronics & Technology",
  classification: "Business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["sw_KE", "fr_FR"],
    url: "/",
    title: "KT Computer Supply - Premium Electronics in Rwanda",
    description: "Your trusted source for premium electronics, computers, and tech solutions in Rwanda. Best prices, fast delivery, expert support.",
    siteName: "KT Computer Supply",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "KT Computer Supply - Premium Electronics & Computer Solutions in Rwanda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KT Computer Supply - Premium Electronics in Rwanda",
    description: "Your trusted source for premium electronics, computers, and tech solutions in Rwanda with mobile money payments",
    images: ["/logo.png"],
    creator: "@ktcomputer",
    site: "@ktcomputer",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  alternates: {
    canonical: "https://ktcomputersupply.vercel.rw",
    languages: {
      "en": "https://ktcomputersupply.vercel.rw",
      "en-US": "https://ktcomputersupply.vercel.rw",
      "sw": "https://ktcomputersupply.vercel.rw/sw",
      "sw-KE": "https://ktcomputersupply.vercel.rw/sw",
      "fr": "https://ktcomputersupply.vercel.rw/fr",
      "fr-RW": "https://ktcomputersupply.vercel.rw/fr",
    },
  },
  other: {
    "geo.region": "RW",
    "geo.placename": "Kigali",
    "geo.position": "-1.9441;30.0619",
    "ICBM": "-1.9441, 30.0619",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" itemScope itemType="https://schema.org/WebSite">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://payments.paypack.rw" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Hreflang tags for multi-language support */}
        <link rel="alternate" hrefLang="en" href="https://e3eb07949260.ngrok-free.app" />
        <link rel="alternate" hrefLang="en-US" href="https://e3eb07949260.ngrok-free.app" />
        <link rel="alternate" hrefLang="sw" href="https://ktcomputersupply.vercel.rw/sw" />
        <link rel="alternate" hrefLang="sw-KE" href="https://ktcomputersupply.vercel.rw/sw" />
        <link rel="alternate" hrefLang="fr" href="https://ktcomputersupply.vercel.rw/fr" />
        <link rel="alternate" hrefLang="fr-RW" href="https://ktcomputersupply.vercel.rw/fr" />
        <link rel="alternate" hrefLang="x-default" href="https://ktcomputersupply.vercel.rw" />
      </head>
      <body
        className={`${roboto.variable} font-sans antialiased`}
      >
        <CartProvider>
          <FilterProvider>
            <Suspense fallback={null}>
              <NProgressProvider />
            </Suspense>
            <NProgressHandler />
            {children}
            <Toaster richColors />
          </FilterProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
