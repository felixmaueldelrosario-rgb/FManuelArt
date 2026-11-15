# FManuel Art — instrucciones para Claude

## Juegos: todo es para Mundo Taíno

Todo trabajo relacionado con juegos en este repositorio (prototipos, mecánicas, arte de juego, documentación de diseño, publicación) es para **Mundo Taíno** y sus mejoras. No se crean juegos ni proyectos de juego aparte.

- **Qué es Mundo Taíno:** IP propia de FManuel Art. Reinterpreta figuras históricas de la cultura taína como una serie coleccionable de cartas ilustradas. Cada carta tiene un retrato, un marco ornamental, atributos, hechos destacados y una ficha de origen.
- **Cartas actuales:** Anacaona, pieza #008 (`public/work/mundo-taino-anacaona.png`), y Cacicazgo de Higüey: Cayacoa, Higuanamá y Cotubanamá (`public/work/mundo-taino-higuey.png`). Sus fichas están en `src/data/projects.ts`.
- **Skills de juego:** las skills de `.agents/skills/` (instaladas desde `gamedev-skills/awesome-gamedev-agent-skills`) se aplican a Mundo Taíno. Como es una serie de cartas, `card-game` es el punto de partida natural. `create-game-assets`, `game-docs`, `prototype-fast` y `game-ui-ux` sirven para el arte, la documentación, las pruebas y la interfaz.
- **Respeto cultural:** los personajes son figuras históricas reales del pueblo taíno. Los datos históricos se mantienen fieles y no se inventan hechos sobre ellos.

## Diseño de la plataforma del juego: nada genérico

La plataforma de Mundo Taíno tiene que ser atractiva y con identidad propia, nunca con cara de plantilla. Esto vale para cualquier pantalla del juego: menús, tablero, cartas, transiciones y efectos.

- **Identidad visual:** se parte del lenguaje de las cartas, con marcos ornamentales, dorados, atardeceres caribeños, texturas pictóricas y motivos taínos como petroglifos, cemíes y el mar Caribe. No se usan colores, tipografías ni componentes por defecto sin una razón.
- **Animación con intención:** las cartas y la interfaz se mueven con peso. Hay revelado y volteo de cartas, entradas con capas (figura, fondo, texto y marco por separado, como ya se ilustran) y efectos de brillo o desgaste en el marco. El movimiento siempre respeta `prefers-reduced-motion`.
- **Experiencia del usuario:** cada acción responde al instante y se siente bien. Debe ser claro qué hacer, debe poder usarse en móvil y con teclado o mando, y los textos van en español.
- **Skills a usar al diseñar:**
  - `frontend-design`: dirección estética distintiva y anti-plantilla.
  - `game-feel`: tweens, squash and stretch, hit-stop y shake.
  - `game-ui-ux`: HUD, menús, escalado y accesibilidad.
  - `shader-programming`: efectos de dissolve, brillo y contorno.
  - `pixijs-rendering` o `threejs-*`: render web con animación avanzada.
  - `create-game-assets`: arte coherente con la serie.
  - `audio-design`: sonido de cartas y música.
  - Skills de VectorLab (`VectorLabAU/skills`):
    - `anti-slop`: evitar el aspecto genérico.
    - `motion`, `transitions` y `reduced-motion`: animación de interfaz.
    - `colour-palette`, `typography`, `spacing` y `surfaces`: lenguaje visual.
    - `ux-audit`: revisar la experiencia de usuario.
    - `keyboard`, `viewports`, `loaders`, `empty-states` y `errors`: detalles de uso.

Esto no se trabaja todavía. Es una regla para cuando se trabaje en el juego.
