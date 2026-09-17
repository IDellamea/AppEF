// Alta de una nueva sesión: primero fecha + lugar, después la lista de alumnos.

import { crearSesion } from '../../data/sesiones.repo.ts'
import { agregarAlumno, eliminarAlumno, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { crearAlumnoForm } from '../components/alumnoForm.ts'
import { el } from '../dom.ts'
import { navegar } from '../router.ts'
import type { Alumno } from '../../domain/types.ts'

function crearCampoTexto(etiqueta: string, placeholder?: string): { contenedor: HTMLElement; input: HTMLInputElement } {
  const contenedor = el('label', { clase: 'campo' })
  const input = document.createElement('input')
  input.type = 'text'
  input.autocomplete = 'off'
  if (placeholder) input.placeholder = placeholder
  contenedor.append(el('span', { clase: 'campo-etiqueta', texto: etiqueta }), input)
  return { contenedor, input }
}

/** La fecha de la sesión es siempre hoy: no tiene sentido cargar un examen
 * con otra fecha, así que se muestra fija en vez de un input editable. */
function crearFechaFija(): { elemento: HTMLElement; valor: string } {
  const valor = new Date().toISOString().slice(0, 10)
  const textoFecha = new Date(`${valor}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const fechaLegible = textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1)
  const elemento = el('div', { clase: 'fecha-fija' })
  elemento.append(
    el('span', { clase: 'fecha-fija-etiqueta', texto: 'Fecha de la sesión' }),
    el('span', { clase: 'fecha-fija-valor', texto: fechaLegible }),
  )
  return { elemento, valor }
}

export function render(contenedor: HTMLElement): void {
  contenedor.innerHTML = ''
  contenedor.append(el('h1', { texto: 'Nueva sesión de examen' }))

  const fecha = crearFechaFija()

  const form = el('form', { clase: 'formulario' })
  const campoProfesor = crearCampoTexto('Profesor/a a cargo', 'Nombre y apellido')
  const filaLugar = el('div', { clase: 'fila-dos-campos' })
  const campoCiudad = crearCampoTexto('Ciudad', 'Ej: Rawson')
  const campoLugar = crearCampoTexto('Lugar físico', 'Ej: Polideportivo Municipal')
  filaLugar.append(campoCiudad.contenedor, campoLugar.contenedor)

  const mensajeError = el('p', { clase: 'mensaje-error oculto' })

  const botonCrear = el('button', { clase: 'boton boton-primario', texto: 'Crear sesión' })
  botonCrear.type = 'submit'

  form.append(fecha.elemento, campoProfesor.contenedor, filaLugar, mensajeError, botonCrear)
  contenedor.append(form)

  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    mensajeError.classList.add('oculto')

    const profesor = campoProfesor.input.value.trim()
    const ciudad = campoCiudad.input.value.trim()
    const lugar = campoLugar.input.value.trim()

    if (!profesor || !ciudad || !lugar) {
      mensajeError.textContent = 'Completá profesor/a, ciudad y lugar antes de continuar.'
      mensajeError.classList.remove('oculto')
      return
    }

    void crearSesion({ fecha: fecha.valor, profesor, ciudad, lugar }).then((sesionId) =>
      mostrarPasoAlumnos(contenedor, sesionId),
    )
  })
}

async function mostrarPasoAlumnos(contenedor: HTMLElement, sesionId: number): Promise<void> {
  contenedor.innerHTML = ''
  contenedor.append(el('h1', { texto: 'Agregar alumnos' }))
  contenedor.append(
    el('p', {
      clase: 'texto-ayuda',
      texto: 'Agregá los alumnos que vas a evaluar hoy, uno por uno. Cuando termines, tocá "Continuar a ejercicios".',
    }),
  )

  const listaAlumnos = el('div', { clase: 'lista-alumnos' })

  const formAlumno = crearAlumnoForm(async (datos) => {
    await agregarAlumno({ ...datos, sesionId })
    await refrescarLista()
  })
  contenedor.append(formAlumno, listaAlumnos)

  const botonContinuar = el('button', {
    clase: 'boton boton-primario boton-continuar',
    texto: 'Continuar a ejercicios →',
  })
  botonContinuar.addEventListener('click', () => navegar(`/sesion/${sesionId}/ejercicios`))
  contenedor.append(botonContinuar)

  async function refrescarLista(): Promise<void> {
    const alumnos = await listarAlumnosDeSesion(sesionId)
    listaAlumnos.innerHTML = ''
    if (alumnos.length === 0) {
      listaAlumnos.append(el('p', { clase: 'texto-ayuda', texto: 'Todavía no agregaste alumnos.' }))
    }
    for (const alumno of alumnos) {
      listaAlumnos.append(crearFilaAlumno(alumno, refrescarLista))
    }
  }

  await refrescarLista()
}

function crearFilaAlumno(alumno: Alumno, alRefrescar: () => Promise<void>): HTMLElement {
  const fila = el('div', { clase: 'fila-alumno' })
  fila.append(
    el('span', {
      texto: `${alumno.apellido}, ${alumno.nombre} — ${alumno.edad} años (${alumno.sexo === 'M' ? 'masculino' : 'femenino'})`,
    }),
  )
  const botonQuitar = el('button', { clase: 'boton boton-peligro boton-chico', texto: 'Quitar' })
  botonQuitar.addEventListener('click', () => {
    void eliminarAlumno(alumno.id!).then(alRefrescar)
  })
  fila.append(botonQuitar)
  return fila
}
