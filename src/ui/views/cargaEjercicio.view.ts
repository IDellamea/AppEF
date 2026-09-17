// Pantalla principal de carga: un ejercicio, todos los alumnos, autosave por fila.

import { obtenerSesion } from '../../data/sesiones.repo.ts'
import { actualizarResultadoEjercicio, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { crearInputTiempo } from '../components/inputTiempo.ts'
import { crearInputDecimal } from '../components/inputDecimal.ts'
import { crearTemporizador } from '../components/temporizador.ts'
import { metrosDesdeCentimetros, segundosATiempo, tiempoASegundos } from '../../domain/parseo.ts'
import { el } from '../dom.ts'
import { type ParametrosRuta } from '../router.ts'
import type { Alumno, Ejercicio } from '../../domain/types.ts'

const ETIQUETAS_EJERCICIO: Record<Ejercicio, string> = {
  resistencia: 'Resistencia',
  abdominales: 'Abdominales',
  flexiones: 'Flexiones',
  saltoLargo: 'Salto en largo',
}

const AYUDA_EJERCICIO: Record<Ejercicio, string> = {
  resistencia:
    'Tocá la fila y escribí el tiempo (se arma solo como mm:ss). Confirmá con Enter o pasando al siguiente campo. Si el alumno no rinde esta prueba, cargá 0:00.',
  abdominales:
    'Cantidad de repeticiones. Confirmá con Enter o pasando al siguiente campo. Si el alumno no rinde esta prueba, cargá 0.',
  flexiones:
    'Cantidad de repeticiones. Confirmá con Enter o pasando al siguiente campo. Si el alumno no rinde esta prueba, cargá 0.',
  saltoLargo:
    'Distancia en CENTÍMETROS, sin coma (ej: 180 = 1,80 m). Confirmá con Enter o pasando al siguiente campo. Si el alumno no rinde esta prueba, cargá 0.',
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
  barraFija.append(el('span', { clase: 'barra-fija-titulo', texto: ETIQUETAS_EJERCICIO[ejercicio] }))
  contenedor.append(barraFija)

  contenedor.append(el('p', { clase: 'texto-ayuda', texto: AYUDA_EJERCICIO[ejercicio] }))

  // El cronómetro de 1 minuto solo tiene sentido en las pruebas que se toman
  // contrarreloj de esa forma. Resistencia se cronometra con la carrera en sí
  // (no con un cronómetro de escritorio) y salto en largo no es una prueba de
  // tiempo, así que no lo necesitan.
  if (ejercicio === 'abdominales' || ejercicio === 'flexiones') {
    contenedor.append(crearTemporizador())
  }

  const alumnos = await listarAlumnosDeSesion(sesionId)
  if (alumnos.length === 0) {
    contenedor.append(el('p', { clase: 'texto-ayuda', texto: 'Esta sesión no tiene alumnos cargados.' }))
    return
  }

  const lista = el('div', { clase: 'lista-carga' })
  contenedor.append(lista)

  let pendientes = alumnos.filter((a) => a.resultados[ejercicio] === undefined).length
  let avisoMostrado = false

  // Solo confirma que ya se cargó a todos — no navega a ningún lado. El
  // profesor decide cuándo pasar a otra pantalla (con "Volver" o "Inicio").
  const avisarCargaCompleta = (): void => {
    pendientes -= 1
    if (pendientes > 0 || avisoMostrado) return
    avisoMostrado = true
    contenedor.append(
      el('p', { clase: 'texto-ayuda texto-ayuda--exito', texto: '¡Listo, ya cargaste a todos los alumnos!' }),
    )
  }

  for (const alumno of alumnos) {
    lista.append(crearFilaCarga(alumno, ejercicio, avisarCargaCompleta))
  }
}

function crearFilaCarga(alumno: Alumno, ejercicio: Ejercicio, onPrimeraCarga: () => void): HTMLElement {
  const resultadoActual = alumno.resultados[ejercicio]
  let yaContabilizado = resultadoActual !== undefined

  const fila = el('div', { clase: 'fila-carga' })
  aplicarEstiloCargada(fila, resultadoActual)

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
      valorInicial: resultadoActual ? String(Math.round(resultadoActual.marca * 100)) : '',
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

  let previaMetros: HTMLElement | null = null
  if (ejercicio === 'saltoLargo') {
    fila.classList.add('fila-carga--con-previa')
    previaMetros = el('span', {
      clase: 'fila-carga-previa',
      texto: resultadoActual ? `= ${resultadoActual.marca.toFixed(2)} m` : '',
    })
    fila.append(previaMetros)
    input.addEventListener('input', () => {
      if (!previaMetros) return
      try {
        previaMetros.textContent = `= ${metrosDesdeCentimetros(input.value).toFixed(2)} m`
      } catch {
        previaMetros.textContent = ''
      }
    })
  }

  const indicador = el('span', {
    clase: 'fila-carga-indicador',
    texto: resultadoActual ? textoIndicador(resultadoActual.puntos) : '',
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
        marca = metrosDesdeCentimetros(valorTexto)
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
      indicador.textContent = textoIndicador(resultado.puntos)
      aplicarEstiloCargada(fila, resultado)
      if (!yaContabilizado) {
        yaContabilizado = true
        onPrimeraCarga()
      }
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

  return fila
}

function textoIndicador(puntos: number | null): string {
  return puntos === null ? '⚠ No rindió' : `✓ ${puntos} pts`
}

/** Verde si rindió y sacó puntaje, ámbar si se cargó como "no rindió". */
function aplicarEstiloCargada(fila: HTMLElement, resultado: { puntos: number | null } | undefined): void {
  fila.classList.remove('fila-carga--cargada', 'fila-carga--no-rindio')
  if (resultado === undefined) return
  fila.classList.add(resultado.puntos === null ? 'fila-carga--no-rindio' : 'fila-carga--cargada')
}
