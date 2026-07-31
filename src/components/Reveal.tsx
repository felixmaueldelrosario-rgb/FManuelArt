"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Reveal({
  children,
  className,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          // Replays on every re-entry (scrolling back up and down again)
          // instead of firing once — the site invites exploring back and
          // forth through Filmografía/Departamentos, and a static reveal
          // only on first pass reads as "used up" on a second look.
          toggleActions: "restart none restart none",
        },
      });
    });

    return () => ctx.revert();
  }, [y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
