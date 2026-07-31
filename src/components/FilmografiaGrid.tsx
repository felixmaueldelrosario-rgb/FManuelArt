"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PROJECTS, DEPT_LABELS, type Dept } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import ProjectCard from "./ProjectCard";
import styles from "./FilmografiaGrid.module.css";

const FILTERS: Array<{ key: Dept | "all"; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "branding", label: DEPT_LABELS.branding },
  { key: "ilustracion", label: DEPT_LABELS.ilustracion },
  { key: "motion", label: DEPT_LABELS.motion },
  { key: "publicidad", label: DEPT_LABELS.publicidad },
];

export default function FilmografiaGrid() {
  const [active, setActive] = useState<Dept | "all">("all");
  const visible = active === "all" ? PROJECTS : PROJECTS.filter((p) => p.dept === active);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const cards = el.querySelectorAll("article");
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, [active]);

  return (
    <div>
      <div className={styles.filters} role="group" aria-label="Filtrar por departamento">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={styles.filterBtn}
            data-dept={f.key === "all" ? undefined : f.key}
            data-active={active === f.key}
            onClick={() => setActive(f.key)}
          >
            {f.key !== "all" && <span className={styles.dot} />}
            {f.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid} ref={gridRef}>
          {visible.map((p) => (
            <ProjectCard project={p} key={p.slug} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Todavía no hay proyectos en este departamento.</p>
      )}
    </div>
  );
}
