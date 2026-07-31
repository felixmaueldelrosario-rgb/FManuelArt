import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "FManuel Art — Diseño, Ilustración, Motion y Branding",
  description:
    "Portfolio de FManuel Art: dirección creativa, branding e identidad, ilustración, motion graphics y publicidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
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
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
