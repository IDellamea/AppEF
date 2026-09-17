// Pantalla intermedia: elegir cuál de los 4 ejercicios cargar.

import { obtenerSesion } from '../../data/sesiones.repo.ts'
import { EJERCICIOS, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { el } from '../dom.ts'
import { navegar, type ParametrosRuta } from '../router.ts'
import type { Ejercicio } from '../../domain/types.ts'

const ETIQUETAS_EJERCICIO: Record<Ejercicio, string> = {
  resistencia: 'Resistencia',
  abdominales: 'Abdominales',
  flexiones: 'Flexiones',
  saltoLargo: 'Salto en largo',
}

export async function render(contenedor: HTMLElement, parametros: ParametrosRuta): Promise<void> {
  const sesionId = Number(parametros.id)
  const sesion = await obtenerSesion(sesionId)
  contenedor.innerHTML = ''

  if (!sesion) {
    contenedor.append(el('p', { clase: 'mensaje-error', texto: 'La sesión no existe.' }))
    return
  }

  contenedor.append(
    el('h1', { texto: sesion.lugar ? `${sesion.fecha} — ${sesion.lugar}` : sesion.fecha }),
  )

  const alumnos = await listarAlumnosDeSesion(sesionId)
  if (alumnos.length === 0) {
    contenedor.append(
      el('p', { clase: 'texto-ayuda', texto: 'Esta sesión todavía no tiene alumnos cargados.' }),
    )
  }

  const grilla = el('div', { clase: 'grilla-ejercicios' })
  for (const ejercicio of EJERCICIOS) {
    const cargados = alumnos.filter((alumno) => alumno.resultados[ejercicio] !== undefined).length
    const boton = el('button', { clase: 'boton boton-ejercicio' })
    boton.append(
      el('span', { clase: 'boton-ejercicio-titulo', texto: ETIQUETAS_EJERCICIO[ejercicio] }),
      el('span', {
        clase: 'boton-ejercicio-detalle',
        texto: `${cargados}/${alumnos.length} alumnos cargados`,
      }),
    )
    boton.addEventListener('click', () => navegar(`/sesion/${sesionId}/ejercicio/${ejercicio}`))
    grilla.append(boton)
  }
  contenedor.append(grilla)

  const botonResumen = el('button', { clase: 'boton boton-secundario', texto: 'Ver resumen' })
  botonResumen.addEventListener('click', () => navegar(`/sesion/${sesionId}/resumen`))
  contenedor.append(botonResumen)
}
