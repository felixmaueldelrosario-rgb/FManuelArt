"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const nibRef = useRef<SVGSVGElement>(null);
  const recRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = prefersReducedMotion();
    if (fine && !reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const nib = nibRef.current;
    const rec = recRef.current;
    if (!nib || !rec) return;

    const nibX = gsap.quickTo(nib, "x", { duration: 0.12, ease: "power3.out" });
    const nibY = gsap.quickTo(nib, "y", { duration: 0.12, ease: "power3.out" });
    const recX = gsap.quickTo(rec, "x", { duration: 0.2, ease: "power3.out" });
    const recY = gsap.quickTo(rec, "y", { duration: 0.2, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      nibX(e.clientX);
      nibY(e.clientY);
      recX(e.clientX);
      recY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const recTarget = target.closest('[data-cursor="rec"]');
      const interactive = target.closest("a, button");

      if (recTarget) {
        gsap.to(nib, { scale: 0.6, opacity: 0, duration: 0.25 });
        gsap.to(rec, { opacity: 1, duration: 0.25 });
      } else if (interactive) {
        gsap.to(nib, { scale: 0.85, opacity: 1, duration: 0.25 });
        gsap.to(rec, { opacity: 0, duration: 0.2 });
      } else {
        gsap.to(nib, { scale: 1, opacity: 1, duration: 0.25 });
        gsap.to(rec, { opacity: 0, duration: 0.2 });
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Dip-pen nib: the tip at (4,4) is the actual pointer hotspot —
          .nib's -4px margin in the CSS aligns it to the tracked x/y. */}
      <svg
        ref={nibRef}
        className={styles.nib}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon className={styles.body} points="4,4 18.5,11.5 26,26 11.5,18.5" />
        <line x1="8" y1="8" x2="20" y2="20" />
        <circle cx="17" cy="17" r="1.6" />
      </svg>
      <div className={styles.rec} ref={recRef} aria-hidden="true">
        REC
      </div>
    </>
  );
}
