import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { crearCorrector, detectarIdioma, clasificarImpacto, esAutoAplicable, aplicar } from '../src/motor.js';

const dic = (nombre) => {
  const dir = new URL(`../node_modules/dictionary-${nombre}/`, import.meta.url).pathname;
  return { aff: fs.readFileSync(dir + 'index.aff'), dic: fs.readFileSync(dir + 'index.dic') };
};
const corrector = crearCorrector({ es: dic('es'), en: dic('en') });
const revisar = (t, o) => corrector.revisar(t, o).incidencias;
const una = (t, o) => { const r = revisar(t, o); assert.equal(r.length, 1, JSON.stringify(r, null, 1)); return r[0]; };

test('texto correcto no genera incidencias', () => {
  assert.deepEqual(revisar('La colección de otoño ya está disponible en tiendas.'), []);
  assert.deepEqual(revisar('¿Qué hora es? ¡Qué bien!'), []);
  assert.deepEqual(revisar('Escríbenos a hola@acme.com o visita www.acme.com.'), []);
  assert.deepEqual(revisar('Informe en PDF de la ONU, 2024.'), []);
});

test('ortografía: falta común y tilde', () => {
  const i = una('Es una exepción.');
  assert.equal(i.tipo, 'ortografia');
  assert.equal(i.sugerencias[0], 'excepción');
  const t = una('Una cancion bonita.');
  assert.equal(t.sugerencias[0], 'canción');
  assert.equal(t.confianza.nivel, 'alta');
});

test('teclas vecinas', () => {
  const i = una('Mi cqsa es tu casa.');
  assert.equal(i.tipo, 'tecla_adyacente');
  assert.equal(i.sugerencias[0], 'casa');
});

test('mayúsculas sin tilde', () => {
  const i = una('LA CANCION DEL VERANO');
  assert.equal(i.sugerencias[0], 'CANCIÓN');
  assert.match(i.explicacion, /mayúsculas también llevan tilde/);
});

test('marcas con mayúscula interna: confianza baja y sin sugerencias inventadas', () => {
  const i = una('Edición limitada de AcmeCo para ti.');
  assert.equal(i.confianza.nivel, 'baja');
  assert.deepEqual(i.sugerencias, []);
});

test('diccionario del proyecto e ignorados', () => {
  assert.deepEqual(revisar('Edición limitada de AcmeCo.', { diccionarioProyecto: ['acmeco'] }), []);
  const i = una('Es una exepción.');
  assert.deepEqual(revisar('Es una exepción.', { ignorados: [i.clave] }), []);
});

test('espaciado', () => {
  const i = una('La colección de otoño , ya disponible.');
  assert.equal(i.tipo, 'espaciado');
  assert.equal(aplicar('La colección de otoño , ya disponible.', i), 'La colección de otoño, ya disponible.');
  assert.equal(una('hola  mundo').reglaId, 'ESPACIO_DOBLE');
  assert.equal(una('Ver ( página 4).').reglaId, 'ESPACIO_TRAS_APERTURA');
});

test('signos de apertura en español', () => {
  const i = una('Que bien lo pasamos!');
  assert.equal(i.reglaId, 'FALTA_APERTURA');
  assert.equal(i.sugerencias[0], '¡Que');
  // No oculta otros errores de la misma frase.
  assert.equal(revisar('Edición de AcmeCo para ti!').length, 2);
  assert.deepEqual(revisar('What time is it?', { idioma: 'en' }), []);
});

test('mayúscula después de punto', () => {
  const i = una('Hecho a mano. con materiales locales.');
  assert.equal(i.sugerencias[0], 'Con');
  assert.deepEqual(revisar('Ver pág. cinco y etc. otros.'), []);
});

test('meses con minúscula en mitad de frase, no al inicio', () => {
  assert.equal(una('Hecho a mano en Enero con cariño.').sugerencias[0], 'enero');
  assert.deepEqual(revisar('Enero llega con novedades.'), []);
});

test('comillas, puntos suspensivos y rangos', () => {
  assert.equal(una('Dijo "hola" al llegar.').sugerencias[0], '«hola»');
  assert.equal(una('Dijo "hola" al llegar.', { reglas: { comillas: 'inglesas' } }).sugerencias[0], '“hola”');
  assert.deepEqual(revisar('Dijo "hola" al llegar.', { reglas: { comillas: 'libre' } }), []);
  assert.deepEqual(revisar('Una pantalla de 27" nueva.'), []);
  assert.equal(una('Y entonces... nada.').sugerencias[0], '…');
  assert.equal(una('Abierto de 1990-1995 sin pausa.').sugerencias[0], '–');
});

test('fórmula promocional «válido hasta agotar existencias»', () => {
  const r = revisar('Oferta valido hasta agotar existencia.');
  assert.deepEqual(r.map((i) => [i.reglaId, i.sugerencias[0], i.confianza.nivel]), [
    ['PROMOCION_VALIDO_HASTA_AGOTAR', 'válido', 'mediana'],
    ['PROMOCION_AGOTAR_EXISTENCIAS', 'existencias', 'mediana'],
  ]);
  assert.equal(una('BALIDO HASTA AGOTAR EXISTENCIAS').sugerencias[0], 'VÁLIDO');
  assert.deepEqual(revisar('Oferta válido hasta agotar existencias.'), []);
  assert.deepEqual(revisar('Se oyó un balido en el campo.'), []);
});

test('detección de idioma por bloque', () => {
  assert.equal(detectarIdioma('The new collection is now available').codigo, 'en');
  assert.equal(detectarIdioma('La nueva colección ya está disponible').codigo, 'es');
  assert.equal(detectarIdioma('Hola').origen, 'estilo_host');
  assert.equal(revisar('The new colection is now available').at(0).sugerencias[0], 'collection');
});

test('impacto y auto-aplicar', () => {
  const i = una('La colección de otoño , ya disponible.');
  i.impacto = clasificarImpacto(i, { cuerpoPt: 10, tipoTexto: 'area' });
  assert.equal(i.impacto.nivel, 'bajo');
  assert.equal(esAutoAplicable(i), true);

  i.impacto = clasificarImpacto(i, { cuerpoPt: 48, tipoTexto: 'area' });
  assert.equal(i.impacto.nivel, 'critico');
  assert.equal(esAutoAplicable(i), false);

  i.impacto = clasificarImpacto(i, { cuerpoPt: 10, estilosMixtos: true });
  assert.equal(i.impacto.nivel, 'critico');

  const baja = una('Edición de AcmeCo.');
  baja.impacto = clasificarImpacto(baja, { cuerpoPt: 10 });
  assert.equal(esAutoAplicable(baja), false);
});

test('rendimiento: bloque de ~400 palabras por debajo de 300 ms', () => {
  const parrafo = 'La colección de otoño ya está disponible en nuestras tiendas, con piezas hechas a mano por artesanos locales y materiales de primera calidad. ';
  const texto = parrafo.repeat(18) + 'Una exepción con cancion y cqsa.';
  revisar(texto); // calienta las cachés de sugerencias
  const t = performance.now();
  const r = revisar(texto + ' Otra frase.');
  const ms = performance.now() - t;
  assert.equal(r.length, 3);
  assert.ok(ms < 300, `tardó ${ms.toFixed(0)} ms`);
});
