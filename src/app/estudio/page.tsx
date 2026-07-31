import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import styles from "./Estudio.module.css";

export const metadata: Metadata = {
  title: "Estudio",
  description:
    "Sobre FManuel Art: diseñador gráfico, publicista, ilustrador y motion designer. Filosofía de trabajo y proceso creativo.",
};

export default function EstudioPage() {
  return (
    <div className={styles.wrap}>
      <Reveal className={styles.head}>
        <div className="eyebrow">
          <span className="num">ESC. 04</span>
          <span>Estudio</span>
        </div>
        <h1 className={styles.title}>Sobre mí.</h1>
        <p style={{ color: "var(--text-dim)" }}>
          No creo en el diseño como un simple ejercicio estético.
        </p>
      </Reveal>

      <div className={styles.body}>
        <Reveal className={styles.block}>
          <h2>Sobre mí</h2>
          <p>
            Creo que cada marca, ilustración o animación es una oportunidad para contar una
            historia y provocar una emoción desde el primer instante.
          </p>
          <p>
            Soy FManuel Art, diseñador gráfico, publicista, ilustrador y motion designer. Mi
            trabajo combina estrategia, dirección de arte y narrativa visual para transformar
            ideas en experiencias memorables.
          </p>
          <p>
            Cada proyecto comienza con investigación, bocetos y exploración. La tecnología forma
            parte de mi proceso, pero nunca sustituye la creatividad ni el criterio. Cada
            decisión —desde un logotipo hasta una animación— debe tener un propósito.
          </p>
          <p>
            No busco crear piezas que solo se vean bien. Busco construir trabajos que comuniquen,
            permanezcan en la memoria y representen auténticamente a quienes confían en mí.
          </p>
        </Reveal>

        <Reveal className={styles.block}>
          <h2>Filosofía</h2>
          <p>Toda gran marca comienza con una gran historia.</p>
          <p>
            Diseñar no consiste únicamente en organizar colores, formas o tipografías. Consiste
            en comprender un problema, encontrar una idea sólida y convertirla en una identidad
            capaz de conectar con las personas.
          </p>
          <p>
            Trabajo con la misma filosofía en cada disciplina, ya sea branding, ilustración,
            motion graphics o publicidad: combinar creatividad, estrategia y atención al detalle
            para crear piezas con personalidad, coherencia y valor a largo plazo.
          </p>
          <div className={styles.pull}>
            <p>Porque una buena impresión dura unos segundos.</p>
            <p>Una identidad bien construida permanece durante años.</p>
          </div>
        </Reveal>
      </div>

      <Reveal className={styles.cta}>
        <a className="btnGhost" href="/#contacto">
          Empecemos la próxima producción
        </a>
      </Reveal>
    </div>
  );
}
