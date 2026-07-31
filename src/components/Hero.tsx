"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import Logo from "./Logo";
import { INTRO_TOTAL_SECONDS } from "./Loader";
import styles from "./Hero.module.css";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Hero() {
  const markRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !supportsWebGL()) return;

    const mq = window.matchMedia("(min-width: 861px)");
    const sync = () => setShow3D(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const freshSession = !sessionStorage.getItem("fma-intro-seen");
    const delay = freshSession ? INTRO_TOTAL_SECONDS - 0.3 : 0;

    const targets = [markRef.current, eyebrowRef.current, titleRef.current, subtitleRef.current, actionsRef.current].filter(
      Boolean
    );

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: 22,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.8,
        delay,
        stagger: 0.12,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.glow} aria-hidden="true" />
      {show3D && (
        <div className={styles.scene} aria-hidden="true">
          <HeroScene />
        </div>
      )}
      <div className={styles.inner}>
        <div className={styles.mark} ref={markRef}>
          <Logo size={56} />
        </div>
        <div className="eyebrow" ref={eyebrowRef}>
          <span className="num">ESC. 01</span>
          <span>Apertura</span>
          <span>Diseño · Ilustración · Motion · Publicidad</span>
        </div>
        <h1 className={styles.title} ref={titleRef}>
          Cada proyecto merece una <em>historia</em>.
          <br />
          Mi trabajo es darle una identidad capaz de contarla.
        </h1>
        <p className={styles.subtitle} ref={subtitleRef}>
          Soy FManuel Art — diseñador gráfico, publicista, ilustrador y motion designer. Cada
          proyecto es una producción propia: de la idea al fotograma final.
        </p>
        <div className={styles.actions} ref={actionsRef}>
          <a className="btnGhost" href="/filmografia">
            Ver filmografía
          </a>
          <a className="btnGhost" href="#contacto">
            Empecemos la próxima producción
          </a>
        </div>
      </div>
    </section>
  );
}
