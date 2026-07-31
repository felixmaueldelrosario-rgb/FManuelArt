"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = prefersReducedMotion();
    if (!fine || reduced) return;

    setEnabled(true);

    const ring = ringRef.current;
    const dot = dotRef.current;
    const rec = recRef.current;
    if (!ring || !dot || !rec) return;

    const ringX = gsap.quickTo(ring, "x", { duration: 0.12, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.12, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const recX = gsap.quickTo(rec, "x", { duration: 0.2, ease: "power3.out" });
    const recY = gsap.quickTo(rec, "y", { duration: 0.2, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
      recX(e.clientX);
      recY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const recTarget = target.closest('[data-cursor="rec"]');
      const interactive = target.closest("a, button");

      if (recTarget) {
        gsap.to(ring, { scale: 2.4, opacity: 0, duration: 0.3 });
        gsap.to(dot, { opacity: 0, duration: 0.2 });
        gsap.to(rec, { opacity: 1, duration: 0.25 });
      } else if (interactive) {
        gsap.to(ring, { scale: 0.5, opacity: 1, duration: 0.3 });
        gsap.to(dot, { opacity: 0, duration: 0.2 });
        gsap.to(rec, { opacity: 0, duration: 0.2 });
      } else {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
        gsap.to(dot, { opacity: 1, duration: 0.2 });
        gsap.to(rec, { opacity: 0, duration: 0.2 });
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className={styles.ring} ref={ringRef} aria-hidden="true" />
      <div className={styles.dot} ref={dotRef} aria-hidden="true" />
      <div className={styles.rec} ref={recRef} aria-hidden="true">
        REC
      </div>
    </>
  );
}
