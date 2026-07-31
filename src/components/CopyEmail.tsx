"use client";

import { useState } from "react";
import { CONTACT, MAILTO } from "@/data/contact";
import styles from "./SiteFooter.module.css";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — the mailto link still works as the primary path
    }
  };

  return (
    <span className={styles.emailRow}>
      <a href={MAILTO}>{CONTACT.email}</a>
      <button type="button" onClick={handleCopy} className={styles.copyBtn} aria-label="Copiar email">
        {copied ? "¡Corte! ✓" : "copiar"}
      </button>
    </span>
  );
}
