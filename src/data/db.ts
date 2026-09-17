// Persistencia local con IndexedDB (Dexie). Guarda sesiones de examen y los
// alumnos evaluados en cada una. Todo funciona 100% offline.

import Dexie, { type EntityTable } from 'dexie'
import type { Alumno, Sesion } from '../domain/types.ts'

export class AppEFDatabase extends Dexie {
  sesiones!: EntityTable<Sesion, 'id'>
  alumnos!: EntityTable<Alumno, 'id'>

  constructor() {
    super('AppEFDatabase')
    this.version(1).stores({
      sesiones: '++id, fecha',
      alumnos: '++id, sesionId, apellido',
    })
  }
}

export const db = new AppEFDatabase()
