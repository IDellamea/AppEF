// Exportación a Excel (.xlsx) de una sesión o del histórico completo.

import * as XLSX from 'xlsx'
import { segundosATiempo } from '../domain/parseo.ts'
import type { Alumno, Ejercicio, Sesion } from '../domain/types.ts'

const ENCABEZADOS = [
  'Apellido',
  'Nombre',
  'Edad',
  'Sexo',
  'Lugar de trabajo',
  'Jerarquía',
  'Resistencia (mm:ss)',
  'Puntos resistencia',
  'Abdominales',
  'Puntos abdominales',
  'Flexiones',
  'Puntos flexiones',
  'Salto en largo (m)',
  'Puntos salto',
  'Promedio',
  'Resultado',
] as const

function marcaLegible(ejercicio: Ejercicio, marca: number | undefined): number | string {
  if (marca === undefined) return ''
  if (ejercicio === 'resistencia') return segundosATiempo(marca)
  // El salto en largo se escribe como texto con 2 decimales fijos (ej. "2.15",
  // "0.95") para que Excel no le recorte los ceros finales al mostrarlo como
  // número (p. ej. 2.10 -> "2.1").
  if (ejercicio === 'saltoLargo') return marca.toFixed(2)
  return marca
}

function resultadoLegible(alumno: Alumno): string {
  const todosCargados = (['resistencia', 'abdominales', 'flexiones', 'saltoLargo'] as Ejercicio[]).every(
    (e) => alumno.resultados[e] !== undefined,
  )
  if (!todosCargados) return 'incompleto'
  return alumno.aprobado ? 'APROBADO' : 'DESAPROBADO'
}

function filaAlumno(alumno: Alumno): Record<(typeof ENCABEZADOS)[number], string | number> {
  const r = alumno.resultados
  return {
    Apellido: alumno.apellido,
    Nombre: alumno.nombre,
    Edad: alumno.edad,
    Sexo: alumno.sexo,
    'Lugar de trabajo': alumno.lugarTrabajo,
    Jerarquía: alumno.jerarquia,
    'Resistencia (mm:ss)': marcaLegible('resistencia', r.resistencia?.marca),
    'Puntos resistencia': r.resistencia?.puntos ?? '',
    Abdominales: marcaLegible('abdominales', r.abdominales?.marca),
    'Puntos abdominales': r.abdominales?.puntos ?? '',
    Flexiones: marcaLegible('flexiones', r.flexiones?.marca),
    'Puntos flexiones': r.flexiones?.puntos ?? '',
    'Salto en largo (m)': marcaLegible('saltoLargo', r.saltoLargo?.marca),
    'Puntos salto': r.saltoLargo?.puntos ?? '',
    Promedio: alumno.promedio ?? '',
    Resultado: resultadoLegible(alumno),
  }
}

function nombreHojaValido(texto: string): string {
  // Los nombres de hoja de Excel no admiten : \ / ? * [ ] y tienen máx. 31 caracteres.
  const limpio = texto.replace(/[:\\/?*[\]]/g, '-')
  return limpio.slice(0, 31) || 'Sesion'
}

/**
 * Arma la hoja de una sesión: un par de filas con los datos de la sesión
 * (profesor, ciudad, lugar) arriba, y debajo la tabla de alumnos.
 */
function crearHojaSesion(sesion: Sesion, alumnos: Alumno[]): XLSX.WorkSheet {
  const hoja = XLSX.utils.aoa_to_sheet([
    [`Fecha: ${sesion.fecha}`],
    [`Profesor/a: ${sesion.profesor ?? '—'}`],
    [`Ciudad: ${sesion.ciudad ?? '—'}    Lugar: ${sesion.lugar ?? '—'}`],
    [],
  ])
  XLSX.utils.sheet_add_json(hoja, alumnos.map(filaAlumno), {
    header: [...ENCABEZADOS],
    origin: 'A5',
  })
  return hoja
}

/** Genera y descarga un archivo Excel con los resultados de una sesión. */
export function generarExcelSesion(sesion: Sesion, alumnos: Alumno[]): void {
  const hoja = crearHojaSesion(sesion, alumnos)
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, nombreHojaValido(sesion.fecha))
  XLSX.writeFile(libro, `examen-ef_${sesion.fecha}.xlsx`)
}

/** Genera y descarga un Excel histórico con una hoja por sesión más un resumen. */
export function generarExcelHistorico(
  sesiones: Sesion[],
  alumnosPorSesion: Map<number, Alumno[]>,
): void {
  const libro = XLSX.utils.book_new()

  const resumen = sesiones.map((sesion) => {
    const alumnos = alumnosPorSesion.get(sesion.id ?? -1) ?? []
    const conResultado = alumnos.filter((a) => a.aprobado !== undefined)
    const aprobados = conResultado.filter((a) => a.aprobado).length
    const porcentajeAprobados =
      conResultado.length > 0 ? Math.round((aprobados / conResultado.length) * 100) : 0
    return {
      Fecha: sesion.fecha,
      'Profesor/a': sesion.profesor ?? '',
      Ciudad: sesion.ciudad ?? '',
      Lugar: sesion.lugar ?? '',
      'Cantidad de alumnos': alumnos.length,
      '% aprobados': porcentajeAprobados,
    }
  })
  const hojaResumen = XLSX.utils.json_to_sheet(resumen)
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen')

  const nombresUsados = new Set<string>(['Resumen'])
  for (const sesion of sesiones) {
    const alumnos = alumnosPorSesion.get(sesion.id ?? -1) ?? []
    const hoja = crearHojaSesion(sesion, alumnos)
    let nombre = nombreHojaValido(sesion.fecha)
    let sufijo = 2
    while (nombresUsados.has(nombre)) {
      nombre = nombreHojaValido(`${sesion.fecha}-${sufijo}`)
      sufijo += 1
    }
    nombresUsados.add(nombre)
    XLSX.utils.book_append_sheet(libro, hoja, nombre)
  }

  const fechaActual = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(libro, `examen-ef_historico_${fechaActual}.xlsx`)
}
