// Helpers para construir las TablaEjercicio a partir de los valores
// transcriptos literalmente de la Resolución 656/12 JP-DRH (AIP).
//
// Convención general (ver types.ts):
// - Dentro de una banda, `min` es siempre el valor numérico menor y `max` el
//   valor numérico mayor del rango publicado.
// - La banda de 10 puntos (peor marca) y la de 100 puntos (mejor marca) son
//   "abiertas" hacia el extremo correspondiente:
//   - resistencia (menos tiempo = mejor): banda10.max = Infinity,
//     banda100.min = -Infinity.
//   - abdominales/flexiones/saltoLargo (más marca = mejor): banda10.min =
//     -Infinity, banda100.max = Infinity.

import { tiempoASegundos } from '../parseo.ts'
import type { Banda } from '../types.ts'

/** Banda de 10 puntos para resistencia: cualquier tiempo >= umbral (el peor). */
export function bandaResistenciaPeor(umbralPeor: string): Banda {
  return { puntos: 10, min: tiempoASegundos(umbralPeor), max: Infinity }
}

/** Banda de 100 puntos para resistencia: cualquier tiempo <= umbral (el mejor). */
export function bandaResistenciaMejor(umbralMejor: string): Banda {
  return { puntos: 100, min: -Infinity, max: tiempoASegundos(umbralMejor) }
}

/** Banda intermedia de resistencia: tiempoMejor (menor) a tiempoPeor (mayor), en "mm:ss". */
export function bandaResistenciaMedia(puntos: number, tiempoMejor: string, tiempoPeor: string): Banda {
  return { puntos, min: tiempoASegundos(tiempoMejor), max: tiempoASegundos(tiempoPeor) }
}

/** Banda de 10 puntos para abdominales/flexiones/saltoLargo: marca <= umbral (el peor). */
export function bandaCrecientePeor(umbral: number): Banda {
  return { puntos: 10, min: -Infinity, max: umbral }
}

/** Banda de 100 puntos para abdominales/flexiones/saltoLargo: marca >= umbral (el mejor). */
export function bandaCrecienteMejor(umbral: number): Banda {
  return { puntos: 100, min: umbral, max: Infinity }
}

/** Banda intermedia creciente: min (menor) a max (mayor). */
export function bandaCrecienteMedia(puntos: number, min: number, max: number): Banda {
  return { puntos, min, max }
}
