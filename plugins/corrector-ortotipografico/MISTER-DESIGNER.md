# Integrar el corrector en Mister Designer

El motor (`src/motor.js`) es JavaScript puro, sin dependencias de Adobe. Mister Designer
solo tiene que hacer tres cosas: **darle el texto**, **pintar las incidencias** y
**aplicar los cambios que el usuario acepte**.

## 1. Crear el corrector (una vez)

```js
import { crearCorrector } from './motor.js';

// Los diccionarios son archivos de Hunspell (.aff y .dic). Cárgalos como texto.
const corrector = crearCorrector({
  es: { aff: textoEsAff, dic: textoEsDic },
  en: { aff: textoEnAff, dic: textoEnDic },
});
```

Tarda alrededor de 1 segundo en cargar. Hazlo al abrir el programa, no en cada revisión.

## 2. Revisar el documento

```js
import { revisarDocumento } from './motor.js';

const respuesta = revisarDocumento(corrector, {
  documentoId: 'cartel-otono.mdx',
  host: 'mister-designer',
  bloques: [
    {
      id: 'capa-17',                      // el id de la capa en tu programa
      texto: 'La colección de otoño , ya disponible.',
      capa: { id: 'capa-17', nombre: 'Intro', ruta: ['Portada'], tipoTexto: 'area' },
      estilo: { cuerpoPt: 10, fuente: 'Inter' },
      estilosMixtos: false,               // true si tu programa no puede reemplazar sin perder estilos
    },
  ],
}, {
  diccionarioProyecto: ['AcmeCo'],        // palabras aceptadas en este proyecto
  ignorados: [],                          // claves de «Ignorar siempre»
  reglas: { comillas: 'angulares' },      // ver REGLAS_POR_DEFECTO
});
```

La respuesta sigue el esquema
[`docs/plugin-ortotipografico/incidencia.schema.json`](../../docs/plugin-ortotipografico/incidencia.schema.json).
Cada incidencia trae:

- `original` y `sugerencias` (la primera es la recomendada)
- `explicacion` en español, lista para mostrar
- `vistaPrevia.antes` / `vistaPrevia.despues`
- `confianza.nivel` (`alta`, `mediana`, `baja`) e `impacto.nivel` (`critico`, `medio`, `bajo`)
- `metadatos.posicion.inicio` / `fin`: dónde está dentro del texto del bloque
- `autoAplicable`: `true` solo si es seguro aplicarla sin preguntar

## 3. Aplicar una corrección

Reemplaza en tu modelo de texto el rango `[inicio, fin)` por la sugerencia elegida,
**conservando el estilo del primer carácter del rango**. Después vuelve a revisar ese
bloque: las posiciones de las demás incidencias cambian.

```js
import { aplicar } from './motor.js';
const nuevoTexto = aplicar(textoDelBloque, { inicio, fin, sugerencias: [sugerencia] });
```

Si Mister Designer puede medir el texto, compara el número de líneas antes y después;
si cambia y la incidencia no era `critico`, deshaz y pregunta al usuario.

## Revisión incremental

Guarda `bloques[i].hash` y vuelve a revisar solo los bloques cuyo hash cambie
(`hashTexto(texto)`). Un bloque de ~400 palabras tarda menos de 300 ms.

## Si Mister Designer no está hecho en JavaScript

Hay dos opciones sencillas:

1. **Proceso auxiliar**: un pequeño servidor local (Node) que expone
   `POST http://127.0.0.1:<puerto>/v1/check` con el cuerpo de arriba y devuelve la respuesta.
   Es el endpoint del diseño (§5 del README de diseño).
2. **Motor embebido**: Python, Swift, C#, etc. pueden ejecutar JavaScript (QuickJS, JavaScriptCore,
   ClearScript…), o usar Hunspell directamente y portar las reglas tipográficas.

Dime en qué lenguaje y plataforma está Mister Designer y preparo la opción que encaje.
