// Pantalla principal de carga: un ejercicio, todos los alumnos, autosave por fila.

import { obtenerSesion } from '../../data/sesiones.repo.ts'
import { actualizarResultadoEjercicio, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { crearInputTiempo } from '../components/inputTiempo.ts'
import { crearInputDecimal } from '../components/inputDecimal.ts'
import { parseDecimalComaAr, segundosATiempo, tiempoASegundos } from '../../domain/parseo.ts'
import { el } from '../dom.ts'
import { navegar, type ParametrosRuta } from '../router.ts'
import type { Alumno, Ejercicio } from '../../domain/types.ts'

const ETIQUETAS_EJERCICIO: Record<Ejercicio, string> = {
  resistencia: 'Resistencia',
  abdominales: 'Abdominales',
  flexiones: 'Flexiones',
  saltoLargo: 'Salto en largo',
}

const AYUDA_EJERCICIO: Record<Ejercicio, string> = {
  resistencia: 'Tocá la fila y escribí el tiempo (se arma solo como mm:ss). Confirmá con Enter o pasando al siguiente campo.',
  abdominales: 'Cantidad de repeticiones. Confirmá con Enter o pasando al siguiente campo.',
  flexiones: 'Cantidad de repeticiones. Confirmá con Enter o pasando al siguiente campo.',
  saltoLargo: 'Distancia en metros, con coma o punto decimal (ej: 1,80). Confirmá con Enter o pasando al siguiente campo.',
}

function esEjercicioValido(valor: string | undefined): valor is Ejercicio {
  return (
    valor === 'resistencia' || valor === 'abdominales' || valor === 'flexiones' || valor === 'saltoLargo'
  )
}

export async function render(contenedor: HTMLElement, parametros: ParametrosRuta): Promise<void> {
  const sesionId = Number(parametros.id)
  const tipo = parametros.tipo
  contenedor.innerHTML = ''

  if (!esEjercicioValido(tipo)) {
    contenedor.append(el('p', { clase: 'mensaje-error', texto: 'Ejercicio inválido.' }))
    return
  }
  const ejercicio: Ejercicio = tipo

  const sesion = await obtenerSesion(sesionId)
  if (!sesion) {
    contenedor.append(el('p', { clase: 'mensaje-error', texto: 'La sesión no existe.' }))
    return
  }

  const barraFija = el('div', { clase: 'barra-fija' })
  const botonVolver = el('button', { clase: 'boton boton-texto', texto: '← Volver a ejercicios' })
  botonVolver.addEventListener('click', () => navegar(`/sesion/${sesionId}/ejercicios`))
  barraFija.append(
    botonVolver,
    el('span', { clase: 'barra-fija-titulo', texto: ETIQUETAS_EJERCICIO[ejercicio] }),
  )
  contenedor.append(barraFija)

  contenedor.append(el('p', { clase: 'texto-ayuda', texto: AYUDA_EJERCICIO[ejercicio] }))

  const alumnos = await listarAlumnosDeSesion(sesionId)
  if (alumnos.length === 0) {
    contenedor.append(el('p', { clase: 'texto-ayuda', texto: 'Esta sesión no tiene alumnos cargados.' }))
    return
  }

  const lista = el('div', { clase: 'lista-carga' })
  contenedor.append(lista)

  const inputs: HTMLInputElement[] = []

  alumnos.forEach((alumno, indice) => {
    const { fila, input } = crearFilaCarga(alumno, ejercicio, () => inputs[indice + 1])
    inputs[indice] = input
    lista.append(fila)
  })
}

function crearFilaCarga(
  alumno: Alumno,
  ejercicio: Ejercicio,
  obtenerSiguienteInput: () => HTMLInputElement | undefined,
): { fila: HTMLElement; input: HTMLInputElement } {
  const resultadoActual = alumno.resultados[ejercicio]

  const fila = el('div', { clase: 'fila-carga' })
  if (resultadoActual !== undefined) fila.classList.add('fila-carga--cargada')

  const info = el('div', { clase: 'fila-carga-info' })
  info.append(
    el('span', { clase: 'fila-carga-nombre', texto: `${alumno.apellido}, ${alumno.nombre}` }),
    el('span', { clase: 'fila-carga-detalle', texto: `${alumno.edad} años` }),
  )
  fila.append(info)

  let input: HTMLInputElement
  if (ejercicio === 'resistencia') {
    input = crearInputTiempo({
      valorInicial: resultadoActual ? segundosATiempo(resultadoActual.marca) : '',
    })
  } else if (ejercicio === 'saltoLargo') {
    input = crearInputDecimal({
      valorInicial: resultadoActual ? String(resultadoActual.marca).replace('.', ',') : '',
    })
  } else {
    input = document.createElement('input')
    input.type = 'text'
    input.inputMode = 'numeric'
    input.className = 'input-marca input-entero'
    if (resultadoActual) input.value = String(resultadoActual.marca)
  }
  input.classList.add('input-fila-carga')
  fila.append(input)

  const indicador = el('span', {
    clase: 'fila-carga-indicador',
    texto: resultadoActual ? `✓ ${resultadoActual.puntos} pts` : '',
  })
  fila.append(indicador)

  const mensajeError = el('p', { clase: 'mensaje-error oculto' })
  fila.append(mensajeError)

  function mostrarError(texto: string): void {
    mensajeError.textContent = texto
    mensajeError.classList.remove('oculto')
  }

  let ultimoValorConfirmado: string | null = resultadoActual ? input.value : null

  input.addEventListener('input', () => {
    ultimoValorConfirmado = null
    mensajeError.classList.add('oculto')
  })

  const confirmar = async (): Promise<void> => {
    const valorTexto = input.value.trim()
    if (!valorTexto || valorTexto === ultimoValorConfirmado) return

    let marca: number
    try {
      if (ejercicio === 'resistencia') {
        marca = tiempoASegundos(valorTexto)
      } else if (ejercicio === 'saltoLargo') {
        marca = parseDecimalComaAr(valorTexto)
      } else {
        if (!/^\d+$/.test(valorTexto)) {
          throw new Error('Ingresá un número entero de repeticiones.')
        }
        marca = Number(valorTexto)
      }
    } catch (error) {
      mostrarError(error instanceof Error ? error.message : 'Valor inválido.')
      return
    }

    try {
      const actualizado = await actualizarResultadoEjercicio(alumno.id!, ejercicio, marca)
      const resultado = actualizado.resultados[ejercicio]!
      ultimoValorConfirmado = valorTexto
      indicador.textContent = `✓ ${resultado.puntos} pts`
      fila.classList.add('fila-carga--cargada')
      obtenerSiguienteInput()?.focus()
    } catch (error) {
      mostrarError(error instanceof Error ? error.message : 'No se pudo guardar el resultado.')
    }
  }

  input.addEventListener('blur', () => void confirmar())
  input.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault()
      void confirmar()
    }
  })

  return { fila, input }
}
