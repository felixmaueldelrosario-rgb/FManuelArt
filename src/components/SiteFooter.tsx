import CopyEmail from "./CopyEmail";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer} id="contacto">
      <div>
        <span className={styles.role}>Navegación</span>
        <a href="/filmografia">Filmografía</a>
        <a href="/#departamentos">Departamentos</a>
        <a href="/#estudio">Estudio</a>
      </div>
      <div>
        <span className={styles.role}>Departamentos</span>
        <a href="/#departamentos">Branding e identidad</a>
        <a href="/#departamentos">Ilustración</a>
        <a href="/#departamentos">Motion graphics</a>
        <a href="/#departamentos">Publicidad</a>
      </div>
      <div>
        <span className={styles.role}>Contacto</span>
        <CopyEmail />
        <a href="#" rel="noopener noreferrer">Instagram</a>
        <a href="#" rel="noopener noreferrer">Behance</a>
      </div>
      <div>
        <span className={styles.role}>Estudio</span>
        <span>FManuel Art</span>
        <span>Disponible para nuevos proyectos</span>
      </div>
      <div className={styles.tail}>
        <span>© {new Date().getFullYear()} FManuel Art — Dirección creativa, branding e ilustración</span>
        <span>Escena final · Corte.</span>
      </div>
    </footer>
  );
}
