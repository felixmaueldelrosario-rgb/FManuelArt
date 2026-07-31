import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import { SITE_URL } from "@/data/site";
import "./globals.css";

const TITLE = "FManuel Art — Diseño, Ilustración, Motion y Branding";
const DESCRIPTION =
  "Portfolio de FManuel Art: dirección creativa, branding e identidad, ilustración, motion graphics y publicidad.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — FManuel Art" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "FManuel Art",
    locale: "es",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "FManuel Art",
  url: SITE_URL,
  jobTitle: "Diseñador gráfico, ilustrador y motion designer",
  knowsAbout: ["Branding", "Ilustración", "Motion graphics", "Publicidad"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <a href="#main-content" className="skipLink">
          Saltar al contenido
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Loader />
        <CustomCursor />
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "var(--letterbox)",
            background: "var(--stage)",
            zIndex: 60,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "var(--letterbox)",
            background: "var(--stage)",
            zIndex: 60,
          }}
        />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
