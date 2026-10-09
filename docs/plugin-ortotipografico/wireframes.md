# Wireframes del panel de sugerencias

Ancho de referencia del panel: 300 px (mín. 260 px). Los colores de nivel siempre van
acompañados de texto o icono (accesibilidad: no depender solo del color).

Leyenda: `●` crítico · `◐` medio · `○` bajo · `▲▲▲` confianza alta · `▲▲` mediana · `▲` baja

---

## 1. Panel lateral — vista de lista (estado por defecto)

```
┌────────────────────────────────────┐
│ Ortotipografía            ⚙  ⋯     │
│ ● Local · Español (España) ▾       │  ← origen del análisis + idioma (clic: cambiar)
├────────────────────────────────────┤
│ 🔍 Buscar en incidencias…          │
│ [Todas 14] [Críticas 2] [Ortog.]   │  ← chips de filtro (tipo, impacto,
│ [Puntuación] [Tipografía] [+]      │     confianza, capa, página)
│ Ordenar: Posición ▾   Agrupar: Capa│
├────────────────────────────────────┤
│ ▾ Pág. 4 · Texto intro        (3)  │
│ ┌────────────────────────────────┐ │
│ │ ○ ▲▲▲  Espaciado               │ │  ← seleccionada (foco teclado)
│ │ «otoño ,» → «otoño,»           │ │
│ │ En español no se escribe       │ │
│ │ espacio antes de la coma.      │ │
│ │ Vista previa:                  │ │
│ │ …de otoño, ya disponible       │ │
│ │ [Aceptar ⏎] [Ignorar] [ ⋯ ]    │ │
│ └────────────────────────────────┘ │
│   ◐ ▲▲  Ortografía  sesión/cesión  │  ← filas compactas
│   ○ ▲▲▲ Comillas  "Hola" → «Hola»  │
│ ▾ Maestra A · Cabecera marca  (1)  │
│   ● ▲   Ortografía  AcmeCo  ⚠ 12   │  ← ⚠ 12 = instancias afectadas
├────────────────────────────────────┤
│ 14 pendientes · 3 aceptadas        │
│ [Aceptar todas las seguras (5)]    │  ← solo alta × bajo; pide confirmación
│ Historial ↶   Exportar informe ⤓   │
└────────────────────────────────────┘
```

Menú `⋯` de una incidencia:
```
┌──────────────────────────────────┐
│ Ignorar una vez              I   │
│ Ignorar siempre en el proyecto ⇧I│
│ Añadir al diccionario del proy. D│
│ Editar en línea              E   │
│ Ver en el lienzo             L   │
│ Cambiar idioma del bloque…       │
│ ¿Por qué? (ver norma) ↗          │
└──────────────────────────────────┘
```

## 2. Incidencia de impacto crítico (confirmación con vista previa de reflow)

```
┌────────────────────────────────────┐
│ ● ▲▲  Comillas · Impacto crítico   │
│ "Diseño que respira"               │
│   → «Diseño que respira»           │
│ ┌────────── Vista previa ────────┐ │
│ │ Antes   ▕Diseño que respira"▏  │ │
│ │ Después ▕«Diseño que respira▏  │ │
│ │         ▕»                  ▏  │ │
│ └────────────────────────────────┘ │
│ ⚠ Este cambio añade 1 línea al     │
│   titular.                         │
│ [Aplicar igualmente] [Editar]      │
│ [Ignorar]                          │
└────────────────────────────────────┘
```

## 3. Intención ambigua (pregunta en lugar de sugerir)

```
┌────────────────────────────────────┐
│ ? Estilo · Necesita tu decisión    │
│ «tEXTO» en «Logo principal»        │
│ Las mayúsculas parecen invertidas, │
│ pero puede ser intencional.        │
│ ( ) Es intencional — no volver a   │
│     preguntar en este proyecto     │
│ ( ) Corregir a «Texto»             │
│ [Confirmar]                        │
└────────────────────────────────────┘
```

## 4. Edición en línea

```
│ ○ ▲▲  Ortografía                   │
│ ┌────────────────────────────────┐ │
│ │ exepcional|                    │ │  ← campo editable, sugerencias debajo
│ └────────────────────────────────┘ │
│  excepcional · exponencial         │
│ [Aplicar ⏎]  [Cancelar Esc]        │
```

## 5. Subrayado en lienzo (opcional, desactivado en modo no intrusivo)

```
   La colección de otoño , ya disponible en
                       ‾‾‾                      ← subrayado punteado fino (no imprime)
                  ┌─────────────────────────┐
                  │ «otoño,» · Confianza    │   ← tooltip al pasar el ratón
                  │ alta   [Aceptar] [⋯]    │
                  └─────────────────────────┘
```
Opciones: color del subrayado por tipo, mostrar solo críticas, ocultar en modo
presentación. El subrayado es una superposición del plugin, nunca un atributo del texto.

## 6. Consentimiento para la nube

```
┌───────────────────────────────────────────┐
│ Revisar en la nube                        │
│ Se enviará este texto (412 palabras):     │
│ ┌───────────────────────────────────────┐ │
│ │ La colección de otoño, ya disponible  │ │
│ │ en ⟦URL_1⟧. Escríbenos a ⟦EMAIL_1⟧…   │ │  ← texto exacto, ya anonimizado
│ └───────────────────────────────────────┘ │
│ ☑ Anonimizar datos personales y marcas    │
│ ☐ Recordar para esta sesión               │
│ No se guarda el texto en el servidor.     │
│ [Cancelar]            [Enviar y revisar]  │
└───────────────────────────────────────────┘
```

## 7. Revisión al finalizar la sesión (modo no intrusivo)

```
┌───────────────────────────────────────────┐
│ Resumen de la sesión                      │
│ Revisamos 38 bloques modificados.         │
│  ● 2 críticas   ◐ 4 medias   ○ 8 bajas    │
│ [Revisar ahora]  [Más tarde]  [Informe ⤓] │
└───────────────────────────────────────────┘
```
Se muestra al guardar/exportar o al cerrar el documento, nunca durante la escritura.

## 8. Historial

```
┌────────────────────────────────────┐
│ Historial                    ✕     │
│ 17:42  «otoño ,» → «otoño,»   ↶    │
│ 17:40  + AcmeCo al diccionario ↶   │
│ 17:38  Ignorada: «Lorem»       ↶   │
│ [Revertir todo desde…]             │
└────────────────────────────────────┘
```

## 9. Atajos de teclado (con el panel enfocado)

| Acción | Atajo |
| --- | --- |
| Siguiente / anterior incidencia | `J` / `K` (o `↓` / `↑`) |
| Aceptar | `Enter` |
| Aceptar con la 2.ª/3.ª sugerencia | `2` / `3` |
| Ignorar una vez / siempre | `I` / `Shift+I` |
| Añadir al diccionario | `D` |
| Editar en línea | `E` |
| Ver en el lienzo | `L` |
| Deshacer última corrección del plugin | `Ctrl/Cmd+Alt+Z` |
| Abrir/cerrar panel | `Ctrl/Cmd+Alt+Shift+O` (configurable) |

Los atajos de una sola tecla solo actúan con el foco en el panel, para no chocar con
las herramientas del host (`I` = cuentagotas, `E` = borrador…).
