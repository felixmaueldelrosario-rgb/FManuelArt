"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "./Logo";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./Loader.module.css";

const TOTAL_FRAMES = 144;
const COUNT_DURATION = 1.1;
const WIPE_DURATION = 0.85;

export const INTRO_DONE_EVENT = "fma:intro-done";
// Readable synchronously by anything that mounts after this module has
// already decided the intro is over (e.g. a fresh client-side navigation
// within the same session) — the event alone can't cover that case since
// there's nothing left to dispatch it.
export let introResolved = false;

export default function Loader() {
  const [phase, setPhase] = useState<"counting" | "wiping" | "gone">("counting");
  const frameRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const seen = sessionStorage.getItem("fma-intro-seen");
    const reduced = prefersReducedMotion();
    sessionStorage.setItem("fma-intro-seen", "1");

    if (seen || reduced) {
      introResolved = true;
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      setPhase("gone");
      return;
    }

    const counter = { frame: 1 };
    gsap.timeline({ onComplete: () => setPhase("wiping") }).to(counter, {
      frame: TOTAL_FRAMES,
      duration: COUNT_DURATION,
      ease: "power1.inOut",
      onUpdate: () => {
        const n = Math.round(counter.frame);
        if (frameRef.current) frameRef.current.textContent = String(n).padStart(3, "0");
        if (barRef.current) barRef.current.style.width = `${(n / TOTAL_FRAMES) * 100}%`;
      },
    });
  }, []);

  useLayoutEffect(() => {
    if (phase !== "wiping" || !overlayRef.current) return;
    gsap.to(overlayRef.current, {
      clipPath: "circle(0% at 50% 50%)",
      duration: WIPE_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        introResolved = true;
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
        setPhase("gone");
      },
    });
  }, [phase]);

  useLayoutEffect(() => {
    document.body.style.overflow = phase === "gone" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className={styles.overlay} role="status" aria-label="Cargando" ref={overlayRef}>
      <div className={styles.center}>
        <Logo size={44} />
        <span className={styles.mono}>
          Cargando fotograma <span ref={frameRef}>001</span>/{TOTAL_FRAMES}
        </span>
        <div className={styles.track}>
          <div className={styles.bar} ref={barRef} />
        </div>
      </div>
    </div>
  );
}
