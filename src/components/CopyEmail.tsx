"use client";

import { useState } from "react";
import styles from "./SiteFooter.module.css";

const EMAIL = "hola@fmanuelart.com";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // clipboard unavailable — link below still works as a fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" onClick={handleCopy} className={styles.copyBtn}>
      {copied ? "¡Corte! Copiado ✓" : EMAIL}
    </button>
  );
}
