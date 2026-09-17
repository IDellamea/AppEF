// Genera los íconos PNG de la PWA (192x192, 512x512 y una versión maskable)
// sin depender de librerías externas (sharp/canvas), usando un encoder PNG
// mínimo escrito a mano (zlib de Node para la compresión IDAT).
//
// Diseño: fondo azul institucional, círculo blanco centrado con las
// iniciales "EF" en el mismo azul. Es un ícono simple y funcional; se puede
// reemplazar por arte real más adelante (ver README).
//
// Uso: node scripts/generar-iconos.mjs

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const carpetaSalida = join(__dirname, '..', 'public', 'icons')

const AZUL = [11, 61, 145, 255] // #0b3d91
const BLANCO = [255, 255, 255, 255]

// --- Encoder PNG mínimo (RGBA, 8 bits, sin filtros, un solo IDAT) ---

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    tabla[n] = c >>> 0
  }
  return tabla
})()

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = TABLA_CRC[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function crearChunk(tipo, datos) {
  const tipoBuf = Buffer.from(tipo, 'ascii')
  const largoBuf = Buffer.alloc(4)
  largoBuf.writeUInt32BE(datos.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tipoBuf, datos])), 0)
  return Buffer.concat([largoBuf, tipoBuf, datos, crcBuf])
}

function crearPNG(ancho, alto, obtenerPixel) {
  const raw = Buffer.alloc((ancho * 4 + 1) * alto)
  let offset = 0
  for (let y = 0; y < alto; y++) {
    raw[offset++] = 0 // sin filtro
    for (let x = 0; x < ancho; x++) {
      const [r, g, b, a] = obtenerPixel(x, y)
      raw[offset++] = r
      raw[offset++] = g
      raw[offset++] = b
      raw[offset++] = a
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8 // profundidad de color
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const firma = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    firma,
    crearChunk('IHDR', ihdr),
    crearChunk('IDAT', deflateSync(raw)),
    crearChunk('IEND', Buffer.alloc(0)),
  ])
}

// --- Fuente de bitmap 5x7 minimalista para "E" y "F" ---

// prettier-ignore
const GLIFO_E = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
]

// prettier-ignore
const GLIFO_F = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
]

const ANCHO_GLIFO = 5
const ALTO_GLIFO = 7
const SEPARACION_GLIFOS = 1
const ANCHO_TEXTO_UNIDADES = ANCHO_GLIFO * 2 + SEPARACION_GLIFOS

function esPixelDeTexto(xUnidad, yUnidad) {
  if (yUnidad < 0 || yUnidad >= ALTO_GLIFO) return false
  if (xUnidad >= 0 && xUnidad < ANCHO_GLIFO) {
    return GLIFO_E[yUnidad][xUnidad] === 1
  }
  const xF = xUnidad - (ANCHO_GLIFO + SEPARACION_GLIFOS)
  if (xF >= 0 && xF < ANCHO_GLIFO) {
    return GLIFO_F[yUnidad][xF] === 1
  }
  return false
}

/**
 * Dibuja el ícono: fondo azul, círculo blanco centrado y "EF" en azul encima.
 * `factorSeguro` reduce el diámetro del círculo para íconos maskable (deben
 * mantener el contenido importante dentro de la zona segura central).
 */
function dibujarIcono(size, factorSeguro = 0.8) {
  const centro = size / 2
  const radioCirculo = centro * factorSeguro * 0.85

  const unidad = (radioCirculo * 2 * 0.55) / ANCHO_TEXTO_UNIDADES
  const anchoTextoPx = ANCHO_TEXTO_UNIDADES * unidad
  const altoTextoPx = ALTO_GLIFO * unidad
  const inicioTextoX = centro - anchoTextoPx / 2
  const inicioTextoY = centro - altoTextoPx / 2

  return (x, y) => {
    const dx = x - centro
    const dy = y - centro
    const dentroDelCirculo = dx * dx + dy * dy <= radioCirculo * radioCirculo

    if (dentroDelCirculo) {
      const xUnidad = Math.floor((x - inicioTextoX) / unidad)
      const yUnidad = Math.floor((y - inicioTextoY) / unidad)
      if (esPixelDeTexto(xUnidad, yUnidad)) return AZUL
      return BLANCO
    }
    return AZUL
  }
}

mkdirSync(carpetaSalida, { recursive: true })

const iconos = [
  { archivo: 'icon-192.png', size: 192, factorSeguro: 0.85 },
  { archivo: 'icon-512.png', size: 512, factorSeguro: 0.85 },
  { archivo: 'icon-maskable-512.png', size: 512, factorSeguro: 0.7 },
]

for (const { archivo, size, factorSeguro } of iconos) {
  const png = crearPNG(size, size, dibujarIcono(size, factorSeguro))
  writeFileSync(join(carpetaSalida, archivo), png)
  console.log(`Generado: public/icons/${archivo} (${size}x${size})`)
}
