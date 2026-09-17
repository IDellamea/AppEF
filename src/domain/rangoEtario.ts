import type { RangoEtario } from './types.ts'

export class EdadFueraDeRangoError extends Error {
  constructor(public edad: number) {
    super(`Edad ${edad} fuera del rango soportado (máximo 40 años)`)
    this.name = 'EdadFueraDeRangoError'
  }
}

/**
 * Determina el rango etario según la Resolución 656/12. No hay piso mínimo:
 * `hasta25` cubre cualquier edad <= 25 (incluidas edades muy bajas).
 */
export function obtenerRangoEtario(edad: number): RangoEtario {
  if (edad <= 25) return 'hasta25'
  if (edad <= 30) return '26-30'
  if (edad <= 35) return '31-35'
  if (edad <= 40) return '36-40'
  throw new EdadFueraDeRangoError(edad)
}
