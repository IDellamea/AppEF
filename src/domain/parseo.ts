// Utilidades de parseo/formateo usadas para transcribir las tablas oficiales
// y para la futura UI (entrada de marcas en formato "mm:ss" o decimal con coma).

/** Convierte "mm:ss" a segundos totales. Ej: "12:06" -> 726. */
export function tiempoASegundos(tiempo: string): number {
  const partes = tiempo.trim().split(':')
  if (partes.length !== 2) {
    throw new Error(`Formato de tiempo inválido: "${tiempo}" (esperado "mm:ss")`)
  }
  const [minutosStr, segundosStr] = partes as [string, string]
  const minutos = Number(minutosStr)
  const segundos = Number(segundosStr)
  if (!Number.isFinite(minutos) || !Number.isFinite(segundos)) {
    throw new Error(`Formato de tiempo inválido: "${tiempo}" (esperado "mm:ss")`)
  }
  return minutos * 60 + segundos
}

/** Convierte segundos totales a "mm:ss" (segundos con cero a la izquierda). */
export function segundosATiempo(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) {
    throw new Error(`No se puede convertir a tiempo: ${segundos}`)
  }
  const totalSegundos = Math.round(segundos)
  const minutos = Math.floor(totalSegundos / 60)
  const segundosRestantes = totalSegundos % 60
  return `${minutos}:${String(segundosRestantes).padStart(2, '0')}`
}

/**
 * Convierte una distancia de salto en largo escrita en centímetros, sin
 * separador decimal (ej. "215"), a metros (2.15). El profesor escribe la
 * marca tal como la lee en la cinta métrica (en cm) para evitar el error más
 * común de este campo: olvidarse la coma decimal. Como nadie salta 20 metros
 * o más, cualquier valor fuera de ese rango es un error de tipeo.
 */
export function metrosDesdeCentimetros(texto: string): number {
  const digitos = texto.trim().replace(/\D/g, '')
  if (!digitos) {
    throw new Error('Ingresá la distancia en centímetros (ej: 180).')
  }
  const centimetros = Number(digitos)
  if (centimetros <= 0 || centimetros >= 2000) {
    throw new Error('Revisá el valor: tiene que estar entre 1 y 1999 cm (nadie salta 20 m o más).')
  }
  return centimetros / 100
}
