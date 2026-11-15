# FManuel Art — instrucciones para Claude

## Juegos: todo es para Mundo Taíno

Todo trabajo relacionado con juegos en este repositorio (prototipos, mecánicas, arte de juego, documentación de diseño, publicación) es para **Mundo Taíno** y sus mejoras. No se crean juegos ni proyectos de juego aparte.

- **Qué es Mundo Taíno:** IP propia de FManuel Art. Reinterpreta figuras históricas de la cultura taína como una serie coleccionable de cartas ilustradas. Cada carta tiene un retrato, un marco ornamental, atributos, hechos destacados y una ficha de origen.
- **Cartas actuales:** Anacaona, pieza #008 (`public/work/mundo-taino-anacaona.png`), y Cacicazgo de Higüey: Cayacoa, Higuanamá y Cotubanamá (`public/work/mundo-taino-higuey.png`). Sus fichas están en `src/data/projects.ts`.
- **Skills de juego:** las skills de `.agents/skills/` (instaladas desde `gamedev-skills/awesome-gamedev-agent-skills`) se aplican a Mundo Taíno. Como es una serie de cartas, `card-game` es el punto de partida natural. `create-game-assets`, `game-docs`, `prototype-fast` y `game-ui-ux` sirven para el arte, la documentación, las pruebas y la interfaz.
- **Respeto cultural:** los personajes son figuras históricas reales del pueblo taíno. Los datos históricos se mantienen fieles y no se inventan hechos sobre ellos.
