# Plugin de corrección ortotipográfica para diseño — Análisis y diseño

Documento de diseño para un corrector ortográfico y tipográfico integrado en
Adobe Illustrator, InDesign, Photoshop, Figma y Affinity.

| Archivo | Contenido |
| --- | --- |
| `README.md` (este) | Análisis de requisitos, arquitectura, motor, endpoints, diccionarios, privacidad, criterios de aceptación |
| [`incidencia.schema.json`](./incidencia.schema.json) | Esquema JSON (Draft 2020-12) para el intercambio de incidencias |
| [`ejemplo-respuesta.json`](./ejemplo-respuesta.json) | Respuesta de ejemplo que valida contra el esquema |
| [`wireframes.md`](./wireframes.md) | Wireframes del panel lateral, lienzo, consentimiento y revisión final |
| [`microcopy.md`](./microcopy.md) | Catálogo de microcopy en español |
| [`pruebas.md`](./pruebas.md) | Suite de pruebas unitarias, de integración, rendimiento y precisión |

---

## 1. Análisis de los requisitos

### 1.1 Lo que el brief resuelve bien
- **Principio rector claro:** el diseñador decide. Nada se aplica sin consentimiento
  y el modo automático queda limitado a *confianza alta + impacto bajo*.
- **Clasificación en dos ejes** (confianza × impacto): separa "¿está mal?" de
  "¿cuánto me cuesta corregirlo?". Es lo que diferencia esta herramienta de un
  corrector de procesador de textos.
- **Privacidad por defecto** (local primero, nube con consentimiento y vista del texto enviado).
- **Criterios medibles** (95 %, < 300 ms, sin reflow).

### 1.2 Ambigüedades y huecos a resolver antes de construir

| # | Punto del brief | Problema | Propuesta |
| --- | --- | --- | --- |
| A1 | "Precisión mínima 95 %" | No especifica si es *precision* (de lo marcado, cuánto es error real) o *recall* (de los errores reales, cuánto se detecta). Un corrector puede tener 99 % de precisión marcando muy poco. | Exigir **precision ≥ 95 % y recall ≥ 90 %** (F1 ≥ 0,92) en ortografía española, más **falsos positivos ≤ 2 por cada 1000 palabras** en texto correcto. |
| A2 | "Archivo de tamaño medio" | Sin definición, la latencia no se puede verificar. | Definir: **≤ 300 cuadros/capas de texto, ≤ 15 000 palabras, bloque típico ≤ 400 palabras**. Medir p95, no la media. |
| A3 | "< 300 ms por bloque" | No dice si incluye nube. | Objetivo p95 < 300 ms **en local**. En nube: p95 < 800 ms y se muestran primero los resultados locales. |
| A4 | "Sin reflow inesperado" | Casi cualquier corrección cambia el ancho del texto (`"` → `“`, `-` → `—`, añadir una tilde no, pero añadir una letra sí). El reflow cero es imposible; lo que se puede garantizar es que **no sea inesperado**. | Medir antes/después (nº de líneas, desbordamiento, ancho del cuadro de punto). Si cambia el flujo → impacto **crítico** y nunca se auto-aplica; la vista previa avisa. Ver §4.4. |
| A5 | "Espacios antes de signos" | Es correcto en español e inglés, pero **erróneo en francés** (`;:!?` llevan espacio fino). | Reglas tipográficas **por idioma** del bloque, no globales. |
| A6 | "Teclas adyacentes" | Depende de la distribución del teclado (QWERTY ES, LATAM, US, AZERTY…). | Detectar la distribución del sistema y permitir cambiarla en Preferencias. |
| A7 | "Comillas tipográficas" | En español la RAE prefiere las angulares « », luego “ ” y después ‘ ’. Muchas marcas usan “ ” por estilo. | Hacer configurable el estilo de comillas por proyecto (regla de equipo). |
| A8 | Affinity | Hasta donde sé, Affinity no tenía una API pública de plugins comparable a UXP o Figma. | Tratarlo como **riesgo de plataforma**: fase 1 = importar/exportar texto (IDML/PDF/portapapeles) + informe; integración nativa cuando haya SDK. |
| A9 | Símbolos y componentes | Corregir un componente maestro propaga el cambio a todas sus instancias; corregir una instancia puede crear un *override* no deseado. | Detectar el origen: si está en el maestro → impacto crítico y mostrar el nº de instancias afectadas. Si está en una instancia con override → ofrecer "corregir en el maestro". |
| A10 | Texto convertido en contornos / rasterizado | No es texto: no se puede analizar sin OCR. | Fuera del alcance de la v1. Mostrar un aviso informativo ("3 capas de texto convertidas en contornos no se revisaron"). |
| A11 | "Aprendizaje adaptativo" | Riesgo de que el sistema aprenda errores o filtre texto de clientes. | Aprendizaje **solo local y por proyecto** por defecto; compartir con el equipo requiere un opt-in aparte. Nunca entrena con el texto, solo con pares (sugerencia, decisión). |

### 1.3 Riesgos principales
1. **Falsos positivos en texto de diseño:** marcas, nombres propios, eslóganes con
   juegos de palabras, texto en mayúsculas, *lorem ipsum*. Mitigación: diccionario
   de proyecto precargado (extraído de nombres de capas/estilos y del texto que se repite),
   detección de *lorem ipsum* (se ignora y se avisa), y confianza más baja para palabras en VERSALES.
2. **Cambio de estilos al reemplazar texto:** reemplazar un rango puede heredar el
   estilo del carácter anterior. Mitigación: reemplazar a nivel de *runs* conservando
   los atributos del primer carácter del rango original (§4.4).
3. **Rendimiento en documentos grandes de InDesign:** recorrer todas las *stories*
   en cada cambio es inviable. Mitigación: hash por bloque y análisis incremental (§4.2).

---

## 2. Arquitectura

```
┌──────────────────────── Host (Illustrator / InDesign / Photoshop / Figma / Affinity) ─────┐
│  Adaptador del host                                                                       │
│   · Extrae bloques de texto + runs de estilo + metadatos (capa, artboard, componente)     │
│   · Escucha cambios (eventos del host / polling con hash)                                 │
│   · Aplica reemplazos preservando estilos · Mide reflow antes/después                     │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│  Núcleo compartido (TypeScript → JS/WASM, idéntico en todos los hosts)                    │
│   · Normalizador (desactiva transformaciones visuales: VERSALES, mayúsc. forzadas)        │
│   · Detector de idioma por bloque                                                         │
│   · Motor de reglas: ortografía · teclas adyacentes · mayúsculas · puntuación ·           │
│     espaciado · guiones/rayas · comillas                                                  │
│   · Clasificador confianza × impacto                                                      │
│   · Cola incremental + caché por hash                                                     │
│   · Almacén de proyecto: diccionario, ignorados, reglas, decisiones, historial            │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│  Panel UI (HTML/React en UXP, CEP o iframe de Figma)                                      │
└───────────────────────────────────────────────────────────────────────────────────────────┘
                 │ opcional, solo con consentimiento
                 ▼
        Servicio de lenguaje en la nube (misma API que el núcleo local, §5)
```

### 2.1 Adaptadores por host

| Host | Tecnología | Acceso al texto | Notas |
| --- | --- | --- | --- |
| InDesign | UXP (CEP/ExtendScript como respaldo) | `Story` → `TextStyleRange`, `Character` | Usar `Story` y no `TextFrame` (los textos enlazados abarcan varios marcos). Medir reflow con `overflows` y `lines.length`. |
| Illustrator | CEP + ExtendScript (UXP cuando esté disponible) | `TextFrameItem.textRange`, `characterAttributes` | Texto de punto vs. de área: en el de punto el reflow cambia el ancho, no las líneas. |
| Photoshop | UXP | `Layer.textItem` / batchPlay `textKey` | Las capas de texto en Smart Objects requieren abrir el objeto; v1: solo informarlas. |
| Figma | Plugin API (sandbox + iframe UI) | `TextNode.characters`, `getStyledTextSegments` | Hay que cargar las fuentes (`loadFontAsync`) antes de editar. Instancias: `mainComponent` para saber el origen. |
| Affinity | Sin SDK público (ver A8) | Importar IDML/PDF/portapapeles | Informe y correcciones manuales en v1. |

### 2.2 Modelo de texto
Cada **bloque** = unidad mínima de análisis (párrafo de una story, un TextNode, una capa de texto).
Se almacena:
- `text`: texto lógico (sin transformaciones visuales; ver §4.3).
- `runs[]`: rangos con estilo (fuente, tamaño, tracking, kerning, leading, `capsMode`, idioma asignado por el host).
- `hash`: SHA-1 del texto + idioma + versión de reglas → clave de caché.

---

## 3. Detección y clasificación

### 3.1 Tipos de incidencia (`tipo` en el esquema)

| Tipo | Ejemplo | Regla / fuente |
| --- | --- | --- |
| `ortografia` | *exepción* → *excepción* | Hunspell/nspell + distancia de edición ponderada |
| `tecla_adyacente` | *teh* → *the*, *cqsa* → *casa* | Distancia con coste reducido para teclas vecinas en la distribución activa y transposiciones |
| `mayusculas` | *lunes* en inicio de frase; *Enero* a mitad de frase (es) | Reglas por idioma + reglas de equipo (títulos en *sentence case* o *title case*) |
| `puntuacion` | falta *¿*/*¡* de apertura; `..` doble; coma antes de verbo | LanguageTool (reglas) + reglas propias |
| `espaciado` | `hola ,` · `hola  mundo` · `( texto )` | Expresiones regulares por idioma (francés: exige espacio fino) |
| `guiones` | `1990-1995` → `1990–1995` (semirraya en rangos, si el estilo lo pide); `-` como inciso → `—` | Reglas tipográficas configurables |
| `comillas` | `"texto"` → `«texto»` / `“texto”` | Estilo de comillas del proyecto |
| `gramatica` *(ampliación)* | concordancia | LanguageTool; confianza máxima: mediana |

### 3.2 Confianza

Puntuación 0–1 combinando: frecuencia de la sugerencia en el idioma, distancia de edición,
nº de candidatos, contexto (n-gramas), historial de decisiones del proyecto y señales de
riesgo (VERSALES, palabra que parece marca/nombre propio, idioma con detección dudosa).

| Nivel | Umbral | Ejemplo |
| --- | --- | --- |
| `alta` | ≥ 0,85 y un solo candidato claro | *teh* → *the*; espacio antes de coma |
| `mediana` | 0,55 – 0,85 | *sesión*/*cesión* (ambas existen) |
| `baja` | < 0,55 | palabra desconocida que puede ser marca: *AcmeCo* |

### 3.3 Impacto en el diseño

Se calcula a partir del rol del texto y del coste visual de corregir:

| Nivel | Cuándo |
| --- | --- |
| `critico` | Texto en un componente/símbolo maestro (se propaga); texto de logo o titular de gran cuerpo; la corrección **cambia el nº de líneas, desborda el cuadro o cambia el ancho de un texto de punto más allá de la tolerancia**; texto en un trazado. |
| `medio` | Titulares, botones, etiquetas de UI, pies de foto; la corrección cambia el ancho pero no el flujo. |
| `bajo` | Texto de cuerpo, sin cambio de flujo, ancho Δ ≤ tolerancia (por defecto 0,5 pt). |

La tolerancia y el umbral de "gran cuerpo" (por defecto ≥ 36 pt) son configurables por proyecto.
El auto-aplicar **solo** opera con `confianza = alta` **y** `impacto = bajo`, y nunca sobre componentes maestros.

---

## 4. Comportamiento clave

### 4.1 Flujo de una incidencia
```
detectada → pendiente ─┬─ aceptada ──→ (historial; reversible)
                       ├─ ignorada_una_vez
                       ├─ ignorada_proyecto
                       ├─ añadida_diccionario
                       ├─ editada_manual
                       └─ auto_aplicada  (solo si modo auto activo)
```
Cada transición se registra como **decisión** (para el informe y, si hay opt-in, para el aprendizaje).

### 4.2 Procesamiento incremental
1. El adaptador emite `blockChanged(blockId)` (evento del host o *polling* de hash cada 1 s si el host no tiene eventos).
2. *Debounce* de 400 ms mientras el usuario escribe → no se analiza a mitad de palabra.
3. Si el `hash` está en caché → se reutilizan las incidencias (se desplazan offsets si solo cambió la posición).
4. Se analiza solo el párrafo modificado; las reglas de contexto (mayúscula tras punto) miran también la última frase del párrafo anterior.
5. Prioridad de la cola: bloque seleccionado > visible en pantalla > resto del documento. El análisis completo inicial se hace en segundo plano y en lotes de 50 ms para no bloquear la UI.

### 4.3 Respeto a estilos tipográficos
- El texto se analiza **en su forma lógica**: si una capa usa *All Caps* / *Small Caps* forzado, el texto real "Hola mundo" se revisa como tal, aunque se vea "HOLA MUNDO".
- Si el texto **está escrito** en mayúsculas (no forzado) → se desactivan las reglas de mayúsculas, se baja la confianza ortográfica (se pierde información de acentuación) y, si falta una tilde en mayúscula (*CANCION*), se marca con explicación: "La RAE indica que las mayúsculas llevan tilde".
- Tracking, kerning, leading y OpenType **no se tocan nunca**. La corrección se escribe dentro del *run* existente.
- **Intención ambigua** → no se propone corrección, se pregunta: p. ej. *"tEXTO"* con tracking amplio en un logotipo, o comillas rectas en una fuente monoespaciada (puede ser código). Opciones: "Es intencional (ignorar en este proyecto)" / "Revisar".

### 4.4 Garantía de "sin reflow inesperado"
Antes de aplicar:
1. Se mide el estado: nº de líneas, desbordamiento, *bounding box* del bloque y de los marcos enlazados.
2. Se aplica en una transacción (InDesign `doScript` con `UndoModes.ENTIRE_SCRIPT`, Figma con una única operación, etc.).
3. Se vuelve a medir. Si algo cambió más allá de la tolerancia y la incidencia **no** estaba marcada como crítica:
   se deshace, se reclasifica como crítica y se pide confirmación al usuario con la vista previa.
4. La vista previa (sin aplicar) muestra la frase corregida y, si el impacto es crítico, el aviso "Esta corrección añade una línea".

Cada aplicación es una entrada del historial y un único paso de *deshacer* del host.

---

## 5. Endpoints

El núcleo local y el servicio en la nube exponen **el mismo contrato** (en local, como
llamadas en proceso o un servidor HTTP en `127.0.0.1`), de modo que la UI no distingue
el origen salvo por el campo `fuente`.

Base: `https://api.<proveedor>/v1` (nube) o `http://127.0.0.1:<puerto>/v1` (local).

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/check` | Analiza uno o varios bloques. Cuerpo: `{ documento, bloques[], opciones }`. Devuelve `RespuestaRevision` (ver esquema). |
| `POST` | `/check/incremental` | Igual que `/check` pero recibe `{ bloqueId, hashAnterior, texto, runs }` y devuelve solo el delta (incidencias nuevas, resueltas, desplazadas). |
| `POST` | `/detect-language` | `{ texto }` → `[{ idioma, probabilidad }]`. |
| `GET` | `/languages` | Idiomas y variantes disponibles, con indicación de si hay diccionario offline. |
| `POST` | `/preview` | `{ bloqueId, incidenciaId }` → texto corregido + métricas de reflow previstas (sin aplicar). |
| `GET/PUT/DELETE` | `/projects/{id}/dictionary[/{palabra}]` | Diccionario del proyecto. |
| `GET/PUT` | `/projects/{id}/ignore` | Lista de "ignorar siempre". |
| `GET/PUT` | `/projects/{id}/rules` | Reglas de estilo del proyecto/equipo (ver `ReglasEstilo` en el esquema). |
| `POST` | `/projects/{id}/decisions` | Registra decisiones (lote). |
| `GET` | `/projects/{id}/history` · `POST /projects/{id}/history/{entradaId}/revert` | Historial y reversión. |
| `POST` | `/projects/{id}/reports` | `{ formato: "pdf" \| "csv", filtros }` → archivo del informe. |
| `POST` | `/consent/preview` *(solo nube, se ejecuta en local)* | Devuelve exactamente el texto (anonimizado o no) que se enviaría, para mostrarlo al usuario. |

Reglas comunes: autenticación por token de equipo (nube), `Idempotency-Key` en escrituras,
versión de reglas en cada respuesta (`versionReglas`) para invalidar cachés, límite de 50 bloques
o 64 KB por petición.

### 5.1 Servicios y diccionarios recomendados

| Necesidad | Recomendación | Licencia / notas |
| --- | --- | --- |
| Ortografía offline | **Hunspell** vía `nspell` (JS) o `hunspell` compilado a WASM con diccionarios de **LibreOffice** (`es_ES`, `es_MX`, `es_AR`, …, `en_US`, `en_GB`, `fr_FR`, `pt_BR`, `de_DE`) | Diccionarios es_* del proyecto RLA-ES (GPL/LGPL/MPL); revisar compatibilidad con la licencia del plugin. |
| Gramática, puntuación, tipografía | **LanguageTool**: servidor propio (Java, autoalojable, `POST /v2/check`) para nube privada; API pública/premium como alternativa | LGPL; el autoalojamiento evita sacar texto de clientes fuera de la infraestructura propia. |
| Detección de idioma | **fastText `lid.176.ftz`** (≈ 1 MB, offline) o **CLD3**; *fallback* al idioma asignado en el estilo de párrafo del host | Bloques < 20 caracteres: usar el idioma del estilo, no el detector. |
| Separación silábica (guionación) | Patrones **TeX/Hyphenation** (`hyph-es`) | Solo para validar reglas de guionación del equipo; nunca se cambia la guionación del host. |
| Referencia normativa | Diccionario de la RAE / Fundéu como **enlaces** en la explicación | La RAE no ofrece una API pública abierta; no basar el plugin en *scraping*. |
| Nube con modelos de lenguaje *(opcional)* | Un LLM para explicaciones y casos de confianza mediana, siempre tras el motor de reglas | Solo con consentimiento; nunca como única fuente de detección (no es determinista). |

---

## 6. Privacidad y seguridad
- **Local por defecto.** El modo nube está desactivado hasta que el usuario lo active por proyecto.
- **Consentimiento por envío o por sesión**, con la vista exacta del texto que sale (`/consent/preview`). Nunca se envían metadatos de archivo (rutas, nombres de cliente) salvo que se pida.
- **Anonimización** antes de enviar: emails, teléfonos, URL, números largos, nombres del diccionario del proyecto y entidades detectadas se sustituyen por marcadores (`⟦EMAIL_1⟧`) y se restauran a la vuelta. Los offsets se remapean.
- Transporte TLS 1.2+; el servicio en la nube **no guarda** texto (retención 0) y lo declara en la respuesta (`retencion: "ninguna"`).
- Los datos de aprendizaje se guardan en el proyecto/equipo, cifrados en reposo, exportables y borrables ("Olvidar lo aprendido").
- Un administrador de equipo puede bloquear la nube para todos los proyectos.

---

## 7. Personalización
`ReglasEstilo` (en el esquema) cubre: capitalización de títulos (`oracion` / `titulo` / `libre`),
estilo de comillas, uso de raya/semirraya, abreviaturas permitidas, palabras protegidas (marcas
con capitalización especial: *iPhone*, *eBay*), idiomas del proyecto, tolerancia de reflow,
espacio fino ante signos en francés y política de guionación (mín. caracteres antes/después, no
partir nombres propios). Las reglas se heredan: **equipo → proyecto → documento**.

Aprendizaje adaptativo (opt-in): si en un proyecto el usuario ignora la misma sugerencia 3 veces,
su confianza baja un nivel para ese proyecto; si acepta 5 veces la misma corrección, puede pasar
a "alta". Todo es local y reversible.

---

## 8. Criterios de aceptación (versión verificable)

| Criterio | Métrica | Cómo se mide |
| --- | --- | --- |
| Precisión ortográfica en español | precision ≥ 95 %, recall ≥ 90 % | Corpus de prueba (ver `pruebas.md` §4), con errores reales y texto correcto de diseño |
| Falsos positivos | ≤ 2 / 1000 palabras en texto correcto | Mismo corpus, solo la parte correcta |
| Latencia | p95 < 300 ms por bloque (local), "archivo medio" según A2 | Banco de pruebas en un equipo de referencia (8 GB RAM, CPU de 4 núcleos) en cada host |
| Sin reflow inesperado | 0 cambios de flujo no anunciados en 1000 aplicaciones | Prueba de integración que aplica todas las sugerencias y compara las métricas antes/después |
| Sin alteración de estilos | 0 diferencias en tracking/kerning/leading/fuente/caps tras aplicar | Comparación de atributos de *runs* antes/después |
| Auto-aplicar seguro | Nunca se aplica fuera de alta × bajo | Prueba de propiedad sobre el clasificador |

## 9. Plan por fases
1. **MVP (Figma + InDesign):** ortografía + espaciado + comillas, local, panel, aceptar/ignorar/diccionario, historial.
2. **v1:** Illustrator + Photoshop, reglas de equipo, informes PDF/CSV, medición de reflow, componentes.
3. **v1.5:** nube opt-in (LanguageTool autoalojado), anonimización, aprendizaje adaptativo.
4. **v2:** Affinity (según SDK), OCR de texto en contornos.
