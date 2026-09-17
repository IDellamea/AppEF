// Resumen de la sesión: 4 marcas, 4 puntajes, promedio y resultado por alumno.

import { obtenerSesion } from '../../data/sesiones.repo.ts'
import { listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { generarExcelSesion } from '../../export/excel.ts'
import { segundosATiempo } from '../../domain/parseo.ts'
import { el } from '../dom.ts'
import { navegar, type ParametrosRuta } from '../router.ts'
import type { Alumno, Ejercicio } from '../../domain/types.ts'

function celdaEjercicio(alumno: Alumno, ejercicio: Ejercicio): string {
  const resultado = alumno.resultados[ejercicio]
  if (!resultado) return '—'
  let marca: string | number = resultado.marca
  if (ejercicio === 'resistencia') marca = segundosATiempo(resultado.marca)
  else if (ejercicio === 'saltoLargo') marca = `${resultado.marca.toFixed(2)} m`
  return `${marca} (${resultado.puntos} pts)`
}

function crearFilaResumen(alumno: Alumno): HTMLElement {
  const fila = el('tr')
  fila.append(
    el('td', { texto: `${alumno.apellido}, ${alumno.nombre}` }),
    el('td', { texto: celdaEjercicio(alumno, 'resistencia') }),
    el('td', { texto: celdaEjercicio(alumno, 'abdominales') }),
    el('td', { texto: celdaEjercicio(alumno, 'flexiones') }),
    el('td', { texto: celdaEjercicio(alumno, 'saltoLargo') }),
    el('td', { texto: alumno.promedio !== undefined ? alumno.promedio.toFixed(1) : '—' }),
  )

  const celdaResultado = el('td')
  if (alumno.aprobado === undefined) {
    celdaResultado.textContent = 'Incompleto'
    celdaResultado.className = 'resultado-incompleto'
  } else if (alumno.aprobado) {
    celdaResultado.textContent = 'APROBADO'
    celdaResultado.className = 'resultado-aprobado'
  } else {
    celdaResultado.textContent = 'DESAPROBADO'
    celdaResultado.className = 'resultado-desaprobado'
  }
  fila.append(celdaResultado)

  return fila
}

export async function render(contenedor: HTMLElement, parametros: ParametrosRuta): Promise<void> {
  const sesionId = Number(parametros.id)
  contenedor.innerHTML = ''

  const sesion = await obtenerSesion(sesionId)
  if (!sesion) {
    contenedor.append(el('p', { clase: 'mensaje-error', texto: 'La sesión no existe.' }))
    return
  }

  const lugarCompleto = [sesion.lugar, sesion.ciudad].filter(Boolean).join(', ')
  contenedor.append(el('h1', { texto: `Resumen — ${sesion.fecha}` }))
  if (sesion.profesor || lugarCompleto) {
    contenedor.append(
      el('p', {
        clase: 'texto-ayuda',
        texto: [sesion.profesor ? `Prof. ${sesion.profesor}` : null, lugarCompleto || null]
          .filter(Boolean)
          .join(' · '),
      }),
    )
  }

  const alumnos = await listarAlumnosDeSesion(sesionId)

  const botonExportar = el('button', { clase: 'boton boton-primario', texto: 'Exportar esta sesión a Excel' })
  botonExportar.addEventListener('click', () => generarExcelSesion(sesion, alumnos))
  contenedor.append(botonExportar)

  if (alumnos.length === 0) {
    contenedor.append(el('p', { clase: 'texto-ayuda', texto: 'Esta sesión no tiene alumnos cargados.' }))
  } else {
    const encabezado = el('tr', {
      hijos: ['Apellido y nombre', 'Resistencia', 'Abdominales', 'Flexiones', 'Salto', 'Promedio', 'Resultado'].map(
        (texto) => el('th', { texto }),
      ),
    })

    const cuerpo = el('tbody', { hijos: alumnos.map((alumno) => crearFilaResumen(alumno)) })

    const tabla = el('table', {
      clase: 'tabla-resumen',
      hijos: [el('thead', { hijos: [encabezado] }), cuerpo],
    })
    contenedor.append(el('div', { clase: 'tabla-scroll', hijos: [tabla] }))
  }

  const botonVolver = el('button', { clase: 'boton boton-texto', texto: '← Volver a ejercicios' })
  botonVolver.addEventListener('click', () => navegar(`/sesion/${sesionId}/ejercicios`))
  contenedor.append(botonVolver)
}
