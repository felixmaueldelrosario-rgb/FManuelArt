# Suite de pruebas sugerida

Herramientas propuestas: **Vitest** (núcleo TypeScript), **fast-check** (pruebas de propiedad),
**Ajv** (validación del esquema), **Playwright** (UI del panel en Figma/iframe y CEP),
scripts por host (UXP/ExtendScript) ejecutados en CI con máquinas con licencia.

## 1. Unitarias — núcleo

### 1.1 Ortografía y teclas adyacentes
| Caso | Entrada (es-ES) | Esperado |
| --- | --- | --- |
| Falta común | `exepción` | `excepción`, confianza alta |
| Tilde | `cancion` | `canción` |
| Tecla vecina (QWERTY ES) | `cqsa` | `casa`, tipo `tecla_adyacente` |
| Transposición | `teh` (en-US) | `the`, alta |
| Homófonos válidos | `cesión` en «la cesión de la reunión» | sugerencia `sesión`, confianza **mediana**, no alta |
| Palabra correcta rara | `otorrinolaringólogo` | sin incidencia |
| Marca desconocida | `AcmeCo` | confianza baja |
| Diccionario de proyecto | `AcmeCo` tras añadirla | sin incidencia |
| Palabra protegida | `iPhone` | sin incidencia de mayúsculas |
| Lorem ipsum | `Lorem ipsum dolor` | sin incidencias + aviso `lorem` |
| Distribución AZERTY | `zqrd` → con AZERTY activo | no se trata como tecla vecina de QWERTY |

### 1.2 Mayúsculas y estilos
- VERSALES/mayúsculas forzadas: texto lógico `Hola mundo` con `caps = versales` → **sin** incidencias de mayúsculas.
- Escrito en mayúsculas `CANCION` → sugerencia `CANCIÓN` con explicación de tilde en mayúsculas.
- `tEXTO` en logotipo → `requierePregunta = true`, `sugerencias = []`.
- Regla `titulos = oracion`: `Nuestra Nueva Colección` → `Nuestra nueva colección`; con `titulos = libre` → nada.
- Meses: `en Enero` → `en enero` (es); `in january` → `in January` (en).

### 1.3 Puntuación, espaciado, guiones y comillas
| Entrada | Idioma | Esperado |
| --- | --- | --- |
| `hola , mundo` | es | `hola, mundo` |
| `Bonjour !` | fr | **sin** incidencia (con `espacioFinoFrances`); `Bonjour!` → falta espacio fino |
| `Que hora es?` | es | falta `¿` |
| `hola  mundo` | es | espacio doble |
| `( texto )` | es | `(texto)` |
| `1990-1995` | es, `rangosConSemirraya` | `1990–1995` |
| `Bien -dijo él- y se fue` | es, `incisosConRaya` | `Bien —dijo él— y se fue` |
| `"texto"` | es, comillas angulares | `«texto»` |
| `"texto"` en fuente monoespaciada | es | `requierePregunta = true` (posible código) |
| `5"` (pulgadas) / `O'Brien` | en | sin conversión a comillas tipográficas |

### 1.4 Clasificador confianza × impacto
- Tabla de verdad de impacto: cada `motivo` produce el nivel esperado; el nivel final es el máximo.
- **Propiedad (fast-check):** para cualquier incidencia generada, `autoAplicable ⇒ confianza = alta ∧ impacto = bajo ∧ rol ≠ maestro`.
- **Propiedad:** el modo auto-aplicar desactivado ⇒ ninguna incidencia cambia a `auto_aplicada`.
- Umbrales configurables (`toleranciaReflowPt`, `cuerpoTitularPt`) cambian la clasificación en el borde exacto (0,5 pt / 36 pt).

### 1.5 Detección de idioma
- Bloques mixtos `es` / `en` en el mismo documento → idioma por bloque correcto.
- Bloque < 20 caracteres → usa el idioma del estilo del host (`origen = estilo_host`).
- Selección manual → `origen = manual` y prevalece sobre la detección tras volver a analizar.

### 1.6 Incremental y caché
- Mismo texto ⇒ mismo `hash` ⇒ no se vuelve a analizar (contador de llamadas al motor = 0).
- Insertar texto antes de una incidencia ⇒ la incidencia se conserva con offsets desplazados.
- Editar la palabra marcada ⇒ la incidencia aparece en `resueltas`.
- Cambiar `versionReglas` ⇒ invalida la caché.
- *Debounce*: 10 eventos en 300 ms ⇒ 1 solo análisis.

### 1.7 Privacidad
- Anonimizador: emails, teléfonos (formatos ES/MX/US), URL, números ≥ 6 dígitos y palabras del diccionario del proyecto se sustituyen por marcadores; ida y vuelta restaura el texto **y los offsets** exactos.
- El texto mostrado en `/consent/preview` es **byte a byte** igual al cuerpo enviado (prueba con un servidor simulado que registra la petición).
- Con `nube = desactivada`, ningún test de red recibe peticiones (servidor simulado con aserción de 0 llamadas).

### 1.8 Esquema
- `ejemplo-respuesta.json` valida contra `incidencia.schema.json` (Ajv, Draft 2020-12).
- Todas las respuestas generadas por el motor en la suite validan contra el esquema.
- Negativo: `autoAplicable = true` con impacto `critico` ⇒ inválido.

### 1.9 Informes
- CSV: cabeceras fijas, escapado de comas/comillas/saltos de línea, UTF-8 con BOM (Excel), una fila por incidencia con su decisión final.
- PDF: contiene resumen, totales por tipo/impacto y decisiones; texto seleccionable; caracteres `¿¡ñ«»—` correctos.

## 2. Integración — por host

Cada host ejecuta el mismo conjunto de documentos de prueba (*fixtures*):

| Fixture | Contenido | Comprobaciones |
| --- | --- | --- |
| `cuerpo-largo` | Story de 3 páginas enlazada | aplicar 100 sugerencias ⇒ 0 cambios en tracking, kerning, leading, fuente, OpenType de los *runs* |
| `titular-justo` | Titular que ocupa exactamente el ancho del marco | sugerencia que ensancha ⇒ clasificada `critico` + aviso; nunca auto-aplicada |
| `texto-punto` (AI) | Texto de punto centrado | Δ ancho medido y reportado; posición del ancla intacta |
| `componentes` (Figma) / `simbolos` (AI) / `maestras` (ID) | Maestro + 12 instancias, 1 con override | `instanciasAfectadas = 12`; corregir el override no toca el maestro |
| `versales` | Estilo con Small Caps y All Caps | ninguna incidencia de mayúsculas; aplicar conserva el `capsMode` |
| `multilingue` | Párrafos es/en/fr | reglas de espaciado distintas por bloque |
| `contornos` | Texto convertido a contornos | aviso, sin incidencias |
| `bloqueada` | Capa bloqueada | error `error.bloqueada`, documento intacto |
| `fuente-falta` | Fuente no instalada | Figma: `error.fuente`; ninguna modificación |

Pruebas transversales:
- **Deshacer:** cada aplicación = 1 paso de *undo* del host; `Revertir` desde el historial restaura el texto y los estilos exactos.
- **Reflow inesperado:** inyectar una corrección mal clasificada como `bajo` que añade una línea ⇒ el plugin deshace, reclasifica y muestra `aviso.reflowInesperado`.
- **Persistencia:** diccionario, ignorados y reglas sobreviven a cerrar y abrir el documento y se comparten entre documentos del mismo proyecto.
- **Offline:** sin red, el análisis funciona con diccionarios locales y la UI muestra `estado.offline`.
- **Nube (con servidor LanguageTool simulado):** fusión de resultados locales y remotos sin duplicados; *timeout* de 2 s ⇒ se mantienen los resultados locales.

## 3. UI del panel (Playwright)
- Navegación completa solo con teclado (`J/K`, `Enter`, `I`, `D`, `E`); foco visible siempre.
- Los atajos de una tecla no actúan si el foco está fuera del panel.
- Filtros combinados (tipo + impacto + capa) y contadores coherentes.
- Lector de pantalla: cada tarjeta anuncia tipo, original, sugerencia, confianza e impacto.
- Contraste AA en temas claro y oscuro del host; los niveles no se comunican solo por color.
- Modo no intrusivo: sin *toasts* mientras se escribe; resumen al guardar.

## 4. Precisión (criterio de aceptación 95 %)
**Corpus de prueba en español** (versionado, no se usa para ajustar el motor):
- 20 000 palabras de texto de diseño real (catálogos, carteles, UI, packaging) con errores
  anotados por dos correctores; desacuerdos resueltos por un tercero.
- 1 500 errores naturales (no sintéticos) + 1 500 sintéticos (teclas vecinas, tildes, transposiciones).
- 10 000 palabras de texto correcto con marcas, nombres propios, anglicismos y siglas
  (para medir falsos positivos).
- Variantes: es-ES, es-MX, es-AR (al menos 20 % del corpus no peninsular).

Métricas reportadas en CI: precision, recall y F1 por tipo y por variante; falsos positivos
por 1000 palabras; matriz de confusión de niveles de confianza (las incidencias de confianza
alta deben tener precision ≥ 99 % para justificar el auto-aplicar).

Umbral de paso: precision ≥ 95 %, recall ≥ 90 %, FP ≤ 2/1000 en ortografía es.

## 5. Rendimiento (criterio < 300 ms)
- Banco con "archivo medio" (≤ 300 bloques, ≤ 15 000 palabras, bloque típico ≤ 400 palabras).
- Medir p50/p95/p99 por bloque: **en frío** (diccionario cargándose) y **en caliente**. Criterio sobre p95 en caliente; en frío se reporta aparte (objetivo < 1,5 s para el primer bloque).
- Edición continua simulada (60 pulsaciones/min durante 5 min): la UI del host no pierde fotogramas por encima de 50 ms (trabajo troceado).
- Memoria: < 150 MB con 3 diccionarios cargados.
- Regresión: CI falla si el p95 empeora > 15 % respecto a la rama principal.
