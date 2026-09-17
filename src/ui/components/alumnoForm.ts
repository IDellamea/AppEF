// Formulario de alta de un alumno (usado en la pantalla de nueva sesión).

import { EdadFueraDeRangoError, obtenerRangoEtario } from '../../domain/rangoEtario.ts'
import { el } from '../dom.ts'
import type { Sexo } from '../../domain/types.ts'

export interface DatosNuevoAlumno {
  nombre: string
  apellido: string
  edad: number
  sexo: Sexo
  lugarTrabajo: string
  jerarquia: string
}

function crearInputTexto(placeholder: string): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = placeholder
  input.autocomplete = 'off'
  return input
}

function campoConEtiqueta(texto: string, control: HTMLElement): HTMLElement {
  const etiqueta = el('label', { clase: 'campo' })
  etiqueta.append(el('span', { clase: 'campo-etiqueta', texto }), control)
  return etiqueta
}

/**
 * Crea el formulario de alta de alumno. Al agregar uno con éxito, limpia
 * apellido/nombre/edad para cargar rápido al siguiente, pero conserva
 * sexo/lugar de trabajo/jerarquía: en la práctica se suele cargar a varios
 * alumnos seguidos del mismo lugar de trabajo y jerarquía similar.
 */
export function crearAlumnoForm(
  onAgregar: (datos: DatosNuevoAlumno) => void | Promise<void>,
): HTMLFormElement {
  const form = el('form', { clase: 'formulario formulario-alumno' })

  const inputApellido = crearInputTexto('Apellido')
  const inputNombre = crearInputTexto('Nombre')

  const inputEdad = document.createElement('input')
  inputEdad.type = 'number'
  inputEdad.inputMode = 'numeric'
  inputEdad.min = '1'
  inputEdad.placeholder = 'Edad'

  const selectSexo = document.createElement('select')
  selectSexo.append(new Option('Masculino', 'M'), new Option('Femenino', 'F'))

  const inputLugar = crearInputTexto('Lugar de trabajo')
  const inputJerarquia = crearInputTexto('Jerarquía')

  const mensajeError = el('p', { clase: 'mensaje-error oculto' })

  form.append(
    campoConEtiqueta('Apellido', inputApellido),
    campoConEtiqueta('Nombre', inputNombre),
    campoConEtiqueta('Edad', inputEdad),
    campoConEtiqueta('Sexo', selectSexo),
    campoConEtiqueta('Lugar de trabajo', inputLugar),
    campoConEtiqueta('Jerarquía', inputJerarquia),
    mensajeError,
  )

  const botonAgregar = el('button', { clase: 'boton boton-primario', texto: '+ Agregar alumno' })
  botonAgregar.type = 'submit'
  form.append(botonAgregar)

  function mostrarError(texto: string): void {
    mensajeError.textContent = texto
    mensajeError.classList.remove('oculto')
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    mensajeError.classList.add('oculto')

    const apellido = inputApellido.value.trim()
    const nombre = inputNombre.value.trim()
    const lugarTrabajo = inputLugar.value.trim()
    const jerarquia = inputJerarquia.value.trim()
    const sexo = selectSexo.value as Sexo

    if (!apellido || !nombre || !inputEdad.value || !lugarTrabajo || !jerarquia) {
      mostrarError('Completá todos los campos.')
      return
    }

    const edad = Number(inputEdad.value)

    try {
      obtenerRangoEtario(edad)
    } catch (error) {
      if (error instanceof EdadFueraDeRangoError) {
        mostrarError(error.message)
        return
      }
      throw error
    }

    void Promise.resolve(
      onAgregar({ nombre, apellido, edad, sexo, lugarTrabajo, jerarquia }),
    ).then(() => {
      inputApellido.value = ''
      inputNombre.value = ''
      inputEdad.value = ''
      inputApellido.focus()
    })
  })

  return form
}
