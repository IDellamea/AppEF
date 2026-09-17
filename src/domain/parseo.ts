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

/** Convierte un decimal en formato argentino ("1,73") a number (1.73). Acepta también punto. */
export function parseDecimalComaAr(texto: string): number {
  const normalizado = texto.trim().replace(',', '.')
  const valor = Number(normalizado)
  if (!Number.isFinite(valor)) {
    throw new Error(`Decimal inválido: "${texto}"`)
  }
  return valor
}
