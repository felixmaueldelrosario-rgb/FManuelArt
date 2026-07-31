import type { Metadata } from "next";
import FilmografiaGrid from "@/components/FilmografiaGrid";

export const metadata: Metadata = {
  title: "Filmografía — FManuel Art",
  description: "Proyectos de branding, ilustración, motion graphics y publicidad de FManuel Art.",
};

export default function FilmografiaPage() {
  return (
    <section style={{ padding: "clamp(3rem, 6vw, 5rem) var(--edge)" }}>
      <div className="eyebrow">
        <span className="num">ESC. 02</span>
        <span>Filmografía completa</span>
      </div>
      <h1 style={{ fontSize: "clamp(1.9rem, 1.1rem + 3vw, 3.1rem)" }}>Todo el trabajo, sin recortar.</h1>
      <p style={{ color: "var(--text-dim)", marginTop: "0.8rem", maxWidth: "60ch" }}>
        Branding, ilustración, motion y publicidad — filtrá por departamento o mirá todo en
        orden de producción.
      </p>
      <FilmografiaGrid />
    </section>
  );
}
