// Empaqueta el panel de Adobe en dist/ y crea el .zip descargable.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const { version } = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8'));
const dist = path.join(raiz, 'dist');
const paquete = path.join(dist, 'Ortotipografia-Adobe');
const ext = path.join(paquete, 'com.fmanuel.ortotipografia');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(ext, 'dict'), { recursive: true });

// Panel: HTML, estilos, manifiesto y puente ExtendScript.
fs.cpSync(path.join(raiz, 'adobe'), ext, { recursive: true });

// Lógica del panel + motor + nspell en un solo archivo.
await build({
  entryPoints: [path.join(raiz, 'src/panel.js')],
  outfile: path.join(ext, 'js/app.js'),
  bundle: true,
  format: 'iife',
  target: 'chrome61',
  minify: true,
  legalComments: 'inline',
});

// Diccionarios y sus licencias.
for (const idioma of ['es', 'en']) {
  const dir = path.join(raiz, 'node_modules', `dictionary-${idioma}`);
  fs.copyFileSync(path.join(dir, 'index.aff'), path.join(ext, 'dict', `${idioma}.aff`));
  fs.copyFileSync(path.join(dir, 'index.dic'), path.join(ext, 'dict', `${idioma}.dic`));
  fs.copyFileSync(path.join(dir, 'license'), path.join(ext, 'dict', `LICENCIA-${idioma}.txt`));
}

// Instaladores e instrucciones.
for (const f of fs.readdirSync(path.join(raiz, 'instalador'))) {
  const texto = fs.readFileSync(path.join(raiz, 'instalador', f), 'utf8');
  // Windows necesita saltos de línea CRLF en los .bat (y el Bloc de notas los agradece en el .txt).
  fs.writeFileSync(path.join(paquete, f), /\.(bat|txt)$/.test(f) ? texto.replace(/\r?\n/g, '\r\n') : texto);
}
fs.chmodSync(path.join(paquete, 'instalar-mac.command'), 0o755);

const zip = path.join(dist, `Ortotipografia-Adobe-${version}.zip`);
execFileSync('zip', ['-qrX', zip, 'Ortotipografia-Adobe'], { cwd: dist });
console.log('Listo:', path.relative(raiz, zip), `(${(fs.statSync(zip).size / 1024 / 1024).toFixed(1)} MB)`);
