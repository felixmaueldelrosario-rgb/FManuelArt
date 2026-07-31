import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PROJECTS } from "@/data/projects";
import Reveal from "@/components/Reveal";
import styles from "./CaseStudy.module.css";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.concept,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const beats = [
    { label: "Toma 1 — El concepto", text: project.concept },
    { label: "Toma 2 — El proceso", text: project.process },
    { label: "Toma 3 — El resultado", text: project.result },
  ];

  return (
    <div className={styles.wrap}>
      <a href="/filmografia" className={styles.back}>
        ← Volver a Filmografía
      </a>

      <Reveal className={styles.head}>
        <div className="eyebrow">
          <span className="num">{String(index + 1).padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>
        <span className="tagPill" data-dept={project.dept}>
          <span className="dot" />
          {project.deptLabel}
        </span>
        {project.client && (
          <span className={styles.clientBadge}>Cliente real — {project.client}</span>
        )}
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.role}>{project.role}</p>
        {project.note && <p className={styles.role}>{project.note}</p>}
      </Reveal>

      <Reveal className={styles.cover}>
        <Image
          src={project.image}
          alt={project.alt}
          fill
          sizes="(max-width: 900px) 100vw, 1200px"
          priority
        />
      </Reveal>

      <div className={styles.beats}>
        {beats.map((b) => (
          <Reveal key={b.label} className={styles.beat}>
            <span className="eyebrow" style={{ marginBottom: "0.3em" }}>
              {b.label}
            </span>
            <p>{b.text}</p>
          </Reveal>
        ))}
      </div>

      {project.gallery && project.gallery.length > 0 && (
        <Reveal className={styles.gallery}>
          <span className="eyebrow" style={{ marginBottom: "0.8em" }}>
            <span className="num">Más</span>
            <span>Otras piezas de esta campaña</span>
          </span>
          <div className={styles.galleryGrid}>
            {project.gallery.map((item, i) => (
              <div className={styles.galleryItem} key={i}>
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    controls
                    preload="none"
                    playsInline
                  />
                ) : (
                  <div className={styles.galleryImage}>
                    <Image src={item.src} alt={item.label ?? project.alt} fill sizes="(max-width: 900px) 100vw, 450px" />
                  </div>
                )}
                {item.label && <span className={styles.galleryLabel}>{item.label}</span>}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {project.processImage && (
        <Reveal className={styles.processBlock}>
          <span className="eyebrow" style={{ marginBottom: "0.8em" }}>
            <span className="num">Proceso</span>
            <span>Antes de la lámina final</span>
          </span>
          <div className={styles.processImage}>
            <Image
              src={project.processImage}
              alt={`Boceto de proceso — ${project.title}`}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </div>
        </Reveal>
      )}

      <div className={styles.next}>
        <span className="eyebrow">Siguiente proyecto</span>
        <a href={`/filmografia/${next.slug}`} className={styles.nextLink}>
          <div className={styles.nextMedia}>
            <Image src={next.image} alt={next.alt} fill sizes="33vw" />
          </div>
          <div>
            <span className="tagPill" data-dept={next.dept}>
              <span className="dot" />
              {next.deptLabel}
            </span>
            <h3 className={styles.nextTitle}>{next.title}</h3>
          </div>
        </a>
      </div>
    </div>
  );
}
