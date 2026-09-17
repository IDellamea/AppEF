// Barra de navegación fija abajo, para volver a inicio desde cualquier
// pantalla sin tener que usar el botón "atrás" del celular.

import { el } from './dom.ts'
import { navegar } from './router.ts'

export function crearNavInferior(): HTMLElement {
  const nav = el('nav', { clase: 'nav-inferior' })

  const botonHome = el('button', { clase: 'nav-inferior-boton' })
  botonHome.type = 'button'
  botonHome.append(
    el('span', { clase: 'nav-inferior-icono', texto: '🏠' }),
    el('span', { texto: 'Inicio' }),
  )
  botonHome.addEventListener('click', () => navegar('/'))

  nav.append(botonHome)
  return nav
}
