import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope, Montserrat, Syncopate } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Intro } from "@/components/layout/Intro";
import { MotionLayer } from "@/components/layout/MotionLayer";
import { introSkipScript } from "@/lib/experience";
import { SoundToggle } from "@/components/layout/SoundToggle";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

/* Type system (cinematic gold-space theme)
   Cormorant Garamond – headlines · Syncopate – wide titling/labels
   Manrope – body · IBM Plex Mono – data · Montserrat – logo wordmark only */
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400", "700", "800"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});
const syncopate = Syncopate({ variable: "--font-syncopate", subsets: ["latin"], weight: ["400", "700"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cosmoscannabis.in"),
  title: {
    default: "Cosmos Cannabis Cure — lab-tested sativa leaf gummies",
    template: "%s · Cosmos",
  },
  description:
    "Premium, lab-tested cannabis sativa leaf gummies for rest, balance and focus. Precisely dosed, made in India under licence. Soft launch December 2026.",
  openGraph: { siteName: "Cosmos Cannabis Cure", locale: "en_IN", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#07080f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${montserrat.variable} ${cormorant.variable} ${syncopate.variable} ${manrope.variable} ${plexMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Script id="intro-skip" strategy="beforeInteractive">
          {introSkipScript}
        </Script>
        <noscript>
          <style>{".hero-anim,[data-chrome]{opacity:1!important}.intro-root{display:none!important}"}</style>
        </noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-flare focus:px-4 focus:py-2 focus:text-space">
          Skip to content
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <div data-chrome className="fixed bottom-5 left-5 z-30 hidden sm:block">
          <SoundToggle />
        </div>
        <Intro />
        <Suspense fallback={null}>
          <MotionLayer />
        </Suspense>
        <SmoothScroll />
      </body>
    </html>
  );
}
