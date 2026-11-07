// Motor de corrección ortotipográfica.
// No depende de ningún programa: recibe texto y devuelve incidencias con el
// formato de docs/plugin-ortotipografico/incidencia.schema.json. Lo usan el
// panel de Adobe y cualquier otro programa (p. ej. Mister Designer).

import nspell from 'nspell';

const LETRA = 'A-Za-zÀ-ÖØ-öø-ÿĀ-ž';
const RE_PALABRA = new RegExp(`[${LETRA}]+(?:['’][${LETRA}]+)*`, 'g');

const MESES_DIAS = new Set([
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'setiembre', 'octubre', 'noviembre', 'diciembre',
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
]);

const STOP_ES = new Set(['de', 'la', 'que', 'el', 'en', 'los', 'se', 'del', 'las', 'por', 'un', 'una', 'con', 'para', 'es', 'y', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'nuestra', 'nuestro', 'tu', 'tus']);
const STOP_EN = new Set(['the', 'of', 'and', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'by', 'not', 'but', 'what', 'all', 'your', 'our', 'we', 'can', 'new', 'now']);

// Teclado QWERTY español: filas para detectar teclas vecinas.
const FILAS = ['1234567890', 'qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];
const POS = {};
FILAS.forEach((fila, f) => [...fila].forEach((c, i) => { POS[c] = [f, i]; }));

export const REGLAS_POR_DEFECTO = {
  comillas: 'angulares', // 'angulares' «» · 'inglesas' “” · 'libre' (no revisar)
  rangosConSemirraya: true,
  puntosSuspensivos: true,
  cuerpoTitularPt: 36,
  autoAplicar: false,
};

const EXPLICACION = {
  ortografia: (o, s) => s ? `«${o}» no está en el diccionario. Lo más probable es «${s}».` : `«${o}» no está en el diccionario. Si es correcta (una marca, un nombre), añádela al diccionario del proyecto.`,
  tecla_adyacente: (o, s) => `Parece una tecla vecina pulsada por error: «${o}» → «${s}».`,
};

const norm = (s) => s.normalize('NFC');

function teclasVecinas(a, b) {
  const pa = POS[a], pb = POS[b];
  if (!pa || !pb) return false;
  return Math.abs(pa[0] - pb[0]) <= 1 && Math.abs(pa[1] - pb[1]) <= 1;
}

// ¿«sugerencia» se obtiene de «original» cambiando una sola letra por una tecla vecina?
function esTeclaAdyacente(original, sugerencia) {
  const a = original.toLowerCase(), b = sugerencia.toLowerCase();
  if (a.length !== b.length) return false;
  let difs = 0, vecina = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) { difs++; vecina = teclasVecinas(a[i], b[i]); }
  }
  return difs === 1 && vecina;
}

function distancia(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

function igualarMayusculas(modelo, palabra) {
  if (modelo === modelo.toUpperCase() && modelo.length > 1) return palabra.toUpperCase();
  if (modelo[0] === modelo[0].toUpperCase()) return palabra[0].toUpperCase() + palabra.slice(1);
  return palabra;
}

const nivel = (p) => (p >= 0.85 ? 'alta' : p >= 0.55 ? 'mediana' : 'baja');

/** Detecta si un bloque está en español o inglés por palabras frecuentes. */
export function detectarIdioma(texto, porDefecto = 'es') {
  const palabras = (norm(texto).toLowerCase().match(RE_PALABRA) || []);
  if (palabras.length < 3) return { codigo: porDefecto, origen: 'estilo_host' };
  let es = 0, en = 0;
  for (const p of palabras) { if (STOP_ES.has(p)) es++; if (STOP_EN.has(p)) en++; }
  if (/[ñáéíóú¿¡]/i.test(texto)) es += 2;
  if (es === en) return { codigo: porDefecto, origen: 'estilo_host' };
  const total = es + en;
  return { codigo: es > en ? 'es' : 'en', origen: 'detectado', probabilidad: Math.round((Math.max(es, en) / total) * 100) / 100 };
}

/**
 * Crea un corrector.
 * @param {object} diccionarios  { es: {aff, dic}, en: {aff, dic} } (Buffer o string)
 */
export function crearCorrector(diccionarios) {
  const spell = {};
  for (const [idioma, d] of Object.entries(diccionarios)) spell[idioma] = nspell(d.aff, d.dic);
  const cacheSug = new Map();

  function sugerir(idioma, palabra) {
    const k = idioma + ':' + palabra;
    if (!cacheSug.has(k)) cacheSug.set(k, spell[idioma].suggest(palabra).slice(0, 5));
    return cacheSug.get(k);
  }

  function correcta(idioma, palabra) {
    const s = spell[idioma];
    if (s.correct(palabra)) return true;
    // «Enero» al inicio de frase o en un titular: también vale en minúscula.
    const minus = palabra.toLowerCase();
    return palabra !== minus && palabra[0] === palabra[0].toUpperCase() && palabra.slice(1) === palabra.slice(1).toLowerCase() && s.correct(minus);
  }

  /**
   * Revisa un bloque de texto.
   * @param {string} texto
   * @param {object} opciones { idioma?, reglas?, diccionarioProyecto?: string[], ignorados?: string[] }
   * @returns {{idioma, incidencias: object[]}}
   */
  function revisar(texto, opciones = {}) {
    texto = norm(texto);
    const reglas = { ...REGLAS_POR_DEFECTO, ...(opciones.reglas || {}) };
    const idioma = opciones.idioma ? { codigo: opciones.idioma, origen: 'manual' } : detectarIdioma(texto);
    const lang = spell[idioma.codigo] ? idioma.codigo : Object.keys(spell)[0];
    const propias = new Set((opciones.diccionarioProyecto || []).map((p) => p.toLowerCase()));
    const ignorados = new Set(opciones.ignorados || []);
    const incidencias = [];

    const anadir = (inc) => {
      const clave = `${inc.reglaId}:${inc.original}`;
      if (ignorados.has(clave) || ignorados.has(inc.original)) return;
      if (incidencias.some((o) => inc.inicio < o.fin && o.inicio < inc.fin)) return; // no solapar
      inc.confianza = { nivel: nivel(inc.puntuacion), puntuacion: inc.puntuacion };
      delete inc.puntuacion;
      inc.clave = clave;
      incidencias.push(inc);
    };

    // --- Reglas tipográficas (antes que la ortografía: son más seguras) ---
    const regex = (re, fn) => { for (const m of texto.matchAll(re)) fn(m); };

    // Espacio antes de signo de cierre.
    regex(/([^\s])( +)([,.;:!?)\]»”])/g, (m) => {
      const inicio = m.index + m[1].length;
      anadir({ tipo: 'espaciado', reglaId: 'ESPACIO_ANTES_SIGNO', inicio, fin: inicio + m[2].length, original: m[2], sugerencias: [''], puntuacion: 0.97,
        explicacion: `No se escribe espacio antes de «${m[3]}».` });
    });
    // Espacio después de signo de apertura.
    regex(/([(\[«“¿¡])( +)(?=\S)/g, (m) => {
      const inicio = m.index + 1;
      anadir({ tipo: 'espaciado', reglaId: 'ESPACIO_TRAS_APERTURA', inicio, fin: inicio + m[2].length, original: m[2], sugerencias: [''], puntuacion: 0.95,
        explicacion: `No se escribe espacio después de «${m[1]}».` });
    });
    // Espacios dobles.
    regex(/(?<=\S)( {2,})(?=\S)/g, (m) => {
      anadir({ tipo: 'espaciado', reglaId: 'ESPACIO_DOBLE', inicio: m.index, fin: m.index + m[1].length, original: m[1], sugerencias: [' '], puntuacion: 0.95,
        explicacion: 'Hay espacios de más entre dos palabras.' });
    });
    // Signos repetidos: ",," "!!" ".." (pero no "...").
    regex(/(?<!\.)\.\.(?!\.)|,,+|;;+|::+/g, (m) => {
      const s = m[0][0] === '.' ? ['.', '…'] : [m[0][0]];
      anadir({ tipo: 'puntuacion', reglaId: 'SIGNO_DOBLE', inicio: m.index, fin: m.index + m[0].length, original: m[0], sugerencias: s, puntuacion: 0.9,
        explicacion: 'Hay dos signos seguidos. ¿Querías poner uno solo?' });
    });
    if (reglas.puntosSuspensivos) {
      regex(/(?<!\.)\.\.\.(?!\.)/g, (m) => {
        anadir({ tipo: 'puntuacion', reglaId: 'PUNTOS_SUSPENSIVOS', inicio: m.index, fin: m.index + 3, original: '...', sugerencias: ['…'], puntuacion: 0.7,
          explicacion: 'Los puntos suspensivos tipográficos (…) son un solo carácter y no se separan al final de línea.' });
      });
    }
    // Comillas rectas → tipográficas.
    if (reglas.comillas !== 'libre') {
      const [a, c] = reglas.comillas === 'inglesas' ? ['“', '”'] : ['«', '»'];
      regex(/"([^"\n]{1,200})"/g, (m) => {
        if (/\d$/.test(texto.slice(0, m.index))) return; // 5" (pulgadas)
        anadir({ tipo: 'comillas', reglaId: 'COMILLAS_RECTAS', inicio: m.index, fin: m.index + m[0].length, original: m[0], sugerencias: [a + m[1] + c], puntuacion: 0.8,
          explicacion: reglas.comillas === 'inglesas' ? 'Este proyecto usa comillas inglesas tipográficas: “ ”.' : 'En español se prefieren las comillas angulares: « ».' });
      });
    }
    // Rangos numéricos con guion → semirraya.
    if (reglas.rangosConSemirraya) {
      regex(/\b(\d{1,4})-(\d{1,4})\b/g, (m) => {
        if (Number(m[2]) <= Number(m[1]) && m[2].length === m[1].length) return; // códigos tipo 08-01
        const inicio = m.index + m[1].length;
        anadir({ tipo: 'guiones', reglaId: 'RANGO_SEMIRRAYA', inicio, fin: inicio + 1, original: '-', sugerencias: ['–'], puntuacion: 0.6,
          explicacion: 'En rangos de números se usa la semirraya (–), no el guion.' });
      });
    }

    // --- Fórmulas promocionales: «válido hasta agotar existencias» ---
    // «balido» y «valido» existen, así que el diccionario no los marca: hace falta el contexto.
    if (lang === 'es') {
      regex(new RegExp(`\\b(balido|valido|válido)(\\s+hasta\\s+agotar\\s+)(existencias?)(?![${LETRA}])`, 'gi'), (m) => {
        const [, palabra, medio, existencias] = m;
        if (palabra.toLowerCase() !== 'válido') {
          anadir({ tipo: 'ortografia', reglaId: 'PROMOCION_VALIDO_HASTA_AGOTAR', inicio: m.index, fin: m.index + palabra.length, original: palabra,
            sugerencias: [igualarMayusculas(palabra, 'válido')], puntuacion: 0.8,
            explicacion: 'En esta fórmula promocional, «válido» expresa que la oferta está vigente y lleva tilde. Revisa la frase antes de aceptar.' });
        }
        if (existencias.toLowerCase() === 'existencia') {
          const inicio = m.index + palabra.length + medio.length;
          anadir({ tipo: 'ortografia', reglaId: 'PROMOCION_AGOTAR_EXISTENCIAS', inicio, fin: inicio + existencias.length, original: existencias,
            sugerencias: [igualarMayusculas(existencias, 'existencias')], puntuacion: 0.7,
            explicacion: 'Si te refieres a las unidades disponibles de un producto, la fórmula habitual es «hasta agotar existencias». Confirma que ese sea el sentido.' });
        }
      });
    }

    // --- Frases: apertura de ¿ ¡ y mayúscula inicial ---
    if (lang === 'es') {
      regex(/[^.!?\n]*[?!]/g, (m) => {
        const frase = m[0];
        const cierre = frase[frase.length - 1];
        const apertura = cierre === '?' ? '¿' : '¡';
        if (frase.includes(apertura)) return;
        const lead = frase.match(/^\s*/)[0].length;
        if (lead === frase.length - 1) return;
        const inicio = m.index + lead;
        // Solo la primera palabra: así no tapa otras incidencias de la frase.
        const primera = frase.slice(lead).match(/^\S+/)[0];
        anadir({ tipo: 'puntuacion', reglaId: 'FALTA_APERTURA', inicio, fin: inicio + primera.length, original: primera, sugerencias: [apertura + primera], puntuacion: 0.75,
          explicacion: `En español, las ${cierre === '?' ? 'preguntas' : 'exclamaciones'} llevan signo de apertura: «${apertura}».` });
      });
    }
    regex(new RegExp(`((?<!\\.)[.!?]\\s+)([${LETRA}])`, 'g'), (m) => {
      const letra = m[2];
      if (letra !== letra.toLowerCase() || letra === letra.toUpperCase()) return;
      const inicio = m.index + m[1].length;
      const palabra = texto.slice(inicio).match(RE_PALABRA)[0];
      if (texto.slice(0, m.index + 1).match(/\b(etc|p\. ej|pág|núm|aprox|sr|sra|dr|dra)\.$/i)) return;
      anadir({ tipo: 'mayusculas', reglaId: 'MAYUSCULA_INICIAL', inicio, fin: inicio + palabra.length, original: palabra, sugerencias: [letra.toUpperCase() + palabra.slice(1)], puntuacion: 0.7,
        explicacion: 'Después de punto, la frase empieza con mayúscula.' });
    });

    // --- Ortografía palabra a palabra ---
    for (const m of texto.matchAll(RE_PALABRA)) {
      const palabra = m[0], inicio = m.index, fin = inicio + palabra.length;
      const minus = palabra.toLowerCase();
      if (propias.has(minus)) continue;
      const antes = texto.slice(Math.max(0, inicio - 1), inicio), despues = texto[fin] || '';
      if (/[@/\\._\d-]/.test(antes) || /[@\d_]/.test(despues) || (despues === '.' && /^[a-z]{2,}$/.test(texto.slice(fin + 1, fin + 4)))) continue; // correo, URL, código
      const todoMayus = palabra === palabra.toUpperCase();
      if (todoMayus && palabra.length <= 5) continue; // siglas: ONU, PDF
      const capInterna = /[a-zñ][A-ZÑ]/.test(palabra); // iPhone, AcmeCo: probablemente marca

      // Meses y días con mayúscula en mitad de frase (español).
      if (lang === 'es' && MESES_DIAS.has(minus) && palabra[0] !== minus[0] && !todoMayus) {
        const previo = texto.slice(0, inicio).trimEnd();
        if (previo && !/[.!?¡¿:«"“\n]$/.test(previo)) {
          anadir({ tipo: 'mayusculas', reglaId: 'MES_DIA_MAYUSCULA', inicio, fin, original: palabra, sugerencias: [minus], puntuacion: 0.8,
            explicacion: 'En español, los meses y los días de la semana se escriben con minúscula.' });
        }
        continue;
      }

      if (correcta(lang, palabra)) continue;
      if (capInterna) {
        anadir({ tipo: 'ortografia', reglaId: 'DESCONOCIDA', inicio, fin, original: palabra, sugerencias: [], puntuacion: 0.3, explicacion: EXPLICACION.ortografia(palabra) });
        continue;
      }
      const base = todoMayus ? minus : palabra;
      const sugerencias = [...new Set(sugerir(lang, base).map((s) => igualarMayusculas(palabra, s)))];
      if (!sugerencias.length) {
        anadir({ tipo: 'ortografia', reglaId: 'DESCONOCIDA', inicio, fin, original: palabra, sugerencias: [], puntuacion: 0.35, explicacion: EXPLICACION.ortografia(palabra) });
        continue;
      }
      const primera = sugerencias[0];
      const dist = distancia(palabra, primera);
      const soloTilde = primera.normalize('NFD').replace(/[̀-ͯ]/g, '') === palabra.normalize('NFD').replace(/[̀-ͯ]/g, '');
      let p = sugerencias.length === 1 ? 0.92 : dist === 1 ? 0.78 : 0.6;
      if (soloTilde) p = Math.max(p, sugerencias.length <= 2 ? 0.9 : 0.75);
      if (todoMayus) p -= 0.1;
      const tipo = esTeclaAdyacente(palabra, primera) ? 'tecla_adyacente' : 'ortografia';
      let explicacion = tipo === 'tecla_adyacente' ? EXPLICACION.tecla_adyacente(palabra, primera) : EXPLICACION.ortografia(palabra, primera);
      if (todoMayus && soloTilde) explicacion = `Las mayúsculas también llevan tilde: «${primera}».`;
      anadir({ tipo, reglaId: tipo === 'tecla_adyacente' ? 'TECLA_VECINA' : 'ORTOGRAFIA', inicio, fin, original: palabra, sugerencias, puntuacion: Math.round(p * 100) / 100, explicacion });
    }

    incidencias.sort((a, b) => a.inicio - b.inicio);
    for (const inc of incidencias) {
      inc.vistaPrevia = vistaPrevia(texto, inc);
    }
    return { idioma, incidencias };
  }

  return { revisar, idiomas: Object.keys(spell) };
}

/** Fragmento de contexto antes y después de aplicar la primera sugerencia. */
export function vistaPrevia(texto, inc, sugerencia = inc.sugerencias[0]) {
  const a = Math.max(0, inc.inicio - 30), b = Math.min(texto.length, inc.fin + 30);
  const pre = (a > 0 ? '…' : '') + texto.slice(a, inc.inicio);
  const post = texto.slice(inc.fin, b) + (b < texto.length ? '…' : '');
  return { antes: pre + inc.original + post, despues: sugerencia === undefined ? null : pre + sugerencia + post };
}

/**
 * Impacto en el diseño de aplicar una corrección.
 * @param {object} inc     incidencia
 * @param {object} capa    { cuerpoPt, tipoTexto: 'punto'|'area'|'trazado', estilosMixtos?, componente? }
 */
export function clasificarImpacto(inc, capa = {}, reglas = REGLAS_POR_DEFECTO) {
  const motivos = [];
  const delta = (inc.sugerencias[0] ?? inc.original).length - inc.original.length;
  if (capa.estilosMixtos) motivos.push('estilos_mixtos');
  if (capa.componente === 'maestro') motivos.push('componente_maestro');
  if (capa.tipoTexto === 'trazado') motivos.push('texto_en_trazado');
  if ((capa.cuerpoPt || 0) >= reglas.cuerpoTitularPt) motivos.push('logo_o_titular');
  if (delta !== 0) motivos.push('cambia_ancho');
  let nivelImpacto = 'bajo';
  if (motivos.some((m) => ['estilos_mixtos', 'componente_maestro', 'texto_en_trazado'].includes(m))) nivelImpacto = 'critico';
  else if (motivos.includes('logo_o_titular')) nivelImpacto = delta !== 0 ? 'critico' : 'medio';
  else if (Math.abs(delta) > 1 || (delta !== 0 && capa.tipoTexto === 'punto')) nivelImpacto = 'medio';
  if (!motivos.length) motivos.push('cuerpo');
  return { nivel: nivelImpacto, motivos };
}

/** Solo lo seguro se puede aplicar automáticamente. */
export const esAutoAplicable = (inc) => inc.confianza.nivel === 'alta' && inc.impacto?.nivel === 'bajo' && inc.sugerencias.length > 0;

/** Aplica una sugerencia sobre el texto (para vista previa o para programas sin estilos por rango). */
export const aplicar = (texto, inc, sugerencia = inc.sugerencias[0]) => texto.slice(0, inc.inicio) + sugerencia + texto.slice(inc.fin);

/**
 * Entrada única para integrar el motor en cualquier programa (p. ej. Mister Designer).
 * Recibe los bloques de texto del documento y devuelve una RespuestaRevision
 * según docs/plugin-ortotipografico/incidencia.schema.json.
 *
 * @param {ReturnType<typeof crearCorrector>} corrector
 * @param {{documentoId: string, host: string, bloques: Array<{id: string, texto: string, capa: {id: string, nombre: string, ruta?: string[], tipoTexto?: string}, estilo?: {cuerpoPt?: number, fuente?: string, caps?: string}, estilosMixtos?: boolean, componente?: string}>}} documento
 * @param {object} opciones  igual que corrector.revisar (+ reglas)
 */
export function revisarDocumento(corrector, documento, opciones = {}) {
  const reglas = { ...REGLAS_POR_DEFECTO, ...(opciones.reglas || {}) };
  const bloques = documento.bloques.map((b) => {
    const t0 = Date.now();
    const r = corrector.revisar(b.texto, opciones);
    const capa = { tipoTexto: b.capa.tipoTexto, cuerpoPt: b.estilo?.cuerpoPt, estilosMixtos: b.estilosMixtos, componente: b.componente };
    const incidencias = r.incidencias.map((inc) => {
      const impacto = clasificarImpacto(inc, capa, reglas);
      const salida = {
        id: `${b.id}:${inc.inicio}:${inc.reglaId}`,
        tipo: inc.tipo,
        reglaId: inc.reglaId,
        confianza: inc.confianza,
        impacto,
        original: inc.original,
        sugerencias: inc.sugerencias,
        requierePregunta: inc.sugerencias.length === 0,
        explicacion: inc.explicacion,
        vistaPrevia: inc.vistaPrevia.despues === null ? { antes: inc.vistaPrevia.antes, despues: inc.vistaPrevia.antes } : inc.vistaPrevia,
        metadatos: {
          host: documento.host,
          posicion: { inicio: inc.inicio, fin: inc.fin },
          capa: { id: b.capa.id, nombre: b.capa.nombre, ...(b.capa.ruta ? { ruta: b.capa.ruta } : {}), ...(b.capa.tipoTexto ? { tipoTexto: b.capa.tipoTexto } : {}) },
          ...(b.estilo ? { estilo: b.estilo } : {}),
        },
        estado: 'pendiente',
      };
      salida.autoAplicable = esAutoAplicable(salida);
      return salida;
    });
    return { bloqueId: b.id, hash: hashTexto(b.texto), idioma: r.idioma, latenciaMs: Date.now() - t0, incidencias };
  });
  return { version: '1.0', documentoId: documento.documentoId, versionReglas: 'motor-0.1.0', fuente: 'local', generadoEn: new Date().toISOString(), bloques };
}

/** Hash corto (FNV-1a) para saber si un bloque cambió desde la última revisión. */
export function hashTexto(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
