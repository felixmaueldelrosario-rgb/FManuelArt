import styles from "./Ticker.module.css";

const ITEMS = [
  "Branding e identidad",
  "Ilustración",
  "Motion graphics",
  "Publicidad",
  "Dirección de arte",
];

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span className={styles.item} key={i}>
            <span>●</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
