import { PROJECTS } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import styles from "./FeaturedWork.module.css";

export default function FeaturedWork() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div>
          <div className="eyebrow">
            <span className="num">ESC. 02</span>
            <span>Filmografía</span>
          </div>
          <h2>Proyectos destacados.</h2>
        </div>
        <a className="btnGhost" href="/filmografia">
          Ver todos
        </a>
      </div>

      <Reveal className={styles.grid}>
        {featured.map((p) => (
          <ProjectCard project={p} key={p.slug} />
        ))}
      </Reveal>
    </section>
  );
}
