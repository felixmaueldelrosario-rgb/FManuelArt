// Puente con Illustrator y Photoshop (ExtendScript, ES3).
// El panel llama a estas funciones con evalScript y recibe JSON en texto.
// Nunca toca fuente, cuerpo, interletrado, kerning ni interlineado: solo
// reemplaza caracteres dentro del estilo existente.

function ot_json(v) {
  if (v === null || v === undefined) return 'null';
  var t = typeof v;
  if (t === 'number') return isFinite(v) ? String(v) : 'null';
  if (t === 'boolean') return v ? 'true' : 'false';
  if (t === 'string') {
    var s = '"';
    for (var i = 0; i < v.length; i++) {
      var c = v.charAt(i), n = v.charCodeAt(i);
      if (c === '"') s += '\\"';
      else if (c === '\\') s += '\\\\';
      else if (c === '\n') s += '\\n';
      else if (c === '\r') s += '\\r';
      else if (c === '\t') s += '\\t';
      else if (n < 32 || n === 0x2028 || n === 0x2029) s += '\\u' + ('0000' + n.toString(16)).slice(-4);
      else s += c;
    }
    return s + '"';
  }
  if (v instanceof Array) {
    var a = [];
    for (var j = 0; j < v.length; j++) a.push(ot_json(v[j]));
    return '[' + a.join(',') + ']';
  }
  var o = [];
  for (var k in v) if (v.hasOwnProperty(k)) o.push(ot_json(k) + ':' + ot_json(v[k]));
  return '{' + o.join(',') + '}';
}

function ot_app() {
  var n = BridgeTalk.appName;
  return n === 'illustrator' ? 'illustrator' : n === 'photoshop' ? 'photoshop' : n;
}

function ot_error(e) { return ot_json({ ok: false, error: String(e) }); }

function ot_documento() {
  try {
    if (!app.documents.length) return ot_json({ abierto: false, app: ot_app() });
    return ot_json({ abierto: true, app: ot_app(), nombre: app.activeDocument.name });
  } catch (e) { return ot_error(e); }
}

/* ---------------- Illustrator ---------------- */

function ai_tipo(tf) {
  if (tf.kind === TextType.AREATEXT) return 'area';
  if (tf.kind === TextType.PATHTEXT) return 'trazado';
  return 'punto';
}

function ai_bloqueada(tf) {
  try {
    if (tf.locked || tf.hidden) return true;
    var p = tf.layer;
    while (p && p.typename === 'Layer') {
      if (p.locked || !p.visible) return true;
      p = p.parent;
    }
  } catch (e) {}
  return false;
}

function ai_ruta(tf) {
  var r = [];
  try {
    var p = tf.layer;
    while (p && p.typename === 'Layer') { r.unshift(p.name); p = p.parent; }
  } catch (e) {}
  return r;
}

function ai_lineas(tf) {
  try { return tf.kind === TextType.AREATEXT ? tf.lines.length : -1; } catch (e) { return -1; }
}

function ai_leer() {
  var doc = app.activeDocument, out = [];
  for (var i = 0; i < doc.textFrames.length; i++) {
    var tf = doc.textFrames[i], cuerpo = 0, simbolo = false;
    try { cuerpo = tf.textRange.characterAttributes.size; } catch (e) {}
    try { simbolo = tf.parent.typename === 'SymbolItem'; } catch (e2) {}
    out.push({
      id: String(i),
      nombre: tf.name || tf.contents.substr(0, 30),
      ruta: ai_ruta(tf),
      texto: tf.contents,
      cuerpoPt: cuerpo || 0,
      tipoTexto: ai_tipo(tf),
      bloqueada: ai_bloqueada(tf),
      estilosMixtos: false,
      componente: simbolo ? 'simbolo' : null
    });
  }
  return out;
}

// Reemplaza [inicio, fin) por «nuevo» conservando el estilo del primer carácter.
function ai_reemplazar(tf, inicio, fin, nuevo) {
  var largo = fin - inicio, i;
  if (nuevo.length === 0) {
    for (i = fin - 1; i >= inicio; i--) tf.characters[i].remove();
    return;
  }
  if (largo === 0) {
    // Inserción: se pega al carácter anterior (o al siguiente si es el inicio).
    if (inicio > 0) tf.characters[inicio - 1].contents = tf.characters[inicio - 1].contents + nuevo;
    else tf.characters[0].contents = nuevo + tf.characters[0].contents;
    return;
  }
  tf.characters[inicio].contents = nuevo;
  for (i = inicio + nuevo.length + largo - 2; i >= inicio + nuevo.length; i--) tf.characters[i].remove();
}

function ai_aplicar(id, inicio, fin, original, nuevo, permitirReflow) {
  var doc = app.activeDocument;
  var tf = doc.textFrames[Number(id)];
  if (!tf) return { ok: false, error: 'no_existe' };
  if (ai_bloqueada(tf)) return { ok: false, error: 'bloqueada' };
  if (tf.contents.substr(inicio, fin - inicio) !== original) return { ok: false, error: 'texto_cambio' };
  var antes = ai_lineas(tf);
  ai_reemplazar(tf, inicio, fin, nuevo);
  var despues = ai_lineas(tf);
  if (!permitirReflow && antes !== despues) {
    ai_reemplazar(tf, inicio, inicio + nuevo.length, original);
    return { ok: false, error: 'reflow', lineasAntes: antes, lineasDespues: despues };
  }
  return { ok: true, texto: tf.contents, lineasAntes: antes, lineasDespues: despues };
}

function ai_seleccionar(id) {
  var doc = app.activeDocument, tf = doc.textFrames[Number(id)];
  doc.selection = null;
  tf.selected = true;
  try {
    var b = tf.visibleBounds;
    doc.views[0].centerPoint = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  } catch (e) {}
}

/* ---------------- Photoshop ---------------- */

function ps_estilosMixtos(capa) {
  try {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), capa.id);
    var d = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));
    return d.getList(stringIDToTypeID('textStyleRange')).count > 1;
  } catch (e) { return false; }
}

function ps_recorrer(capas, ruta, out) {
  for (var i = 0; i < capas.length; i++) {
    var c = capas[i];
    if (c.typename === 'LayerSet') {
      var r = ruta.slice(0); r.push(c.name);
      ps_recorrer(c.layers, r, out);
    } else if (c.kind === LayerKind.TEXT) {
      out.push({ capa: c, ruta: ruta });
    }
  }
}

function ps_capas() {
  var out = [];
  ps_recorrer(app.activeDocument.layers, [], out);
  return out;
}

function ps_buscar(id) {
  var capas = ps_capas();
  for (var i = 0; i < capas.length; i++) if (String(capas[i].capa.id) === String(id)) return capas[i].capa;
  return null;
}

function ps_leer() {
  var capas = ps_capas(), out = [];
  for (var i = 0; i < capas.length; i++) {
    var c = capas[i].capa, ti = c.textItem, cuerpo = 0, tipo = 'punto';
    try { cuerpo = parseFloat(String(ti.size)); } catch (e) {}
    try { if (ti.kind === TextType.PARAGRAPHTEXT) tipo = 'area'; } catch (e2) {}
    out.push({
      id: String(c.id),
      nombre: c.name,
      ruta: capas[i].ruta,
      texto: ti.contents,
      cuerpoPt: cuerpo || 0,
      tipoTexto: tipo,
      bloqueada: c.allLocked || !c.visible,
      estilosMixtos: ps_estilosMixtos(c),
      componente: null
    });
  }
  return out;
}

var ot_ps_pendiente = null;
function ot_ps_hacer() { ot_ps_pendiente.capa.textItem.contents = ot_ps_pendiente.texto; }

function ps_aplicar(id, inicio, fin, original, nuevo) {
  var capa = ps_buscar(id);
  if (!capa) return { ok: false, error: 'no_existe' };
  if (capa.allLocked) return { ok: false, error: 'bloqueada' };
  // El DOM de Photoshop reemplaza el texto completo y unificaría los estilos.
  if (ps_estilosMixtos(capa)) return { ok: false, error: 'estilos_mixtos' };
  var t = capa.textItem.contents;
  if (t.substr(inicio, fin - inicio) !== original) return { ok: false, error: 'texto_cambio' };
  ot_ps_pendiente = { capa: capa, texto: t.substr(0, inicio) + nuevo + t.substr(fin) };
  app.activeDocument.suspendHistory('Corrección ortotipográfica', 'ot_ps_hacer()');
  return { ok: true, texto: capa.textItem.contents, lineasAntes: -1, lineasDespues: -1 };
}

function ps_seleccionar(id) {
  var capa = ps_buscar(id);
  if (capa) app.activeDocument.activeLayer = capa;
}

/* ---------------- Entrada común ---------------- */

function ot_leerTextos() {
  try {
    if (!app.documents.length) return ot_json({ ok: true, bloques: [] });
    var bloques = ot_app() === 'photoshop' ? ps_leer() : ai_leer();
    return ot_json({ ok: true, bloques: bloques });
  } catch (e) { return ot_error(e); }
}

function ot_aplicar(id, inicio, fin, original, nuevo, permitirReflow) {
  try {
    var r = ot_app() === 'photoshop' ? ps_aplicar(id, inicio, fin, original, nuevo) : ai_aplicar(id, inicio, fin, original, nuevo, permitirReflow);
    return ot_json(r);
  } catch (e) { return ot_error(e); }
}

function ot_seleccionar(id) {
  try {
    if (ot_app() === 'photoshop') ps_seleccionar(id); else ai_seleccionar(id);
    return ot_json({ ok: true });
  } catch (e) { return ot_error(e); }
}
