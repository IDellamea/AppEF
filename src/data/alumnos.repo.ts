// Repositorio de alumnos evaluados dentro de una sesión.

import { db } from './db.ts'
import { calcularPuntajeEjercicio, calcularResultadoFinal } from '../domain/scoring.ts'
import { tablasExigencia } from '../domain/exigencia/index.ts'
import type { Alumno, Ejercicio } from '../domain/types.ts'

/** Los 4 ejercicios del examen, en el orden en que suelen tomarse. */
export const EJERCICIOS: Ejercicio[] = ['resistencia', 'abdominales', 'flexiones', 'saltoLargo']

export type NuevoAlumno = Omit<Alumno, 'id' | 'resultados' | 'promedio' | 'aprobado'>

/** Agrega un alumno a una sesión. Arranca sin ningún resultado cargado. */
export async function agregarAlumno(datos: NuevoAlumno): Promise<number> {
  const id = await db.alumnos.add({
    ...datos,
    resultados: {},
  })
  // El id es autoincremental (++id): Dexie siempre devuelve un número acá,
  // aunque el tipo `Alumno.id` sea opcional (lo es solo antes de guardar).
  return id as number
}

/** Lista los alumnos de una sesión, ordenados por apellido. */
export async function listarAlumnosDeSesion(sesionId: number): Promise<Alumno[]> {
  const alumnos = await db.alumnos.where('sesionId').equals(sesionId).toArray()
  return alumnos.sort((a, b) => a.apellido.localeCompare(b.apellido, 'es'))
}

/** Obtiene un alumno por id. */
export async function obtenerAlumno(id: number): Promise<Alumno | undefined> {
  return db.alumnos.get(id)
}

/**
 * Actualiza el resultado de UN ejercicio de un alumno: calcula los puntos
 * según la tabla de exigencia oficial y los guarda. Si con este resultado el
 * alumno ya tiene los 4 ejercicios cargados, calcula y guarda también el
 * promedio final y si aprobó. Si todavía le falta algún ejercicio, deja
 * `promedio`/`aprobado` sin definir.
 */
export async function actualizarResultadoEjercicio(
  alumnoId: number,
  ejercicio: Ejercicio,
  marca: number,
): Promise<Alumno> {
  const alumno = await db.alumnos.get(alumnoId)
  if (!alumno) {
    throw new Error(`No existe el alumno con id ${alumnoId}`)
  }

  const puntos = calcularPuntajeEjercicio(tablasExigencia, alumno.sexo, alumno.edad, ejercicio, marca)

  const resultados = { ...alumno.resultados, [ejercicio]: { marca, puntos } }

  const cambios: Partial<Alumno> = { resultados }

  const puntajes = EJERCICIOS.map((e) => resultados[e]?.puntos)
  const completo = puntajes.every((p): p is number => p !== undefined)
  if (completo) {
    const { promedio, aprobado } = calcularResultadoFinal(
      puntajes as [number, number, number, number],
    )
    cambios.promedio = promedio
    cambios.aprobado = aprobado
  } else {
    cambios.promedio = undefined
    cambios.aprobado = undefined
  }

  await db.alumnos.update(alumnoId, cambios)
  const actualizado = await db.alumnos.get(alumnoId)
  if (!actualizado) {
    throw new Error(`No se pudo releer el alumno con id ${alumnoId}`)
  }
  return actualizado
}

/** Elimina un alumno. */
export async function eliminarAlumno(id: number): Promise<void> {
  await db.alumnos.delete(id)
}
