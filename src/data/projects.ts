export type Dept = "branding" | "ilustracion" | "motion" | "publicidad";

export type Project = {
  slug: string;
  title: string;
  dept: Dept;
  deptLabel: string;
  year: string;
  note?: string;
  image: string;
  featured: boolean;
  role: string;
  concept: string;
  process: string;
  result: string;
};

export const DEPT_LABELS: Record<Dept, string> = {
  branding: "Branding e identidad",
  ilustracion: "Ilustración",
  motion: "Motion",
  publicidad: "Publicidad",
};

export const PROJECTS: Project[] = [
  {
    slug: "rush9",
    title: "RUSH9 — Dominate the Speed",
    dept: "publicidad",
    deptLabel: "Publicidad",
    year: "2026",
    note: "Campaña adaptada a post y story",
    image: "/work/rush9-post.png",
    featured: true,
    role: "Concepto, dirección de arte y diseño de campaña",
    concept:
      "RUSH9 es una marca de zapatillas ficticia creada como ejercicio de campaña completa: no partir de un logo, sino de una sensación — la fracción de segundo en que un velocista rompe la inercia. Todo el concepto se construye alrededor de esa explosión de movimiento.",
    process:
      "La pieza combina una figura en plena zancada con motion blur direccional, un render de producto superpuesto en la misma diagonal de movimiento, y una tipografía condensada y pesada (\"RUSH9 — DOMINATE THE SPEED\") que empuja en la misma dirección que el cuerpo. La paleta dorado-carbón viene del atletismo de pista, no de la marca original de ningún cliente.",
    result:
      "El mismo arte se resolvió en dos formatos — post cuadrado y story vertical — sin perder el eje de movimiento en ninguno de los dos recortes, algo clave cuando una campaña real tiene que vivir en múltiples pantallas.",
  },
  {
    slug: "mundo-taino-anacaona",
    title: "Mundo Taíno — Anacaona",
    dept: "ilustracion",
    deptLabel: "Ilustración · IP propia",
    year: "2026",
    note: "Serie de personajes, universo original",
    image: "/work/mundo-taino-anacaona.png",
    featured: true,
    role: "Ilustración, diseño de personaje y sistema editorial",
    concept:
      "Mundo Taíno es un universo propio que reinterpreta figuras históricas de la cultura taína como una serie coleccionable de cartas. Anacaona — cacica, poeta y diplomática de Jaragua — abre la serie como la pieza #008: gobernó con la palabra antes que con la fuerza, y esa quietud es lo que se buscó en la pose.",
    process:
      "Cada carta combina un retrato ilustrado con un sistema de información propio: atributos, hechos destacados y una ficha de origen, todo dentro de un marco ornamental consistente. No es solo dibujar un personaje — es diseñar la plantilla que va a sostener a toda una serie histórica.",
    result:
      "Anacaona funciona como prueba de concepto del sistema completo: si la plantilla aguanta a un personaje con esta carga histórica y emocional, aguanta al resto de la serie.",
  },
  {
    slug: "juan-soto",
    title: "Juan Soto — Edición Estrella",
    dept: "motion",
    deptLabel: "Motion",
    year: "2026",
    note: "Arte listo para animación · en proceso",
    image: "/work/mlb-juan-soto.png",
    featured: true,
    role: "Ilustración y diseño de carta · arte base para motion",
    concept:
      "Ejercicio de fan art deportivo pensado desde el inicio para moverse: la pose de Juan Soto señalando a la grada, el logo del equipo y los bloques de logros se ilustraron como capas separables, no como una imagen plana.",
    process:
      "El estilo mezcla ilustración vectorial con textura pictórica y tipografía de póster deportivo — la misma dirección de arte que el resto de la serie de cartas, pero con la geometría pensada para animarse por capas: figura, fondo, texto y marca por separado.",
    result:
      "Esta es la pieza clave (key art) antes de pasar a motion — todavía no existe la animación final. Se muestra así, en este estado, a propósito: demuestra cómo se piensa una composición estática sabiendo que va a moverse.",
  },
  {
    slug: "aaron-judge",
    title: "Aaron Judge — Edición Juicio Final",
    dept: "ilustracion",
    deptLabel: "Ilustración",
    year: "2026",
    note: "Fan art — proyecto sin fines comerciales",
    image: "/work/mlb-aaron-judge.png",
    featured: true,
    role: "Ilustración y diseño editorial · fan art",
    concept:
      "\"Edición Juicio Final\" apuesta por una paleta casi monocromática — negro, blanco y rojo — para tratar a Aaron Judge como lo que es en la cancha: una figura imponente, casi de justicia sumaria.",
    process:
      "El reto acá fue de jerarquía, no de dibujo: un tipográfico enorme, bloques densos de logros y estadísticas, y un solo retrato ilustrado que tiene que sostener todo ese peso visual sin perderse en la composición.",
    result:
      "Proyecto de fan art sin fines comerciales — Judge, los Yankees y la MLB no son clientes de este trabajo, es una pieza de práctica que usa su figura pública para resolver un problema real de diseño editorial.",
  },
  {
    slug: "mundo-taino-higuey",
    title: "Mundo Taíno — Cacicazgo de Higüey",
    dept: "ilustracion",
    deptLabel: "Ilustración · IP propia",
    year: "2026",
    note: "Serie de personajes, universo original",
    image: "/work/mundo-taino-higuey.png",
    featured: false,
    role: "Ilustración, composición y sistema editorial",
    concept:
      "Segunda entrega de Mundo Taíno, y la primera prueba real del sistema: en vez de un cacique, esta carta tiene que sostener a tres — Cayacoa, Higuanamá y Cotubanamá — el linaje que resistió en Higüey hasta el final.",
    process:
      "La plantilla de Anacaona se adaptó para un panel de \"pilares\" con tres perfiles en vez de uno, más un mapa de ubicación y un sello de cera que ancla la pieza en el mismo lenguaje visual de la serie.",
    result:
      "Con dos cartas ya resueltas, Mundo Taíno deja de ser una ilustración suelta y pasa a ser un sistema real: una plantilla que se sostiene aunque cambie la cantidad de personajes que tiene que contar.",
  },
  {
    slug: "esencia",
    title: "Esencia",
    dept: "ilustracion",
    deptLabel: "Ilustración",
    year: "2026",
    note: "Retrato digital · estudio de personaje",
    image: "/work/esencia.png",
    featured: false,
    role: "Ilustración de personaje · estudio de retrato",
    concept:
      "Un retrato sin narrativa de por medio — la excusa fue puramente técnica: resolver un rostro con audífonos y lentes bajo una luz dura, sin que ningún elemento le gane protagonismo a la mirada.",
    process:
      "El foco estuvo en los materiales: el metal cepillado de los audífonos, el reflejo en el cristal de los lentes y la piel bajo esa misma luz, todo contra un fondo gestual en azules que no compite con el rostro.",
    result:
      "Una pieza de estudio puro — la clase de ejercicio que sostiene la calidad del trabajo con cliente, aunque nunca se lo muestre directamente.",
  },
  {
    slug: "legacy",
    title: "Legacy",
    dept: "ilustracion",
    deptLabel: "Ilustración",
    year: "2026",
    note: "Diseño de personaje original",
    image: "/work/legacy-composition.png",
    featured: false,
    role: "Diseño de personaje original",
    concept:
      "Diseño de un personaje original con estética de superhéroe — un emblema de corazón, capucha con antenas y un martillo a modo de arma — pensado como si tuviera que \"venderse\" en una sola lámina, al estilo de una hoja de personaje de cómic o videojuego.",
    process:
      "La composición combina un primer plano dramático con una toma de cuerpo completo, la manera clásica de mostrar personalidad y diseño de vestuario al mismo tiempo sin necesitar una segunda imagen.",
    result:
      "Un músculo distinto al resto del portfolio: diseño de personaje desde cero, no ilustración de una figura o marca ya existente.",
  },
  {
    slug: "estudio-figura",
    title: "Estudio de figura",
    dept: "ilustracion",
    deptLabel: "Ilustración",
    year: "2026",
    note: "Estudio personal · pintura digital",
    image: "/work/estudio-figura.png",
    featured: false,
    role: "Ilustración · estudio de figura",
    concept:
      "Un estudio de figura autorreferencial: la modelo pinta, envuelta en su propio trazo de pintura azul hecho escultura. Es una pieza sobre el acto de pintar tanto como sobre la figura misma.",
    process:
      "Se combina el rigor de un estudio de anatomía clásico con un elemento gestual y abstracto — la cinta de pintura azul — que rompe con lo estrictamente representacional sin abandonar el dibujo.",
    result:
      "Es trabajo personal, sin cliente ni brief — el tipo de estudio que sostiene el resto de la ilustración figurativa en este portfolio.",
  },
];
