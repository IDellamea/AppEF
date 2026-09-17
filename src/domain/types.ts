// Tipos de dominio para el Examen de Aptitud Física de la Policía de Chubut
// (Resolución Nº 656/12 JP-DRH - AIP).

export type Sexo = 'M' | 'F'
export type RangoEtario = 'hasta25' | '26-30' | '31-35' | '36-40'
export type Ejercicio = 'resistencia' | 'abdominales' | 'flexiones' | 'saltoLargo'

/**
 * Una banda de puntaje: si la marca obtenida cae dentro de [min, max], el
 * ejercicio se puntúa con `puntos`.
 *
 * Convención de min/max (ver domain/exigencia/*):
 * - resistencia (menos tiempo = mejor, marca en segundos): la banda peor
 *   (10 puntos) tiene max = Infinity; la banda mejor (100 puntos) tiene
 *   min = -Infinity.
 * - abdominales / flexiones / saltoLargo (más marca = mejor): la banda peor
 *   (10 puntos) tiene min = -Infinity; la banda mejor (100 puntos) tiene
 *   max = Infinity.
 */
export interface Banda {
  puntos: number
  min: number
  max: number
}

/** 10 bandas (10 a 100 puntos), ordenadas de peor a mejor marca. */
export type TablaEjercicio = Banda[]

export interface TablasPorEjercicio {
  resistencia: TablaEjercicio
  abdominales: TablaEjercicio
  flexiones: TablaEjercicio
  saltoLargo: TablaEjercicio
}

export type TablasExigencia = Record<Sexo, Record<RangoEtario, TablasPorEjercicio>>

export interface ResultadoEjercicio {
  marca: number
  puntos: number
}

export interface Alumno {
  id?: number
  sesionId: number
  nombre: string
  apellido: string
  edad: number
  sexo: Sexo
  lugarTrabajo: string
  jerarquia: string
  resultados: Partial<Record<Ejercicio, ResultadoEjercicio>>
  promedio?: number
  aprobado?: boolean
}

export interface Sesion {
  id?: number
  fecha: string
  lugar?: string
  creadaEn: number
}
