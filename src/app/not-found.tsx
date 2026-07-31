export default function NotFound() {
  return (
    <div style={{ padding: "clamp(4rem, 10vw, 7rem) var(--edge)", minHeight: "60vh" }}>
      <div className="eyebrow">
        <span className="num">ESC. 00</span>
        <span>Corte</span>
      </div>
      <h1 style={{ fontSize: "clamp(2rem, 1.2rem + 3vw, 3.4rem)", marginBottom: "0.4em" }}>
        Escena no encontrada.
      </h1>
      <p style={{ color: "var(--text-dim)", maxWidth: "56ch", marginBottom: "1.6rem" }}>
        Esta toma se quedó en la sala de montaje — o nunca se filmó. Volvamos a un lugar seguro
        del guion.
      </p>
      <a className="btnGhost" href="/">
        Volver al inicio
      </a>
    </div>
  );
}
