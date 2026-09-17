// Respaldo y restauración completa de la base en un archivo JSON.

import { db } from '../data/db.ts'
import type { Alumno, Sesion } from '../domain/types.ts'

const VERSION_RESPALDO = 1

interface RespaldoJSON {
  version: number
  generadoEn: string
  sesiones: Sesion[]
  alumnos: Alumno[]
}

/** Vuelca toda la base (sesiones + alumnos) a un archivo .json descargable. */
export async function exportarRespaldoJSON(): Promise<void> {
  const [sesiones, alumnos] = await Promise.all([db.sesiones.toArray(), db.alumnos.toArray()])

  const respaldo: RespaldoJSON = {
    version: VERSION_RESPALDO,
    generadoEn: new Date().toISOString(),
    sesiones,
    alumnos,
  }

  const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  const fechaActual = new Date().toISOString().slice(0, 10)
  enlace.href = url
  enlace.download = `respaldo-appef_${fechaActual}.json`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}

function esRespaldoValido(datos: unknown): datos is RespaldoJSON {
  if (!datos || typeof datos !== 'object') return false
  const d = datos as Record<string, unknown>
  return Array.isArray(d.sesiones) && Array.isArray(d.alumnos)
}

/**
 * Restaura un respaldo JSON dentro de la base actual.
 *
 * Estrategia: AGREGA los datos del respaldo como sesiones/alumnos nuevos
 * (no reemplaza ni borra lo que ya existe en el dispositivo). Los ids
 * originales del respaldo se reasignan porque IndexedDB genera ids nuevos
 * al agregar, así que las relaciones sesión-alumno se remapean para que
 * sigan siendo consistentes.
 *
 * Si en el futuro se necesita "reemplazar todo", debe pedirse confirmación
 * explícita en la UI antes de llamar a esta función, ya que sería una
 * operación destructiva (no es lo que hace esta implementación).
 */
export async function importarRespaldoJSON(archivo: File): Promise<{ sesiones: number; alumnos: number }> {
  const texto = await archivo.text()
  let datos: unknown
  try {
    datos = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }

  if (!esRespaldoValido(datos)) {
    throw new Error('El archivo no tiene el formato esperado de un respaldo de AppEF.')
  }

  let sesionesRestauradas = 0
  let alumnosRestaurados = 0

  await db.transaction('rw', db.sesiones, db.alumnos, async () => {
    const mapaIdsSesion = new Map<number, number>()

    for (const sesion of datos.sesiones) {
      const idOriginal = sesion.id
      const nuevoId = await db.sesiones.add({
        fecha: sesion.fecha,
        lugar: sesion.lugar,
        creadaEn: sesion.creadaEn,
      })
      if (idOriginal !== undefined) {
        mapaIdsSesion.set(idOriginal, nuevoId as number)
      }
      sesionesRestauradas += 1
    }

    for (const alumno of datos.alumnos) {
      const nuevoSesionId = mapaIdsSesion.get(alumno.sesionId)
      if (nuevoSesionId === undefined) continue // alumno huérfano en el respaldo: se descarta
      await db.alumnos.add({
        sesionId: nuevoSesionId,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        edad: alumno.edad,
        sexo: alumno.sexo,
        lugarTrabajo: alumno.lugarTrabajo,
        jerarquia: alumno.jerarquia,
        resultados: alumno.resultados ?? {},
        promedio: alumno.promedio,
        aprobado: alumno.aprobado,
      })
      alumnosRestaurados += 1
    }
  })

  return { sesiones: sesionesRestauradas, alumnos: alumnosRestaurados }
}
