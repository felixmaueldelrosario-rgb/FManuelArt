import Image from "next/image";
import type { Project } from "@/data/projects";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card}>
      <div className={styles.media} data-cursor="rec">
        <Image src={project.image} alt={project.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
      </div>
      <div className={styles.body}>
        <span className="tagPill" data-dept={project.dept}>
          <span className="dot" />
          {project.deptLabel}
        </span>
        <h3>{project.title}</h3>
        <div className={styles.meta}>
          <span>{project.year}</span>
          {project.note && <span className={styles.note}>{project.note}</span>}
        </div>
        <a href={`/filmografia/${project.slug}`}>Ver proyecto →</a>
      </div>
    </article>
  );
}
