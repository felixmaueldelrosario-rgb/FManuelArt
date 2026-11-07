// Panel de Ortotipografía para Illustrator y Photoshop (CEP).
// Fuera de Adobe (abriendo index.html en un navegador) funciona en modo de
// prueba con un documento de ejemplo.

import { crearCorrector, clasificarImpacto, esAutoAplicable } from './motor.js';
import { version } from '../package.json';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Almacenamiento local (nunca imprescindible) ---------- */
const guardado = {
  leer(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  escribir(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
};

/* ---------- Conexión con el programa ---------- */
const cep = window.__adobe_cep__;
const modoPrueba = !cep;

function llamar(fn, ...args) {
  const lit = args.map((a) => JSON.stringify(a).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')).join(',');
  return new Promise((resolve, reject) => {
    cep.evalScript(`${fn}(${lit})`, (r) => {
      try { resolve(JSON.parse(r)); } catch { reject(new Error(r)); }
    });
  });
}

const hostAdobe = {
  documento: () => llamar('ot_documento'),
  leerTextos: () => llamar('ot_leerTextos'),
  aplicar: (id, inicio, fin, original, nuevo, permitirReflow) => llamar('ot_aplicar', id, inicio, fin, original, nuevo, !!permitirReflow),
  seleccionar: (id) => llamar('ot_seleccionar', id),
};

function crearHostPrueba() {
  const bloques = [
    { id: '1', nombre: 'Titular', ruta: ['Portada'], texto: 'Diseño que respira', cuerpoPt: 48, tipoTexto: 'punto', bloqueada: false, estilosMixtos: false, componente: null },
    { id: '2', nombre: 'Texto intro', ruta: ['Portada', 'Textos'], texto: 'La colección de otoño , ya disponible en tiendas. Piezas hechas a mano en Enero con materiales locales.\rPregunta por la edición limitada de AcmeCo.', cuerpoPt: 10, tipoTexto: 'area', bloqueada: false, estilosMixtos: false, componente: null },
    { id: '3', nombre: 'Pie de foto', ruta: ['Portada', 'Textos'], texto: 'Que bien lo pasamos!  Abierto de 1990-1995 con "amor" y una exepción... para todos.', cuerpoPt: 8, tipoTexto: 'area', bloqueada: false, estilosMixtos: false, componente: null },
    { id: '4', nombre: 'Cartel', ruta: ['Cartel'], texto: 'LA CANCION DEL VERANO', cuerpoPt: 36, tipoTexto: 'punto', bloqueada: false, estilosMixtos: true, componente: null },
  ];
  return {
    documento: async () => ({ abierto: true, app: 'prueba', nombre: 'Catálogo de otoño (ejemplo)' }),
    leerTextos: async () => ({ ok: true, bloques: bloques.map((b) => ({ ...b })) }),
    aplicar: async (id, inicio, fin, original, nuevo) => {
      const b = bloques.find((x) => x.id === id);
      if (!b) return { ok: false, error: 'no_existe' };
      if (b.estilosMixtos) return { ok: false, error: 'estilos_mixtos' };
      if (b.texto.slice(inicio, fin) !== original) return { ok: false, error: 'texto_cambio' };
      b.texto = b.texto.slice(0, inicio) + nuevo + b.texto.slice(fin);
      return { ok: true, texto: b.texto, lineasAntes: -1, lineasDespues: -1 };
    },
    seleccionar: async (id) => { avisar(`En Illustrator o Photoshop se seleccionaría la capa «${bloques.find((x) => x.id === id).nombre}».`); return { ok: true }; },
  };
}

const host = modoPrueba ? crearHostPrueba() : hostAdobe;

// Programa en el que está abierto el panel, según CEP: ILST, PHSP o PHXS.
function appIdPanel() {
  try { return JSON.parse(cep.getHostEnvironment()).appId; } catch { return null; }
}
const NOMBRE_APP = { ILST: 'Illustrator', PHSP: 'Photoshop', PHXS: 'Photoshop' };

/* ---------- Diccionarios ---------- */
async function leerArchivo(ruta) {
  try {
    const r = await fetch(ruta);
    if (r.ok) return await r.text();
  } catch { /* CEP sin fetch de archivos locales: se usa Node */ }
  const req = window.cep_node?.require || window.require;
  if (!req) throw new Error('No se pudo leer ' + ruta);
  let base = decodeURIComponent(location.pathname.replace(/\/[^/]*$/, '/'));
  if (/^\/[A-Za-z]:/.test(base)) base = base.slice(1); // Windows
  return req('fs').readFileSync(base + ruta, 'utf8');
}

/* ---------- Estado ---------- */
const AJUSTES_DEF = { idioma: '', comillas: 'angulares', rangosConSemirraya: true, puntosSuspensivos: true, auto: true, autoAplicar: false };
const estado = {
  corrector: null,
  doc: null,
  bloques: new Map(),
  filtro: 'todas',
  activa: null,
  editando: null,
  confirmando: null,
  elegida: {},
  ignoradosSesion: new Set(),
  historial: [],
  decisiones: [],
  ajustes: { ...AJUSTES_DEF, ...guardado.leer('ot:ajustes', {}) },
  ocupado: false,
  errorLectura: null,
  confirmarSeguras: false,
};
const claveDoc = () => (estado.doc?.nombre || 'sin-documento');
const diccionario = () => guardado.leer('ot:dic:' + claveDoc(), []);
const ignorados = () => guardado.leer('ot:ign:' + claveDoc(), []);
const reglas = () => ({ comillas: estado.ajustes.comillas, rangosConSemirraya: estado.ajustes.rangosConSemirraya, puntosSuspensivos: estado.ajustes.puntosSuspensivos });

const TIPOS = { ortografia: 'Ortografía', tecla_adyacente: 'Tecla vecina', mayusculas: 'Mayúsculas', puntuacion: 'Puntuación', espaciado: 'Espaciado', guiones: 'Guiones', comillas: 'Comillas' };
const DE_ORTOGRAFIA = new Set(['ortografia', 'tecla_adyacente', 'mayusculas']);
const IMPACTO = { critico: 'Impacto crítico', medio: 'Impacto medio', bajo: 'Impacto bajo' };
const CONFIANZA = { alta: 'Confianza alta', mediana: 'Confianza media', baja: 'Confianza baja' };

/* ---------- Revisión ---------- */
function revisarBloque(b) {
  const texto = b.texto.replace(/\r/g, '\n'); // mismo largo: las posiciones coinciden
  const r = estado.corrector.revisar(texto, {
    idioma: estado.ajustes.idioma || undefined,
    reglas: reglas(),
    diccionarioProyecto: diccionario(),
    ignorados: ignorados(),
  });
  b.idioma = r.idioma;
  b.incidencias = r.incidencias
    .filter((inc) => !estado.ignoradosSesion.has(`${b.id}|${inc.clave}`))
    .map((inc) => {
      inc.id = `${b.id}:${inc.inicio}:${inc.reglaId}`;
      inc.bloqueId = b.id;
      inc.impacto = clasificarImpacto(inc, b, reglas());
      inc.autoAplicable = esAutoAplicable(inc) && !b.bloqueada;
      return inc;
    });
}

async function revisarDocumento({ silencioso = false } = {}) {
  if (estado.ocupado || !estado.corrector) return;
  estado.ocupado = true;
  if (!silencioso) $('#btn-revisar').textContent = 'Revisando…';
  try {
    const doc = await host.documento();
    if (doc.ok === false) throw new Error(doc.error);
    if (!modoPrueba) {
      // El puente ExtendScript debe responder como el mismo programa que aloja el panel.
      const appId = appIdPanel();
      const esperado = appId === 'ILST' ? 'illustrator' : /^(PHSP|PHXS)$/.test(appId) ? 'photoshop' : null;
      if (esperado && doc.app !== esperado) throw new Error(`El panel está en ${NOMBRE_APP[appId]} pero el puente responde como ${doc.app}.`);
    }
    estado.errorLectura = null;
    if (!doc.abierto) {
      estado.doc = null; estado.bloques.clear();
      return render();
    }
    if (doc.nombre !== estado.doc?.nombre) { estado.bloques.clear(); estado.ignoradosSesion.clear(); }
    estado.doc = doc;
    const r = await host.leerTextos();
    if (!r.ok) throw new Error(r.error);
    const t0 = performance.now();
    const vistos = new Set();
    let cambios = 0;
    for (const nuevo of r.bloques) {
      vistos.add(nuevo.id);
      const previo = estado.bloques.get(nuevo.id);
      if (previo && previo.texto === nuevo.texto && previo.bloqueada === nuevo.bloqueada) continue;
      revisarBloque(nuevo);
      estado.bloques.set(nuevo.id, nuevo);
      cambios++;
    }
    for (const id of [...estado.bloques.keys()]) if (!vistos.has(id)) estado.bloques.delete(id);
    if (cambios) estado.ultimaRevision = { ms: Math.round(performance.now() - t0), bloques: r.bloques.length, cambios };
    if (cambios || !silencioso) render();
  } catch (e) {
    estado.errorLectura = e.message;
    estado.bloques.clear();
    render();
  } finally {
    estado.ocupado = false;
    $('#btn-revisar').textContent = 'Revisar documento';
  }
}

function todas() {
  const out = [];
  for (const b of estado.bloques.values()) for (const inc of b.incidencias) out.push(inc);
  return out;
}

const pasaFiltro = (inc, f) =>
  f === 'todas' ? true :
  f === 'critico' ? inc.impacto.nivel === 'critico' :
  f === 'seguras' ? inc.autoAplicable :
  f === 'ortografia' ? DE_ORTOGRAFIA.has(inc.tipo) :
  !DE_ORTOGRAFIA.has(inc.tipo);

const buscar = (id) => todas().find((i) => i.id === id);
const sugerenciaElegida = (inc) => (estado.editando === inc.id ? null : inc.sugerencias[estado.elegida[inc.id] || 0]);

/* ---------- Acciones ---------- */
function registrar(inc, decision, sugerencia) {
  const b = estado.bloques.get(inc.bloqueId);
  estado.decisiones.push({
    fecha: new Date().toISOString(), capa: b?.nombre || '', ruta: (b?.ruta || []).join(' / '), tipo: inc.tipo, regla: inc.reglaId,
    original: inc.original, sugerencia: sugerencia ?? inc.sugerencias[0] ?? '', confianza: inc.confianza.nivel, impacto: inc.impacto.nivel, decision,
  });
}

const MENSAJE_ERROR = {
  bloqueada: 'La capa está bloqueada u oculta. Desbloquéala para corregirla.',
  estilos_mixtos: 'Esta capa mezcla varios estilos y Photoshop los unificaría. Corrígela a mano con la herramienta Texto.',
  no_existe: 'Ya no encontramos esa capa. Volvemos a revisar el documento.',
  texto_cambio: 'El texto cambió desde la última revisión. Volvemos a revisar.',
};

async function aceptar(inc, nuevo, { permitirReflow = false, decision = 'aceptada', silencioso = false } = {}) {
  const b = estado.bloques.get(inc.bloqueId);
  const original = b.texto.slice(inc.inicio, inc.fin);
  let r;
  try { r = await host.aplicar(b.id, inc.inicio, inc.fin, original, nuevo, permitirReflow); } catch (e) { r = { ok: false, error: e.message }; }
  if (!r.ok) {
    if (r.error === 'reflow') {
      inc.impacto = { nivel: 'critico', motivos: [...inc.impacto.motivos, 'cambia_lineas'] };
      inc.autoAplicable = false;
      estado.activa = inc.id;
      render();
      avisar('Deshicimos el cambio porque movía el texto a otra línea. Revísalo antes de aplicarlo.');
    } else {
      avisar(MENSAJE_ERROR[r.error] || `No pudimos aplicar el cambio. El texto no se ha modificado. (${r.error})`);
      if (r.error === 'texto_cambio' || r.error === 'no_existe') revisarDocumento();
    }
    return false;
  }
  b.texto = r.texto ?? (b.texto.slice(0, inc.inicio) + nuevo + b.texto.slice(inc.fin));
  const entrada = { bloqueId: b.id, capa: b.nombre, inicio: inc.inicio, antes: original, despues: nuevo, fecha: new Date(), revertida: false };
  estado.historial.unshift(entrada);
  registrar(inc, decision, nuevo);
  revisarBloque(b);
  siguienteActiva(inc);
  render();
  const mostrar = (t) => t.replace(/ /g, '␣');
  if (!silencioso) avisar(nuevo ? `Corregido: «${mostrar(nuevo)}».` : `Corregido: se quitó «${mostrar(original)}».`, () => revertir(entrada));
  return true;
}

async function revertir(entrada) {
  const b = estado.bloques.get(entrada.bloqueId);
  if (!b || entrada.revertida) return;
  const r = await host.aplicar(b.id, entrada.inicio, entrada.inicio + entrada.despues.length, entrada.despues, entrada.antes, true);
  if (!r.ok) return avisar('No se puede revertir: el texto cambió después de la corrección.');
  entrada.revertida = true;
  b.texto = r.texto ?? (b.texto.slice(0, entrada.inicio) + entrada.antes + b.texto.slice(entrada.inicio + entrada.despues.length));
  estado.decisiones.push({ fecha: new Date().toISOString(), capa: b.nombre, ruta: b.ruta.join(' / '), tipo: '', regla: '', original: entrada.despues, sugerencia: entrada.antes, confianza: '', impacto: '', decision: 'revertida' });
  revisarBloque(b);
  render();
  avisar('Corrección revertida.');
}

function ignorarUnaVez(inc) {
  estado.ignoradosSesion.add(`${inc.bloqueId}|${inc.clave}`);
  registrar(inc, 'ignorada_una_vez');
  siguienteActiva(inc);
  revisarBloque(estado.bloques.get(inc.bloqueId));
  render();
}

function ignorarSiempre(inc) {
  const lista = ignorados();
  if (!lista.includes(inc.clave)) lista.push(inc.clave);
  guardado.escribir('ot:ign:' + claveDoc(), lista);
  registrar(inc, 'ignorada_proyecto');
  siguienteActiva(inc);
  revisarTodo();
  avisar(`Ignoraremos «${inc.original.trim() || 'este caso'}» en este proyecto.`, () => {
    guardado.escribir('ot:ign:' + claveDoc(), ignorados().filter((k) => k !== inc.clave));
    revisarTodo();
  });
}

function anadirDiccionario(inc) {
  const palabra = inc.original;
  const lista = diccionario();
  if (!lista.some((p) => p.toLowerCase() === palabra.toLowerCase())) lista.push(palabra);
  guardado.escribir('ot:dic:' + claveDoc(), lista);
  registrar(inc, 'anadida_diccionario', palabra);
  siguienteActiva(inc);
  revisarTodo();
  avisar(`Añadido al diccionario del proyecto: ${palabra}`, () => quitarDiccionario(palabra));
}

function quitarDiccionario(palabra) {
  guardado.escribir('ot:dic:' + claveDoc(), diccionario().filter((p) => p !== palabra));
  revisarTodo();
  pintarDiccionario();
}

function revisarTodo() {
  for (const b of estado.bloques.values()) revisarBloque(b);
  render();
}

function siguienteActiva(inc) {
  const lista = visibles();
  const i = lista.findIndex((x) => x.id === inc.id);
  const sig = lista[i + 1] || lista[i - 1];
  estado.activa = sig ? sig.id : null;
  estado.editando = null;
  estado.confirmando = null;
}

async function aceptarSeguras() {
  const total = todas().filter((i) => i.autoAplicable).length;
  let hechas = 0;
  for (let vuelta = 0; vuelta < total + 5; vuelta++) {
    const inc = todas().find((i) => i.autoAplicable);
    if (!inc) break;
    if (await aceptar(inc, inc.sugerencias[0], { decision: 'auto_aplicada', silencioso: true })) hechas++;
    else break;
  }
  estado.confirmarSeguras = false;
  render();
  avisar(`${hechas} ${hechas === 1 ? 'corrección segura aplicada' : 'correcciones seguras aplicadas'}. Puedes revertirlas en el Historial.`);
}

/* ---------- Informe ---------- */
function exportarCSV() {
  const filas = [['fecha', 'documento', 'capa', 'ruta', 'tipo', 'regla', 'original', 'sugerencia', 'confianza', 'impacto', 'decision']];
  const doc = estado.doc?.nombre || '';
  for (const d of estado.decisiones) filas.push([d.fecha, doc, d.capa, d.ruta, d.tipo, d.regla, d.original, d.sugerencia, d.confianza, d.impacto, d.decision]);
  for (const inc of todas()) {
    const b = estado.bloques.get(inc.bloqueId);
    filas.push(['', doc, b.nombre, b.ruta.join(' / '), inc.tipo, inc.reglaId, inc.original, inc.sugerencias[0] ?? '', inc.confianza.nivel, inc.impacto.nivel, 'pendiente']);
  }
  const csv = '﻿' + filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const nombre = `revision-${doc.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_') || 'documento'}.csv`;
  const fs = window.cep?.fs;
  if (fs?.showSaveDialogEx) {
    const r = fs.showSaveDialogEx('Exportar informe', '', ['csv'], nombre);
    if (!r.data) return;
    const ruta = /\.csv$/i.test(r.data) ? r.data : r.data + '.csv';
    const w = fs.writeFile(ruta, csv, window.cep.encoding.UTF8);
    avisar(w.err ? 'No pudimos guardar el informe.' : `Informe exportado: ${ruta.split(/[\\/]/).pop()}`);
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = nombre;
    a.click();
    avisar(`Informe exportado: ${nombre}`);
  }
}

/* ---------- Pintado ---------- */
const visible = (s) => (s === '' ? '(nada)' : esc(s).replace(/ /g, '␣'));

function visibles() {
  const out = [];
  for (const b of estado.bloques.values()) for (const inc of b.incidencias) if (pasaFiltro(inc, estado.filtro)) out.push(inc);
  return out;
}

function avisoImpacto(inc, b) {
  const m = inc.impacto.motivos;
  if (m.includes('estilos_mixtos')) return MENSAJE_ERROR.estilos_mixtos;
  if (m.includes('cambia_lineas')) return 'Este cambio mueve el texto a otra línea.';
  if (m.includes('texto_en_trazado')) return 'Es texto en un trazado: el cambio puede desplazar las letras.';
  if (m.includes('componente_maestro')) return 'Está en un componente maestro: el cambio afecta a todas sus copias.';
  if (m.includes('logo_o_titular')) return `Es un titular de ${Math.round(b.cuerpoPt)} pt y el cambio altera su ancho.`;
  return '';
}

function tarjeta(inc) {
  const b = estado.bloques.get(inc.bloqueId);
  const activa = estado.activa === inc.id;
  const sug = inc.sugerencias[estado.elegida[inc.id] || 0];
  const texto = b.texto.replace(/\r/g, '\n');
  const a = Math.max(0, inc.inicio - 32), z = Math.min(texto.length, inc.fin + 32);
  const prev = sug === undefined ? '' :
    `<div class="prev"><b>Vista previa</b>${a > 0 ? '…' : ''}${esc(texto.slice(a, inc.inicio))}<mark>${esc(sug)}</mark>${esc(texto.slice(inc.fin, z))}${z < texto.length ? '…' : ''}</div>`;
  const critico = inc.impacto.nivel === 'critico';
  const aviso = avisoImpacto(inc, b);
  const noAplicable = b.bloqueada || inc.impacto.motivos.includes('estilos_mixtos');
  const alts = inc.sugerencias.length > 1
    ? `<div class="alts">${inc.sugerencias.map((s, i) => `<button class="btn" data-acc="elegir" data-i="${i}" aria-pressed="${(estado.elegida[inc.id] || 0) === i}">${visible(s)}</button>`).join('')}</div>` : '';
  let acciones = '';
  if (estado.editando === inc.id) {
    acciones = `<form class="editar" data-acc="guardar-edicion"><input type="text" id="edicion" value="${esc(inc.original)}" aria-label="Tu corrección"><button class="btn primary">Aplicar</button><button type="button" class="btn" data-acc="cancelar">Cancelar</button></form>`;
  } else if (estado.confirmando === inc.id) {
    acciones = `<div class="acciones"><button class="btn primary" data-acc="aplicar-igual">Aplicar igualmente</button><button class="btn" data-acc="cancelar">Cancelar</button></div>`;
  } else {
    acciones = `<div class="acciones">
      ${sug !== undefined && !noAplicable ? '<button class="btn primary" data-acc="aceptar" title="Enter">Aceptar</button>' : ''}
      <button class="btn" data-acc="ignorar" title="I">Ignorar</button>
      <button class="btn" data-acc="ignorar-siempre" title="Mayús+I">Ignorar siempre</button>
      ${DE_ORTOGRAFIA.has(inc.tipo) && inc.tipo !== 'mayusculas' ? '<button class="btn" data-acc="diccionario" title="D">Añadir al diccionario</button>' : ''}
      ${!noAplicable ? '<button class="btn" data-acc="editar" title="E">Editar</button>' : ''}
      <button class="btn" data-acc="ver" title="L">Ver en el lienzo</button>
    </div>`;
  }
  return `<div class="inc${activa ? ' activa' : ''}" data-id="${esc(inc.id)}" tabindex="0">
    <div class="cab"><span class="pill p-${inc.impacto.nivel}">${IMPACTO[inc.impacto.nivel]}</span><span class="pill p-conf">${CONFIANZA[inc.confianza.nivel]}</span><span class="tipo">${TIPOS[inc.tipo] || inc.tipo}</span></div>
    <div class="cambio"><span class="vis">${visible(inc.original)}</span>${sug !== undefined ? ` → <span class="nuevo">${visible(sug)}</span>` : ''}</div>
    <div class="detalle">
      <div class="exp">${esc(inc.explicacion)}</div>
      ${alts}${prev}
      ${b.bloqueada ? `<div class="aviso">${MENSAJE_ERROR.bloqueada}</div>` : critico && aviso ? `<div class="aviso">⚠ ${esc(aviso)}</div>` : ''}
      ${acciones}
    </div>
  </div>`;
}

function render() {
  const lista = $('#lista');
  const inc = todas();
  for (const chip of document.querySelectorAll('.chip')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.f === estado.filtro));
    chip.querySelector('span').textContent = inc.filter((i) => pasaFiltro(i, chip.dataset.f)).length;
  }
  $('#origen').textContent = modoPrueba ? `Modo de prueba · ${version}` : `Local · ${NOMBRE_APP[appIdPanel()] || 'Adobe'} · ${version}`;

  let html = '';
  if (!estado.corrector) html = '<div class="vacio"><strong>Cargando diccionarios…</strong></div>';
  else if (estado.errorLectura) html = `<div class="vacio"><strong>No pudimos leer el documento.</strong><span>${esc(estado.errorLectura)}</span></div>`;
  else if (!estado.doc) html = '<div class="vacio"><strong>Abre un documento para revisarlo.</strong></div>';
  else if (!estado.bloques.size) html = '<div class="vacio"><strong>Este documento no tiene texto editable.</strong><span>El texto convertido en contornos no se puede revisar.</span></div>';
  else if (!inc.length) html = '<div class="vacio"><strong>Todo en orden.</strong><span>No hay incidencias pendientes.</span></div>';
  else {
    const vis = visibles();
    if (!vis.length) html = '<div class="vacio"><strong>Nada con estos filtros.</strong><button class="btn" data-acc="quitar-filtro">Quitar filtros</button></div>';
    if (vis.length && !vis.some((i) => i.id === estado.activa)) estado.activa = vis[0].id;
    for (const b of estado.bloques.values()) {
      const suyas = b.incidencias.filter((i) => pasaFiltro(i, estado.filtro));
      if (!suyas.length) continue;
      const idioma = b.idioma?.codigo === 'en' ? 'Inglés' : 'Español';
      html += `<div class="grupo"><span>${esc([...b.ruta, b.nombre].join(' · '))}</span><span>${idioma} · ${suyas.length}</span></div>`;
      html += suyas.map(tarjeta).join('');
    }
  }
  if (modoPrueba && estado.corrector) html = '<div class="grupo"><span>Documento de ejemplo: así se verá en Illustrator y Photoshop</span></div>' + html;
  lista.innerHTML = html;

  const pendientes = inc.length;
  const ult = estado.ultimaRevision;
  $('#resumen').textContent = estado.doc
    ? `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'} · ${estado.bloques.size} textos${ult ? ` · revisado en ${ult.ms} ms` : ''}`
    : '';
  const seguras = inc.filter((i) => i.autoAplicable).length;
  const caja = $('#seguras');
  caja.hidden = !(estado.ajustes.autoAplicar && seguras);
  caja.innerHTML = estado.confirmarSeguras
    ? `<span class="small">¿Aplicar ${seguras} correcciones de confianza alta e impacto bajo?</span><button class="btn primary" data-acc="seguras-si">Sí, aplicar</button><button class="btn" data-acc="seguras-no">Cancelar</button>`
    : `<button class="btn primary" data-acc="seguras">Aceptar las seguras (${seguras})</button>`;
  const activa = lista.querySelector('.inc.activa');
  if (activa && !lista.contains(document.activeElement)) activa.scrollIntoView({ block: 'nearest' });
  if (estado.editando) { const e = $('#edicion'); if (e) { e.focus(); e.select(); } }
}

function pintarHistorial() {
  const h = estado.historial;
  $('#historial').innerHTML = h.length
    ? h.map((e, i) => `<div class="hist"><span>${e.fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} · ${esc(e.capa)}<br>«${visible(e.antes)}» → «${visible(e.despues)}»</span>${e.revertida ? '<span class="muted small">Revertida</span>' : `<button class="btn" data-rev="${i}">Revertir</button>`}</div>`).join('')
    : '<p class="muted">Todavía no hay correcciones.</p>';
}

function pintarDiccionario() {
  const d = diccionario();
  $('#diccionario').innerHTML = d.length
    ? d.map((p) => `<div class="dic"><span>${esc(p)}</span><button class="btn" data-quitar="${esc(p)}">Quitar</button></div>`).join('')
    : '<p class="muted">Vacío. Usa «Añadir al diccionario» en una sugerencia para las marcas y nombres propios.</p>';
}

let temporizadorAviso;
function avisar(texto, deshacer) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(texto)}</span>${deshacer ? '<button type="button">Deshacer</button>' : ''}`;
  t.hidden = false;
  if (deshacer) t.querySelector('button').onclick = () => { t.hidden = true; deshacer(); };
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { t.hidden = true; }, deshacer ? 6000 : 4000);
}

/* ---------- Eventos ---------- */
function accion(acc, inc, el) {
  switch (acc) {
    case 'aceptar':
      if (inc.impacto.nivel === 'critico') { estado.confirmando = inc.id; return render(); }
      return aceptar(inc, sugerenciaElegida(inc));
    case 'aplicar-igual': return aceptar(inc, inc.sugerencias[estado.elegida[inc.id] || 0], { permitirReflow: true });
    case 'elegir': estado.elegida[inc.id] = Number(el.dataset.i); return render();
    case 'ignorar': return ignorarUnaVez(inc);
    case 'ignorar-siempre': return ignorarSiempre(inc);
    case 'diccionario': return anadirDiccionario(inc);
    case 'editar': estado.editando = inc.id; return render();
    case 'cancelar': estado.editando = null; estado.confirmando = null; return render();
    case 'ver': return host.seleccionar(inc.bloqueId);
  }
}

$('#lista').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-acc]');
  if (btn?.dataset.acc === 'quitar-filtro') { estado.filtro = 'todas'; return render(); }
  const card = ev.target.closest('.inc');
  if (!card) return;
  const inc = buscar(card.dataset.id);
  if (!inc) return;
  if (btn && btn.tagName !== 'FORM') { ev.stopPropagation(); return accion(btn.dataset.acc, inc, btn); }
  if (estado.activa !== inc.id) { estado.activa = inc.id; estado.editando = null; estado.confirmando = null; render(); }
});

$('#lista').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const inc = buscar(ev.target.closest('.inc').dataset.id);
  const valor = $('#edicion').value;
  estado.editando = null;
  aceptar(inc, valor, { permitirReflow: inc.impacto.nivel === 'critico', decision: 'editada_manual' });
});

document.querySelector('.chips').addEventListener('click', (ev) => {
  const chip = ev.target.closest('.chip');
  if (!chip) return;
  estado.filtro = chip.dataset.f;
  render();
});

document.querySelector('.bottom').addEventListener('click', (ev) => {
  const acc = ev.target.closest('[data-acc]')?.dataset.acc;
  if (acc === 'seguras') { estado.confirmarSeguras = true; render(); }
  if (acc === 'seguras-no') { estado.confirmarSeguras = false; render(); }
  if (acc === 'seguras-si') aceptarSeguras();
});

$('#btn-revisar').addEventListener('click', () => { estado.bloques.clear(); revisarDocumento(); });
$('#btn-exportar').addEventListener('click', exportarCSV);
$('#btn-historial').addEventListener('click', () => { pintarHistorial(); $('#panel-historial').hidden = false; });
$('#historial').addEventListener('click', async (ev) => {
  const i = ev.target.dataset.rev;
  if (i !== undefined) { await revertir(estado.historial[Number(i)]); pintarHistorial(); }
});
$('#btn-diccionario').addEventListener('click', () => { pintarDiccionario(); $('#panel-diccionario').hidden = false; });
$('#diccionario').addEventListener('click', (ev) => { if (ev.target.dataset.quitar) quitarDiccionario(ev.target.dataset.quitar); });
for (const b of document.querySelectorAll('[data-cerrar]')) b.addEventListener('click', () => { $('#' + b.dataset.cerrar).hidden = true; });

$('#btn-ajustes').addEventListener('click', (ev) => {
  const abierto = $('#ajustes').hidden;
  $('#ajustes').hidden = !abierto;
  ev.currentTarget.setAttribute('aria-expanded', String(abierto));
});

const CAMPOS = { 'opt-idioma': 'idioma', 'opt-comillas': 'comillas', 'opt-semirraya': 'rangosConSemirraya', 'opt-suspensivos': 'puntosSuspensivos', 'opt-auto': 'auto', 'opt-autoaplicar': 'autoAplicar' };
for (const [id, campo] of Object.entries(CAMPOS)) {
  const el = $('#' + id);
  if (el.type === 'checkbox') el.checked = !!estado.ajustes[campo]; else el.value = estado.ajustes[campo];
  el.addEventListener('change', () => {
    estado.ajustes[campo] = el.type === 'checkbox' ? el.checked : el.value;
    guardado.escribir('ot:ajustes', estado.ajustes);
    if (estado.corrector) revisarTodo();
  });
}

document.addEventListener('keydown', (ev) => {
  if (ev.target.closest('input, select, textarea')) {
    if (ev.key === 'Escape') { estado.editando = null; render(); }
    return;
  }
  if (ev.key === 'Escape') { for (const s of document.querySelectorAll('.sheet')) s.hidden = true; estado.confirmando = null; return render(); }
  const vis = visibles();
  const i = vis.findIndex((x) => x.id === estado.activa);
  const inc = vis[i];
  const mover = (d) => { const n = vis[Math.min(vis.length - 1, Math.max(0, i + d))]; if (n) { estado.activa = n.id; estado.confirmando = null; render(); } };
  const k = ev.key.toLowerCase();
  if (k === 'j' || ev.key === 'ArrowDown') { ev.preventDefault(); mover(1); }
  else if (k === 'k' || ev.key === 'ArrowUp') { ev.preventDefault(); mover(-1); }
  else if (!inc) return;
  else if (ev.key === 'Enter' && !ev.target.closest('button')) { ev.preventDefault(); accion(estado.confirmando === inc.id ? 'aplicar-igual' : 'aceptar', inc); }
  else if (k === 'i') accion(ev.shiftKey ? 'ignorar-siempre' : 'ignorar', inc);
  else if (k === 'd' && DE_ORTOGRAFIA.has(inc.tipo)) accion('diccionario', inc);
  else if (k === 'e') { ev.preventDefault(); accion('editar', inc); }
  else if (k === 'l') accion('ver', inc);
});

/* ---------- Tema del programa ---------- */
function aplicarTema() {
  let oscuro = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  if (cep) {
    try {
      const c = JSON.parse(cep.getHostEnvironment()).appSkinInfo.panelBackgroundColor.color;
      oscuro = (0.299 * c.red + 0.587 * c.green + 0.114 * c.blue) < 128;
    } catch { /* se queda el tema del sistema */ }
  }
  document.documentElement.dataset.theme = oscuro ? 'dark' : 'light';
}
aplicarTema();
cep?.addEventListener?.('com.adobe.csxs.events.ThemeColorChanged', aplicarTema);

/* ---------- Arranque ---------- */
(async () => {
  render();
  try {
    const [esAff, esDic, enAff, enDic] = await Promise.all(['dict/es.aff', 'dict/es.dic', 'dict/en.aff', 'dict/en.dic'].map(leerArchivo));
    estado.corrector = crearCorrector({ es: { aff: esAff, dic: esDic }, en: { aff: enAff, dic: enDic } });
  } catch (e) {
    $('#lista').innerHTML = `<div class="vacio"><strong>No pudimos cargar los diccionarios.</strong><span>${esc(e.message)}</span></div>`;
    return;
  }
  await revisarDocumento();
  setInterval(() => { if (estado.ajustes.auto && !estado.editando && document.visibilityState !== 'hidden') revisarDocumento({ silencioso: true }); }, 2500);
})();
