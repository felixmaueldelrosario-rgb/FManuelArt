# Ortotipografía — corrector para programas de diseño

Implementación del diseño de [`docs/plugin-ortotipografico`](../../docs/plugin-ortotipografico/README.md).

| Pieza | Carpeta | Para qué |
| --- | --- | --- |
| Motor | `src/motor.js` | Revisa texto y devuelve incidencias. No depende de ningún programa. |
| Panel de Adobe | `adobe/`, `src/panel.js` | Panel CEP para **Illustrator** y **Photoshop**. |
| Integración propia | [`MISTER-DESIGNER.md`](./MISTER-DESIGNER.md) | Cómo usar el motor dentro de Mister Designer. |
| Descarga | `descargas/` | `.zip` listo para instalar en Illustrator y Photoshop. |

## Instalar (usuarios)

Descarga `descargas/Ortotipografia-Adobe-<versión>.zip` (ahora 0.1.2), descomprímelo y sigue `LEEME.txt`:
doble clic en `instalar-mac.command` o `instalar-windows.bat`, reinicia el programa y abre
**Ventana › Extensiones › Ortotipografía**.

## Desarrollo

```bash
npm install
npm test          # motor + validación del JSON contra el esquema
npm run build     # genera dist/ y el .zip
```

Para ver el panel sin Adobe: `npm run build`, sirve `dist/Ortotipografia-Adobe/com.fmanuel.ortotipografia/`
con cualquier servidor estático y abre `index.html`. Sin Adobe arranca en **modo de prueba** con un
documento de ejemplo.

Tras cambiar el motor o el panel, vuelve a generar el `.zip` y cópialo a `descargas/`.

## Qué hace cada programa

| | Illustrator | Photoshop |
| --- | --- | --- |
| Lee | Todos los marcos de texto (punto, área, trazado), con capas y símbolos | Todas las capas de texto, dentro de grupos |
| Reemplaza | Solo los caracteres afectados; conserva el estilo del primer carácter | El contenido de la capa (un paso del historial) |
| Reflow | Si un texto de área cambia de nº de líneas, deshace y pregunta | No se mide |
| Límite | — | Capas con varios estilos: no se tocan (Photoshop los unificaría) y se avisa |
| Capas bloqueadas u ocultas | No se tocan | No se tocan |

## Estado

Versión 0.1.2. El motor y el panel tienen pruebas automáticas y se prueban en un navegador
(modo de prueba). La 0.1.2 se probó **dentro de Illustrator** en Windows y funciona.
**Photoshop aún no se ha probado** dentro del programa.

Pendiente respecto al diseño: InDesign y Figma, revisión en la nube, informe PDF,
aprendizaje adaptativo y reglas de equipo compartidas.

## Licencias

Los diccionarios son de Hunspell, en los paquetes `dictionary-es` y `dictionary-en`:
(GPL-3.0 o LGPL-3.0 o MPL-1.1) para español, y su propia licencia para inglés. Se copian
a `dict/` dentro del panel junto con sus licencias. Revisa la compatibilidad antes de
distribuir el plugin comercialmente.
