// Alta de una nueva sesión: primero fecha + lugar, después la lista de alumnos.

import { crearSesion } from '../../data/sesiones.repo.ts'
import { agregarAlumno, eliminarAlumno, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { crearAlumnoForm } from '../components/alumnoForm.ts'
import { el } from '../dom.ts'
import { navegar } from '../router.ts'
import type { Alumno } from '../../domain/types.ts'

function crearCampoTexto(etiqueta: string): { contenedor: HTMLElement; input: HTMLInputElement } {
  const contenedor = el('label', { clase: 'campo' })
  const input = document.createElement('input')
  input.type = 'text'
  contenedor.append(el('span', { clase: 'campo-etiqueta', texto: etiqueta }), input)
  return { contenedor, input }
}

function crearCampoFecha(): { contenedor: HTMLElement; input: HTMLInputElement } {
  const contenedor = el('label', { clase: 'campo' })
  const input = document.createElement('input')
  input.type = 'date'
  input.required = true
  input.value = new Date().toISOString().slice(0, 10)
  contenedor.append(el('span', { clase: 'campo-etiqueta', texto: 'Fecha' }), input)
  return { contenedor, input }
}

export function render(contenedor: HTMLElement): void {
  contenedor.innerHTML = ''
  contenedor.append(el('h1', { texto: 'Nueva sesión de examen' }))

  const form = el('form', { clase: 'formulario' })
  const campoFecha = crearCampoFecha()
  const campoLugar = crearCampoTexto('Lugar (opcional)')

  const botonCrear = el('button', { clase: 'boton boton-primario', texto: 'Crear sesión' })
  botonCrear.type = 'submit'

  form.append(campoFecha.contenedor, campoLugar.contenedor, botonCrear)
  contenedor.append(form)

  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const fecha = campoFecha.input.value
    if (!fecha) {
      alert('Ingresá una fecha para la sesión.')
      return
    }
    const lugar = campoLugar.input.value.trim() || undefined
    void crearSesion({ fecha, lugar }).then((sesionId) => mostrarPasoAlumnos(contenedor, sesionId))
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
