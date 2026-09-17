// Cronómetro de cuenta regresiva de 1 minuto para abdominales/flexiones.
// El profesor lo usa desde la misma pantalla de carga, sin necesidad de un
// reloj aparte: Iniciar / Finalizar / Reiniciar.

import { el } from '../dom.ts'

const DURACION_SEGUNDOS = 60

function formatearMMSS(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}

/** Beep corto al terminar. Si el navegador no soporta Web Audio, no hace nada. */
function reproducirBeep(): void {
  try {
    const contexto = new AudioContext()
    const oscilador = contexto.createOscillator()
    const ganancia = contexto.createGain()
    oscilador.frequency.value = 880
    ganancia.gain.setValueAtTime(0.25, contexto.currentTime)
    oscilador.connect(ganancia)
    ganancia.connect(contexto.destination)
    oscilador.start()
    oscilador.stop(contexto.currentTime + 0.6)
    oscilador.onended = () => void contexto.close()
  } catch {
    // Sin audio disponible: no es crítico, el aviso visual/vibración alcanza.
  }
}

export function crearTemporizador(): HTMLElement {
  const contenedor = el('div', { clase: 'temporizador' })
  const display = el('div', { clase: 'temporizador-display', texto: formatearMMSS(DURACION_SEGUNDOS) })

  const botonIniciar = el('button', { clase: 'boton boton-primario boton-chico', texto: '▶ Iniciar' })
  const botonFinalizar = el('button', { clase: 'boton boton-secundario boton-chico', texto: '■ Finalizar' })
  const botonReiniciar = el('button', { clase: 'boton boton-texto boton-chico', texto: '↺ Reiniciar' })
  botonIniciar.type = 'button'
  botonFinalizar.type = 'button'
  botonReiniciar.type = 'button'

  const botones = el('div', { clase: 'temporizador-botones' })
  botones.append(botonIniciar, botonFinalizar, botonReiniciar)
  contenedor.append(display, botones)

  let restante = DURACION_SEGUNDOS
  let intervalo: ReturnType<typeof setInterval> | undefined

  function actualizarDisplay(): void {
    display.textContent = formatearMMSS(restante)
  }

  function detener(): void {
    if (intervalo === undefined) return
    clearInterval(intervalo)
    intervalo = undefined
  }

  function iniciar(): void {
    if (intervalo !== undefined || restante <= 0) return
    contenedor.classList.remove('temporizador--fin')
    intervalo = setInterval(() => {
      restante -= 1
      actualizarDisplay()
      if (restante <= 0) {
        detener()
        contenedor.classList.add('temporizador--fin')
        try {
          navigator.vibrate?.([200, 100, 200, 100, 400])
        } catch {
          // Vibración no disponible en este dispositivo/navegador: se ignora.
        }
        reproducirBeep()
      }
    }, 1000)
  }

  function reiniciar(): void {
    detener()
    restante = DURACION_SEGUNDOS
    contenedor.classList.remove('temporizador--fin')
    actualizarDisplay()
  }

  botonIniciar.addEventListener('click', iniciar)
  botonFinalizar.addEventListener('click', detener)
  botonReiniciar.addEventListener('click', reiniciar)

  return contenedor
}
