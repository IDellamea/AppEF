// Barra de navegación fija abajo: Volver e Inicio, disponibles desde
// cualquier pantalla. Reemplaza los links de texto "Volver a ejercicios" /
// "Volver a sesiones" que había sueltos en cada vista.

import { el } from './dom.ts'
import { navegar } from './router.ts'

const ICONO_VOLVER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`

const ICONO_INICIO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 9.5 9-7 9 7"/><path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10"/></svg>`

function crearIcono(svg: string): HTMLElement {
  const contenedor = el('span', { clase: 'nav-inferior-icono' })
  contenedor.innerHTML = svg
  return contenedor
}

function estaEnInicio(): boolean {
  const hash = window.location.hash.slice(1)
  return hash === '' || hash === '/'
}

export function crearNavInferior(): HTMLElement {
  const nav = el('nav', { clase: 'nav-inferior' })

  const botonVolver = el('button', { clase: 'nav-inferior-boton' })
  botonVolver.type = 'button'
  botonVolver.append(crearIcono(ICONO_VOLVER), el('span', { texto: 'Volver' }))
  botonVolver.setAttribute('aria-label', 'Volver a la pantalla anterior')
  botonVolver.addEventListener('click', () => window.history.back())

  const botonHome = el('button', { clase: 'nav-inferior-boton' })
  botonHome.type = 'button'
  botonHome.append(crearIcono(ICONO_INICIO), el('span', { texto: 'Inicio' }))
  botonHome.setAttribute('aria-label', 'Ir al inicio')
  botonHome.addEventListener('click', () => navegar('/'))

  const actualizarEstadoVolver = (): void => {
    botonVolver.disabled = estaEnInicio()
  }
  actualizarEstadoVolver()
  window.addEventListener('hashchange', actualizarEstadoVolver)

  nav.append(botonVolver, botonHome)
  return nav
}
