import { obtenerRangoEtario } from './rangoEtario.ts'
import type { Ejercicio, RangoEtario, Sexo, TablasExigencia } from './types.ts'

export class MarcaFueraDeRangoError extends Error {
  constructor(
    public detalle: { sexo: Sexo; rango: RangoEtario; ejercicio: Ejercicio; marca: number },
  ) {
    const { sexo, rango, ejercicio, marca } = detalle
    super(
      `Marca ${marca} fuera de rango para sexo=${sexo}, rango=${rango}, ejercicio=${ejercicio}`,
    )
    this.name = 'MarcaFueraDeRangoError'
  }
}

/**
 * Calcula el puntaje (10 a 100) de un ejercicio según la tabla de exigencia
 * correspondiente al sexo y edad del alumno.
 */
export function calcularPuntajeEjercicio(
  tablas: TablasExigencia,
  sexo: Sexo,
  edad: number,
  ejercicio: Ejercicio,
  marca: number,
): number {
  const rango = obtenerRangoEtario(edad)
  const bandas = tablas[sexo][rango][ejercicio]
  const banda = bandas.find((b) => marca >= b.min && marca <= b.max)
  if (!banda) {
    throw new MarcaFueraDeRangoError({ sexo, rango, ejercicio, marca })
  }
  return banda.puntos
}

/**
 * Calcula el promedio de los 4 puntajes de ejercicio y determina si el
 * alumno aprueba (promedio >= 60).
 */
export function calcularResultadoFinal(
  puntajes: [number, number, number, number],
): { promedio: number; aprobado: boolean } {
  const promedio = puntajes.reduce((a, b) => a + b, 0) / 4
  return { promedio, aprobado: promedio >= 60 }
}
