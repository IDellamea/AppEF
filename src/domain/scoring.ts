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
 * Marca especial que el profesor carga para indicar que el alumno NO rindió
 * esta prueba (por lesión u otro problema), en vez de una marca real. No es
 * una marca válida de ningún ejercicio (nadie corre en 0 segundos, nadie
 * salta 0 cm), así que se puede distinguir sin ambigüedad.
 */
export const MARCA_NO_RINDIO = 0

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
 * Calcula el resultado de un ejercicio: los puntos según la tabla oficial,
 * o `puntos: null` si la marca cargada es `MARCA_NO_RINDIO` (el alumno no
 * rindió esta prueba). Usar esta función en vez de `calcularPuntajeEjercicio`
 * directamente para cargar un resultado, así el "no rindió" queda contemplado
 * en un solo lugar.
 */
export function calcularResultadoEjercicio(
  tablas: TablasExigencia,
  sexo: Sexo,
  edad: number,
  ejercicio: Ejercicio,
  marca: number,
): { marca: number; puntos: number | null } {
  if (marca === MARCA_NO_RINDIO) {
    return { marca, puntos: null }
  }
  return { marca, puntos: calcularPuntajeEjercicio(tablas, sexo, edad, ejercicio, marca) }
}

/**
 * Calcula el promedio de los puntajes de ejercicio y determina si el alumno
 * aprueba (promedio >= 60). Los ejercicios no rendidos (`null`) NO participan
 * del promedio: se promedia solo entre las pruebas efectivamente rendidas.
 * Si el alumno no rindió ninguna de las 4, no hay promedio posible y se
 * considera desaprobado.
 */
export function calcularResultadoFinal(
  puntajes: (number | null)[],
): { promedio: number; aprobado: boolean; rendidos: number } {
  const rendidos = puntajes.filter((p): p is number => p !== null)
  if (rendidos.length === 0) {
    return { promedio: 0, aprobado: false, rendidos: 0 }
  }
  const promedio = rendidos.reduce((a, b) => a + b, 0) / rendidos.length
  return { promedio, aprobado: promedio >= 60, rendidos: rendidos.length }
}
