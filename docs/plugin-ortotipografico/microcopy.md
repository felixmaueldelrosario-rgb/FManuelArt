# Microcopy en español

Tono: claro, breve, de colega experto. Se tutea. Se evita culpar ("Has cometido un error")
y se evita la jerga técnica ("token", "regex"). Variables entre `{llaves}`.
Las comillas del propio microcopy siguen el estilo del proyecto (por defecto, angulares).

## 1. Sugerencias (tarjeta y subrayado)

| Clave | Texto |
| --- | --- |
| `sugerencia.titulo` | Sugerencia: «{original}» → «{sugerencia}». Confianza {nivel}. |
| `sugerencia.vistaPrevia` | Vista previa |
| `sugerencia.varias` | ¿Querías decir «{s1}», «{s2}» o «{s3}»? |
| `sugerencia.sinSugerencia` | No la encontramos en el diccionario. ¿Es correcta? |
| `sugerencia.pregunta` | Puede ser intencional. ¿Lo corregimos? |
| `nivel.confianza.alta` / `mediana` / `baja` | alta / media / baja |
| `nivel.impacto.critico` / `medio` / `bajo` | Impacto crítico / Impacto medio / Impacto bajo |

## 2. Explicaciones por tipo (1–2 frases)

| Tipo | Texto |
| --- | --- |
| ortografia | «{original}» no está en el diccionario de {idioma}. Lo más probable es «{sugerencia}». |
| tecla_adyacente | Parece una tecla vecina pulsada por error: «{original}» → «{sugerencia}». |
| mayusculas (inicio) | Después de punto, la frase empieza con mayúscula. |
| mayusculas (meses, es) | En español, los meses y los días de la semana se escriben con minúscula. |
| mayusculas (tilde) | Las mayúsculas también llevan tilde: «{sugerencia}». |
| puntuacion (apertura) | En español, las preguntas y exclamaciones llevan signo de apertura: «¿», «¡». |
| puntuacion (doble) | Hay dos signos seguidos. ¿Querías poner uno solo o puntos suspensivos («…»)? |
| espaciado (antes) | En {idioma} no se escribe espacio antes de «{signo}». |
| espaciado (frances) | En francés, «{signo}» lleva un espacio fino delante. |
| espaciado (doble) | Hay dos espacios seguidos. |
| guiones (rango) | Para rangos se usa semirraya: «{sugerencia}». |
| guiones (inciso) | Los incisos se marcan con raya (—), no con guion. |
| comillas | Este proyecto usa comillas {estiloComillas}: «{sugerencia}». |

## 3. Acciones (botones y menús)

| Clave | Texto |
| --- | --- |
| `accion.aceptar` | Aceptar |
| `accion.aceptarIgualmente` | Aplicar igualmente |
| `accion.ignorarUnaVez` | Ignorar una vez |
| `accion.ignorarSiempre` | Ignorar siempre en este proyecto |
| `accion.anadirDiccionario` | Añadir al diccionario del proyecto |
| `accion.editar` | Editar |
| `accion.verLienzo` | Ver en el lienzo |
| `accion.porQue` | ¿Por qué? |
| `accion.aceptarSeguras` | Aceptar las seguras ({n}) |
| `accion.revertir` | Revertir |
| `accion.exportar` | Exportar informe |

## 4. Confirmaciones (toasts discretos, 3 s, con «Deshacer»)

| Clave | Texto |
| --- | --- |
| `toast.aplicada` | Corregido: «{sugerencia}». · Deshacer |
| `toast.diccionario` | Añadido al diccionario del proyecto: {palabra} · Deshacer |
| `toast.ignorada` | Ignoraremos «{palabra}» en este proyecto. · Deshacer |
| `toast.seguras` | {n} correcciones seguras aplicadas. · Deshacer |
| `toast.revertida` | Corrección revertida. |
| `toast.idioma` | Idioma del bloque cambiado a {idioma}. |
| `toast.informe` | Informe exportado: {archivo} |

## 5. Avisos de impacto y reflow

| Clave | Texto |
| --- | --- |
| `aviso.lineaMas` | Este cambio añade {n} línea al texto. |
| `aviso.desborda` | Este cambio hace que el texto desborde el marco. |
| `aviso.ancho` | El texto se ensancha {delta} pt. |
| `aviso.maestro` | Está en un componente maestro: el cambio afecta a {n} instancias. |
| `aviso.override` | Esta instancia tiene texto propio. ¿Corregir en el maestro? |
| `aviso.reflowInesperado` | Deshicimos el cambio porque movía el texto. Revísalo antes de aplicarlo. |
| `aviso.contornos` | {n} textos convertidos en contornos no se pudieron revisar. |
| `aviso.lorem` | Hay texto de relleno (lorem ipsum) en {n} capas. |

## 6. Estados del panel

| Clave | Texto |
| --- | --- |
| `estado.analizando` | Revisando… |
| `estado.limpio` | Todo en orden. No hay incidencias pendientes. |
| `estado.filtroVacio` | Nada con estos filtros. [Quitar filtros] |
| `estado.sinTexto` | Este documento no tiene texto editable. |
| `estado.offline` | Sin conexión: seguimos revisando con los diccionarios locales. |
| `estado.diccionarioFalta` | No hay diccionario local de {idioma}. [Descargar ({tamano})] |
| `estado.resumen` | Revisamos {n} bloques modificados. |
| `estado.resumenAccion` | Revisar ahora · Más tarde |

## 7. Privacidad y consentimiento

| Clave | Texto |
| --- | --- |
| `nube.titulo` | Revisar en la nube |
| `nube.cuerpo` | Se enviará este texto ({n} palabras). Revisa lo que sale de tu equipo. |
| `nube.anonimizar` | Anonimizar datos personales y marcas |
| `nube.recordar` | Recordar durante esta sesión |
| `nube.retencion` | No guardamos el texto en el servidor. |
| `nube.enviar` | Enviar y revisar |
| `nube.bloqueada` | Tu equipo ha desactivado la revisión en la nube. |
| `aprendizaje.optin` | ¿Aprender de tus decisiones en este proyecto? Se guarda solo en tu equipo y puedes borrarlo cuando quieras. |
| `aprendizaje.olvidar` | Olvidar lo aprendido |

## 8. Errores

| Clave | Texto |
| --- | --- |
| `error.aplicar` | No pudimos aplicar el cambio. El texto no se ha modificado. [Reintentar] |
| `error.fuente` | Falta la fuente {fuente}. Instálala para poder corregir este texto. |
| `error.bloqueada` | La capa está bloqueada. Desbloquéala para corregirla. |
| `error.nube` | La revisión en la nube no responde. Usamos los resultados locales. |
