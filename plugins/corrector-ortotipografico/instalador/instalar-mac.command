#!/bin/bash
# Instala el panel Ortotipografía para Illustrator y Photoshop en macOS.
set -e
ORIGEN="$(cd "$(dirname "$0")" && pwd)/com.fmanuel.ortotipografia"
DESTINO="$HOME/Library/Application Support/Adobe/CEP/extensions/com.fmanuel.ortotipografia"

if [ ! -d "$ORIGEN" ]; then
  echo "No encuentro la carpeta com.fmanuel.ortotipografia junto a este instalador."
  exit 1
fi

mkdir -p "$(dirname "$DESTINO")"
rm -rf "$DESTINO"
cp -R "$ORIGEN" "$DESTINO"

# Permite cargar paneles no firmados (versiones de CEP de Illustrator/Photoshop 2020 en adelante).
for v in 9 10 11 12 13; do
  defaults write "com.adobe.CSXS.$v" PlayerDebugMode 1
done

echo ""
echo "Listo. Cierra y vuelve a abrir Illustrator o Photoshop."
echo "Luego abre el panel en: Ventana > Extensiones > Ortotipografía"
echo ""
read -n 1 -s -r -p "Pulsa cualquier tecla para cerrar."
