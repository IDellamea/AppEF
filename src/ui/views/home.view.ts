// Pantalla principal: listado de sesiones históricas.

import { eliminarSesion, listarSesiones } from '../../data/sesiones.repo.ts'
import { EJERCICIOS, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { alCambiarDisponibilidad, estaListaParaInstalar, instalarApp, yaEstaInstalada } from '../../pwa/instalarApp.ts'
import { el } from '../dom.ts'
import { navegar } from '../router.ts'
import type { Sesion } from '../../domain/types.ts'

export async function render(contenedor: HTMLElement): Promise<void> {
  contenedor.innerHTML = ''
  contenedor.append(el('h1', { texto: 'Exámenes de aptitud física' }))

  const acciones = el('div', { clase: 'acciones-principales' })
  const botonNueva = el('button', { clase: 'boton boton-primario', texto: '+ Nueva sesión' })
  botonNueva.addEventListener('click', () => navegar('/sesion/nueva'))
  const botonExportar = el('button', { clase: 'boton boton-secundario', texto: 'Exportar / Respaldo' })
  botonExportar.addEventListener('click', () => navegar('/exportar'))
  acciones.append(botonNueva, botonExportar)
  contenedor.append(acciones)

  contenedor.append(crearBloqueInstalacion())

  const listaContenedor = el('div', { clase: 'lista-sesiones' })
  listaContenedor.append(el('p', { clase: 'texto-ayuda', texto: 'Cargando sesiones...' }))
  contenedor.append(listaContenedor)

  const sesiones = await listarSesiones()
  listaContenedor.innerHTML = ''

  if (sesiones.length === 0) {
    listaContenedor.append(
      el('p', { clase: 'texto-ayuda', texto: 'Todavía no hay sesiones cargadas. Creá la primera con "+ Nueva sesión".' }),
    )
  } else {
    for (const sesion of sesiones) {
      listaContenedor.append(await crearTarjetaSesion(sesion))
    }
  }

  // Número de versión visible para confirmar de un vistazo si ya llegó una
  // actualización, sin depender de que se note el cartel de "nueva versión".
  contenedor.append(el('p', { clase: 'pie-version', texto: `AppEF v${__APP_VERSION__}` }))
}

/**
 * Botón para instalar la PWA (sin pasar por ningún .apk). Usa el evento
 * nativo `beforeinstallprompt` de Chrome/Android; si ya está instalada, no
 * muestra nada, y si el navegador todavía no ofreció instalarla, arranca
 * deshabilitado y se activa solo apenas esté disponible.
 */
function crearBloqueInstalacion(): HTMLElement {
  const contenedor = el('div', { clase: 'bloque-instalacion' })
  if (yaEstaInstalada()) return contenedor

  const boton = el('button', {
    clase: 'boton boton-secundario',
    texto: estaListaParaInstalar() ? '📲 Instalar app' : 'Preparando instalación…',
  })
  boton.disabled = !estaListaParaInstalar()
  boton.addEventListener('click', () => {
    void instalarApp()
  })
  contenedor.append(boton)

  const ayudaFallback = el('p', {
    clase: 'texto-ayuda oculto',
    texto: 'Para instalarla: menú del navegador (⋮) → "Instalar app" o "Agregar a pantalla de inicio".',
  })
  contenedor.append(ayudaFallback)

  const dejarDeEscuchar = alCambiarDisponibilidad(() => {
    if (yaEstaInstalada()) {
      contenedor.innerHTML = ''
      dejarDeEscuchar()
      return
    }
    boton.disabled = !estaListaParaInstalar()
    boton.textContent = estaListaParaInstalar() ? '📲 Instalar app' : 'Preparando instalación…'
  })

  // Si el navegador nunca ofrece instalarla (ej. ya se descartó antes, u
  // otro navegador sin soporte), mostramos instrucciones manuales en vez de
  // dejar un botón deshabilitado para siempre.
  setTimeout(() => {
    if (!estaListaParaInstalar() && !yaEstaInstalada()) {
      boton.classList.add('oculto')
      ayudaFallback.classList.remove('oculto')
    }
  }, 2500)

  return contenedor
}

async function crearTarjetaSesion(sesion: Sesion): Promise<HTMLElement> {
  const id = sesion.id!
  const alumnos = await listarAlumnosDeSesion(id)
  const totalCasillas = alumnos.length * EJERCICIOS.length
  const cargadas = alumnos.reduce(
    (acumulado, alumno) => acumulado + EJERCICIOS.filter((ej) => alumno.resultados[ej] !== undefined).length,
    0,
  )
  const porcentaje = totalCasillas > 0 ? Math.round((cargadas / totalCasillas) * 100) : 0

  const lugarCompleto = [sesion.lugar, sesion.ciudad].filter(Boolean).join(', ')

  const tarjeta = el('div', { clase: 'tarjeta tarjeta-sesion' })
  tarjeta.append(
    el('div', {
      clase: 'tarjeta-titulo',
      texto: lugarCompleto ? `${sesion.fecha} — ${lugarCompleto}` : sesion.fecha,
    }),
    el('div', {
      clase: 'tarjeta-detalle',
      texto: sesion.profesor ? `Prof. ${sesion.profesor}` : 'Sin profesor/a registrado',
    }),
    el('div', {
      clase: 'tarjeta-detalle',
      texto: `${alumnos.length} alumno(s) · ${porcentaje}% de ejercicios cargados`,
    }),
  )

  const acciones = el('div', { clase: 'tarjeta-acciones' })
  const botonAbrir = el('button', { clase: 'boton boton-primario', texto: 'Abrir' })
  botonAbrir.addEventListener('click', () => navegar(`/sesion/${id}/ejercicios`))

  const botonEliminar = el('button', { clase: 'boton boton-peligro', texto: 'Eliminar' })
  botonEliminar.addEventListener('click', () => {
    const confirmado = confirm(
      `¿Eliminar la sesión del ${sesion.fecha}? Se van a borrar también sus alumnos. Esta acción no se puede deshacer.`,
    )
    if (!confirmado) return
    void eliminarSesion(id).then(() => tarjeta.remove())
  })

  acciones.append(botonAbrir, botonEliminar)
  tarjeta.append(acciones)

  return tarjeta
}
