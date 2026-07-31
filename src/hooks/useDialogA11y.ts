import { useEffect } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Minimal dialog accessibility behavior for a conditionally-rendered
 * overlay: Escape closes it, Tab/Shift+Tab cycle within it instead of
 * leaking focus to the page behind, and focus returns to whatever
 * triggered it on close. Deliberately dependency-free — this is the
 * whole surface area two modals need, not a general-purpose library.
 */
export function useDialogA11y(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    const triggeredBy = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      triggeredBy?.focus();
    };
  }, [active, containerRef, onClose]);
}
