import Image from "next/image";
import Reveal from "./Reveal";
import styles from "./Departments.module.css";

const DEPARTMENTS = [
  {
    dept: "branding" as const,
    title: "Branding e identidad",
    copy: "Sistemas de marca completos: naming, logotipo, paleta, tipografía y manual de uso.",
    image: null,
  },
  {
    dept: "ilustracion" as const,
    title: "Ilustración",
    copy: "Ilustración editorial, de personaje y de producto — a mano y digital.",
    image: "/work/esencia.png",
  },
  {
    dept: "motion" as const,
    title: "Motion graphics",
    copy: "Animación de marca, spots, lower thirds y piezas para redes.",
    image: "/work/mlb-juan-soto.png",
  },
  {
    dept: "publicidad" as const,
    title: "Publicidad",
    copy: "Concepto, copy y dirección de arte para campañas.",
    image: "/work/rush9-post.png",
  },
];

export default function Departments() {
  return (
    <section className={styles.section} id="departamentos">
      <div className="eyebrow">
        <span className="num">ESC. 03</span>
        <span>Departamentos</span>
      </div>
      <h2>Un estudio, cuatro disciplinas.</h2>

      <Reveal className={styles.grid}>
        {DEPARTMENTS.map((d) => (
          <div className={styles.card} key={d.title}>
            {d.image && (
              <div className={styles.cardImage} aria-hidden="true">
                <Image src={d.image} alt="" fill sizes="50vw" />
              </div>
            )}
            <span className="tagPill" data-dept={d.dept}>
              <span className="dot" />
              {d.title}
            </span>
            <p>{d.copy}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
