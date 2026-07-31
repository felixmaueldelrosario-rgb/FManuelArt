"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

const LINKS = [
  { num: "01", label: "Filmografía", href: "/filmografia" },
  { num: "02", label: "Departamentos", href: "/#departamentos" },
  { num: "03", label: "Estudio", href: "/#estudio" },
  { num: "04", label: "Contacto", href: "/#contacto" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || reelOpen ? "hidden" : "";
  }, [menuOpen, reelOpen]);

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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            className={styles.mobileMenu}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reelOpen && (
          <motion.div
            key="reel-modal"
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label="Showreel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setReelOpen(false);
            }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className={styles.modalClose} onClick={() => setReelOpen(false)}>
                Cerrar ✕
              </button>
              <span className={styles.modalSlate}>Escena · Reel · En producción</span>
              <span className={styles.modalTitle}>Tu showreel va aquí.</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
