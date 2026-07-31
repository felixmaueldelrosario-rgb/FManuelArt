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
          del trabajo casi nunca se muestra — aquí es parte de la historia.
        </p>
        <p>
          Reemplazá este bloque con tu foto de estudio, tu proceso real o un timeline tipo
          storyboard con tus bocetos.
        </p>
        <a className="btnGhost" href="#contacto" style={{ marginTop: "1.4rem", display: "inline-flex" }}>
          Conocer el estudio
        </a>
      </Reveal>
      <Reveal className={styles.frame} y={16}>
        Foto de estudio / proceso — reemplazar
      </Reveal>
    </section>
  );
}
