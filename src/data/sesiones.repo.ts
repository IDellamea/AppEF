// Repositorio de sesiones de examen.

import { db } from './db.ts'
import type { Sesion } from '../domain/types.ts'

/** Crea una nueva sesión de examen y devuelve su id. */
export async function crearSesion(datos: { fecha: string; lugar?: string }): Promise<number> {
  const id = await db.sesiones.add({
    fecha: datos.fecha,
    lugar: datos.lugar,
    creadaEn: Date.now(),
  })
  // El id es autoincremental (++id): Dexie siempre devuelve un número acá,
  // aunque el tipo `Sesion.id` sea opcional (lo es solo antes de guardar).
  return id as number
}

/** Lista todas las sesiones, de la más reciente a la más antigua. */
export async function listarSesiones(): Promise<Sesion[]> {
  const sesiones = await db.sesiones.toArray()
  return sesiones.sort((a, b) => b.creadaEn - a.creadaEn)
}

/** Obtiene una sesión por id, o undefined si no existe. */
export async function obtenerSesion(id: number): Promise<Sesion | undefined> {
  return db.sesiones.get(id)
}

/** Elimina una sesión y todos los alumnos asociados a ella. */
export async function eliminarSesion(id: number): Promise<void> {
  await db.transaction('rw', db.sesiones, db.alumnos, async () => {
    await db.alumnos.where('sesionId').equals(id).delete()
    await db.sesiones.delete(id)
  })
}
