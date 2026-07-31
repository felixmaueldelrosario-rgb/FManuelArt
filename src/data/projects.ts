export type Dept = "branding" | "ilustracion" | "motion" | "publicidad";

export type GalleryItem = {
  type: "image" | "video";
  src: string;
  poster?: string;
  label?: string;
};

export type Project = {
  slug: string;
  title: string;
  dept: Dept;
  deptLabel: string;
  year: string;
  note?: string;
  image: string;
  alt: string;
  processImage?: string;
  gallery?: GalleryItem[];
  client?: string;
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
    alt: "Velocista en plena zancada con zapatillas doradas y motion blur direccional, sobre fondo dorado y carbón con el titular RUSH9 — Dominate the Speed.",
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
    alt: "Carta ilustrada de Anacaona, cacica taína, retrato sereno con marco ornamental dorado y panel lateral de atributos e historia.",
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
    dept: "ilustracion",
    deptLabel: "Ilustración",
    year: "2026",
    note: "Arte listo para animación · en proceso",
    image: "/work/mlb-juan-soto.png",
    alt: "Carta ilustrada de Juan Soto de los Mets celebrando y señalando a la grada, con panel de logros y estadísticas de béisbol.",
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
    alt: "Carta ilustrada de Aaron Judge de los Yankees en paleta blanco, negro y rojo, con silueta de Nueva York y bloques densos de estadísticas.",
    featured: false,
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
    alt: "Carta ilustrada con los tres caciques de Higüey — Cayacoa, Higuanamá y Cotubanamá — retratados juntos sobre un atardecer caribeño.",
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
    alt: "Retrato digital de una mujer con audífonos y lentes bajo luz dura, fondo gestual en azules que no compite con el rostro.",
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
    alt: "Ilustración de personaje original con capucha de antenas, capa roja y emblema de corazón, sosteniendo un martillo como arma.",
    processImage: "/work/legacy-boceto.png",
    featured: false,
    role: "Diseño de personaje original",
    concept:
      "Diseño de un personaje original con estética de superhéroe — un emblema de corazón, capucha con antenas y un martillo a modo de arma — pensado como si tuviera que \"venderse\" en una sola lámina, al estilo de una hoja de personaje de cómic o videojuego.",
    process:
      "Antes de la ilustración final hubo una hoja de modelo completa: vistas de frente, perfil y espalda, con anotaciones de vestuario (capucha, antenas, capa, cartuchera) y el desglose del arma por separado. Ese trabajo de diseño es el que después permite resolver la lámina final en una sola pose sin inconsistencias.",
    result:
      "Un músculo distinto al resto del portfolio: diseño de personaje desde cero, con su propio proceso de construcción, no ilustración de una figura o marca ya existente.",
  },
  {
    slug: "estudio-figura",
    title: "Estudio de figura",
    dept: "ilustracion",
    deptLabel: "Ilustración",
    year: "2026",
    note: "Estudio personal · pintura digital",
    image: "/work/estudio-figura.png",
    alt: "Estudio pictórico de una figura arrodillada, envuelta en un trazo de pintura azul tratado como una cinta escultórica.",
    featured: false,
    role: "Ilustración · estudio de figura",
    concept:
      "Un estudio de figura autorreferencial: la modelo pinta, envuelta en su propio trazo de pintura azul hecho escultura. Es una pieza sobre el acto de pintar tanto como sobre la figura misma.",
    process:
      "Se combina el rigor de un estudio de anatomía clásico con un elemento gestual y abstracto — la cinta de pintura azul — que rompe con lo estrictamente representacional sin abandonar el dibujo.",
    result:
      "Es trabajo personal, sin cliente ni brief — el tipo de estudio que sostiene el resto de la ilustración figurativa en este portfolio.",
  },
  {
    slug: "hugoo",
    title: "Hugoo — Edición Rara",
    dept: "ilustracion",
    deptLabel: "Ilustración · IP propia",
    year: "2026",
    note: "Universo FManuelArt · #006",
    image: "/work/hugoo.png",
    alt: "Carta ilustrada de Hugoo, personaje con capucha de antenas arriba de una bicicleta BMX, estilo grafiti urbano en paleta teal.",
    featured: false,
    role: "Diseño de personaje y sistema de cartas coleccionables",
    concept:
      "Hugoo abre una segunda serie dentro del Universo FManuelArt, esta vez de personajes originales en vez de figuras históricas. Vive sin planes, arriba de una BMX, y su superpoder es no tomarse nada demasiado en serio.",
    process:
      "La misma plantilla de carta que sostiene a Mundo Taíno se adapta acá a un tono completamente distinto: ilustración tipo grafiti urbano, paleta teal-carbón, y un sistema de rareza (Común / Rara) tomado directo del lenguaje de los trading cards coleccionables.",
    result:
      "Prueba de que el sistema de cartas no es una plantilla de un solo uso — funciona igual de bien para un cacique taíno del siglo XV que para un pibe en bicicleta, sin perder identidad.",
  },
  {
    slug: "grafus",
    title: "Grafus — Edición Común",
    dept: "ilustracion",
    deptLabel: "Ilustración · IP propia",
    year: "2026",
    note: "Universo FManuelArt · #009 · también existe edición Rara",
    image: "/work/grafus.png",
    alt: "Carta ilustrada de Grafus, un joven dibujando concentrado en su escritorio, rodeado de lápices, pinceles y bocetos.",
    featured: false,
    role: "Diseño de personaje y sistema de cartas coleccionables",
    concept:
      "Si Hugoo es el caos con onda, Grafus es su contraparte: un diseñador obsesivo que convierte cada idea en boceto antes de que se le escape. Dos personajes, dos temperamentos, un mismo universo.",
    process:
      "Grafus ya tiene dos ediciones propias (Común y Rara) con distintas escenas y estadísticas, algo que Hugoo todavía no tiene — el sistema de rareza está pensado para crecer carta por carta, personaje por personaje.",
    result:
      "Con Hugoo y Grafus, el Universo FManuelArt deja de ser una serie única (Mundo Taíno) y pasa a ser una plataforma de personajes propios en expansión.",
  },
  {
    slug: "peroni",
    title: "Peroni Nastro Azzurro",
    dept: "publicidad",
    deptLabel: "Publicidad",
    year: "2023",
    note: "Cliente real — campaña de redes sociales",
    image: "/work/client-peroni-f1.jpg",
    alt: "Botella de Peroni Nastro Azzurro con vaso servido, montada sobre el morro de un auto de Fórmula 1, con cinta gráfica azul y el titular La cerveza que te lleva hasta el final.",
    client: "Peroni Nastro Azzurro",
    gallery: [
      { type: "video", src: "/work/client-peroni-mar.mp4", poster: "/work/client-peroni-mar-poster.jpg", label: "Story — mesa frente al mar" },
      { type: "video", src: "/work/client-peroni-rooftop.mp4", poster: "/work/client-peroni-rooftop-poster.jpg", label: "Story — rooftop urbano" },
    ],
    featured: true,
    role: "Dirección de arte y diseño de campaña para redes sociales",
    concept:
      "Tres piezas, un mismo cliente, dos ángulos distintos de la misma marca: la activación de Fórmula 1 juega con la velocidad y la adrenalina del deporte; las dos stories de estilo de vida —una frente al mar, otra en un rooftop— juegan con el disfrute pausado. Sostener ambos registros sin que la marca se sienta inconsistente es, en sí, el ejercicio.",
    process:
      "La cinta gráfica azul que atraviesa las tres piezas es el hilo que las une: aparece en el fondo de la activación de F1 y como elemento de movimiento en ambas stories, funcionando como firma visual reconocible de la campaña más allá del logo del producto.",
    result:
      "Peroni es cliente real, no un ejercicio propio — la campaña se produjo y publicó como pauta de marca en redes sociales.",
  },
  {
    slug: "locatour",
    title: "Locatour — California Wines",
    dept: "publicidad",
    deptLabel: "Publicidad",
    year: "2023",
    note: "Cliente real",
    image: "/work/client-locatour-feed.jpg",
    alt: "Dos copas de vino tinto brindando frente al mar, junto a una botella de Locatour Red Blend, con el mensaje El mejor vino se comparte con la mejor persona.",
    client: "Locatour",
    gallery: [
      { type: "video", src: "/work/client-locatour-viaje.mp4", poster: "/work/client-locatour-viaje-poster.jpg", label: "Post animado — La vida es un viaje" },
    ],
    featured: false,
    role: "Diseño de contenido y motion para redes sociales",
    concept:
      "Un feed post de fotografía de producto ('el mejor vino se comparte con la mejor persona') y una pieza animada con tipografía cinética ('¿Para dónde te lleva el viaje?') — dos formatos para el mismo cliente, pensados para convivir en el mismo feed sin repetirse.",
    process:
      "La pieza animada demuestra un registro distinto al resto del portfolio: tipografía en movimiento, confeti ilustrado y una paleta de marca (violeta y magenta) que no aparece en ningún otro proyecto — motion graphics real, no solo una foto con una capa de movimiento superpuesta.",
    result:
      "Locatour es cliente real. Ambas piezas se publicaron como parte de la pauta social continua de la marca.",
  },
  {
    slug: "lyr",
    title: "L&R — Donde todos califican",
    dept: "publicidad",
    deptLabel: "Publicidad",
    year: "2023",
    note: "Cliente real — pieza impresa",
    image: "/work/client-lyr-revista.jpg",
    alt: "Aviso de revista para L&R Muebles, campaña de Día de las Madres, con foto de una sala de estar moderna y el titular Donde todos califican.",
    client: "L&R",
    featured: false,
    role: "Diseño de aviso para revista impresa",
    concept:
      "Campaña de Día de las Madres para L&R, una mueblería con más de una década de trayectoria. Es la única pieza de todo el portfolio pensada para papel, no para pantalla — otro set de restricciones: resolución de impresión, sangrado, una sola oportunidad sin scroll para captar la atención.",
    process:
      "El aviso se resolvió para convivir con el resto de una revista real, no como una lámina aislada — jerarquía clara entre la fotografía del ambiente, el descuento y el llamado a la acción, pensada para funcionar incluso en una hojeada rápida.",
    result:
      "L&R es cliente recurrente — la misma marca aparece también como patrocinador en piezas de eventos que este estudio ha producido para ella.",
  },
  {
    slug: "fresita",
    title: "Fresita",
    dept: "motion",
    deptLabel: "Motion",
    year: "2023",
    note: "Cliente real",
    image: "/work/client-fresita-poster.jpg",
    alt: "Botella de espumante Fresita rodeada de fresas ilustradas sobre fondo rosa, con el eslogan Joven, Fresca, Divertida, Atrevida.",
    client: "Fresita",
    gallery: [
      { type: "video", src: "/work/client-fresita.mp4", poster: "/work/client-fresita-poster.jpg", label: "Post animado — Joven, fresca, divertida" },
    ],
    featured: false,
    role: "Motion graphics para redes sociales",
    concept:
      "Fresita es un vino espumante con una identidad completamente distinta a Locatour, aunque comparta categoría: joven, rosa, directa. La pieza tenía que sentirse más cerca de una etiqueta de moda que de una etiqueta de vino tradicional.",
    process:
      "Animación 2D de fresas ilustradas entrando en escena alrededor del producto, sincronizada con la aparición del texto de marca — un registro de motion más juguetón e ilustrado que el resto del portfolio, sin perder legibilidad de producto.",
    result:
      "Fresita es cliente real. La pieza se produjo como parte del lanzamiento de contenido de marca en redes sociales.",
  },
];
