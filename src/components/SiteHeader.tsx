"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import Logo from "./Logo";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import styles from "./SiteHeader.module.css";

const LINKS = [
  { num: "01", label: "Filmografía", href: "/filmografia" },
  { num: "02", label: "Departamentos", href: "/#departamentos" },
  { num: "03", label: "Estudio", href: "/estudio" },
  { num: "04", label: "Contacto", href: "/#contacto" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);
  const [reelMounted, setReelMounted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || reelOpen ? "hidden" : "";
  }, [menuOpen, reelOpen]);

  useDialogA11y(menuOpen, menuRef, () => setMenuOpen(false));
  useDialogA11y(reelOpen, overlayRef, () => setReelOpen(false));

  // Mobile menu mount + exit
  useLayoutEffect(() => {
    if (menuOpen) {
      setMenuMounted(true);
      return;
    }
    if (!menuRef.current) return;
    gsap.to(menuRef.current, {
      opacity: 0,
      y: -18,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => setMenuMounted(false),
    });
  }, [menuOpen]);

  // Mobile menu enter (runs once the node exists)
  useLayoutEffect(() => {
    if (!menuMounted || !menuOpen || !menuRef.current) return;
    gsap.fromTo(
      menuRef.current,
      { opacity: 0, y: -18 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
    );
  }, [menuMounted, menuOpen]);

  // Reel modal mount + exit
  useLayoutEffect(() => {
    if (reelOpen) {
      setReelMounted(true);
      return;
    }
    if (!overlayRef.current || !modalRef.current) return;
    gsap
      .timeline({ onComplete: () => setReelMounted(false) })
      .to(modalRef.current, { opacity: 0, scale: 0.94, duration: 0.25, ease: "power2.in" }, 0)
      .to(overlayRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
  }, [reelOpen]);

  // Reel modal enter
  useLayoutEffect(() => {
    if (!reelMounted || !reelOpen || !overlayRef.current || !modalRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
    );
  }, [reelMounted, reelOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <Link href="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <Logo size={30} />
          <span className={styles.wordmark}>FManuel Art</span>
        </Link>

        <nav className={styles.nav} aria-label="Navegación principal">
          <ul className={styles.navLinks}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
          <button className={styles.reelBtn} onClick={() => setReelOpen(true)}>
            Reel
          </button>
        </nav>

        <button
          className={styles.burger}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuMounted && (
        <div
          ref={menuRef}
          className={styles.mobileMenu}
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
        >
          <div className={styles.mobileMenuHead}>
            <Logo size={30} />
            <button className={styles.mobileClose} onClick={() => setMenuOpen(false)}>
              Cerrar ✕
            </button>
          </div>
          <ul className={styles.mobileLinks}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setMenuOpen(false)}>
                  <span className={styles.num}>{l.num}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            className={`${styles.reelBtn} ${styles.mobileReel}`}
            onClick={() => {
              setMenuOpen(false);
              setReelOpen(true);
            }}
          >
            Reel
          </button>
        </div>
      )}

      {reelMounted && (
        <div
          ref={overlayRef}
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Showreel"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReelOpen(false);
          }}
        >
          <div className={styles.modal} ref={modalRef}>
            <button className={styles.modalClose} onClick={() => setReelOpen(false)}>
              Cerrar ✕
            </button>
            <span className={styles.modalSlate}>Escena · Reel · En producción</span>
            <span className={styles.modalTitle}>Tu showreel va aquí.</span>
          </div>
        </div>
      )}
    </>
  );
}
