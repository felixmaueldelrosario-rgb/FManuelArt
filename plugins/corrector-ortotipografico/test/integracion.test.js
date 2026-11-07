import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { crearCorrector, revisarDocumento, hashTexto } from '../src/motor.js';

const dic = (nombre) => {
  const dir = new URL(`../node_modules/dictionary-${nombre}/`, import.meta.url).pathname;
  return { aff: fs.readFileSync(dir + 'index.aff'), dic: fs.readFileSync(dir + 'index.dic') };
};
const corrector = crearCorrector({ es: dic('es'), en: dic('en') });

const esquema = JSON.parse(fs.readFileSync(new URL('../../../docs/plugin-ortotipografico/incidencia.schema.json', import.meta.url)));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validar = ajv.compile(esquema);

const documento = {
  documentoId: 'cartel-otono.mdx',
  host: 'mister-designer',
  bloques: [
    { id: 't1', texto: 'LA CANCION DEL VERANO', capa: { id: 'c1', nombre: 'Titular', tipoTexto: 'punto' }, estilo: { cuerpoPt: 48, fuente: 'Inter Bold' } },
    { id: 't2', texto: 'La colección de otoño , ya disponible. Edición de AcmeCo para ti!', capa: { id: 'c2', nombre: 'Intro', ruta: ['Portada'], tipoTexto: 'area' }, estilo: { cuerpoPt: 10 } },
  ],
};

test('revisarDocumento devuelve JSON válido según el esquema', () => {
  const r = revisarDocumento(corrector, documento);
  const ok = validar(r);
  assert.ok(ok, JSON.stringify(validar.errors, null, 1));
  const [titular, intro] = r.bloques;
  assert.equal(titular.incidencias[0].impacto.nivel, 'medio'); // titular, pero la tilde no cambia el ancho
  assert.equal(titular.incidencias[0].autoAplicable, false);
  const espacio = intro.incidencias.find((i) => i.reglaId === 'ESPACIO_ANTES_SIGNO');
  assert.equal(espacio.autoAplicable, true);
  const marca = intro.incidencias.find((i) => i.original === 'AcmeCo');
  assert.equal(marca.requierePregunta, true);
  assert.equal(marca.metadatos.capa.nombre, 'Intro');
});

test('el hash cambia solo si cambia el texto', () => {
  assert.equal(hashTexto('hola'), hashTexto('hola'));
  assert.notEqual(hashTexto('hola'), hashTexto('hola.'));
});
