import Reveal from "./Reveal";
import styles from "./AboutTeaser.module.css";

export default function AboutTeaser() {
  return (
    <section className={styles.section} id="estudio">
      <Reveal className={styles.copy}>
        <div className="eyebrow">
          <span className="num">ESC. 04</span>
          <span>Detrás de cámaras</span>
        </div>
        <h2>El proceso importa tanto como el resultado.</h2>
        <p>
          Cada proyecto empieza en el papel: bocetos, referencias, pruebas de color. Esa parte
          del trabajo casi nunca se muestra — acá, comprimida en un timelapse, es parte de la
          historia.
        </p>
        <a className="btnGhost" href="#contacto" style={{ marginTop: "1.4rem", display: "inline-flex" }}>
          Conocer el estudio
        </a>
      </Reveal>
      <Reveal className={styles.reels} y={16}>
        <figure className={styles.reel}>
          <video
            src="/work/speed-painting-1.mp4"
            poster="/work/speed-painting-1-poster.jpg"
            controls
            preload="none"
            playsInline
          />
          <figcaption className={styles.reelCaption}>Speed painting · proceso 01</figcaption>
        </figure>
        <figure className={styles.reel}>
          <video
            src="/work/speed-painting-2.mp4"
            poster="/work/speed-painting-2-poster.jpg"
            controls
            preload="none"
            playsInline
          />
          <figcaption className={styles.reelCaption}>Speed painting · proceso 02</figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
