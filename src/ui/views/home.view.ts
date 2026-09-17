// Pantalla principal: listado de sesiones históricas.

import { eliminarSesion, listarSesiones } from '../../data/sesiones.repo.ts'
import { EJERCICIOS, listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
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

  // Enlace de descarga directa del .apk, para compartir esta misma URL con
  // cualquier profesor: entra desde el celular, toca acá, y Android le
  // ofrece instalarlo (sin pasar por WhatsApp/Drive).
  const enlaceApk = document.createElement('a')
  enlaceApk.href = `${import.meta.env.BASE_URL}descargas/ExamenEF.apk`
  enlaceApk.download = 'ExamenEF.apk'
  enlaceApk.className = 'boton boton-texto enlace-descarga-apk'
  enlaceApk.textContent = '⬇ Descargar app para Android (.apk)'
  contenedor.append(enlaceApk)

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

async function crearTarjetaSesion(sesion: Sesion): Promise<HTMLElement> {
  const id = sesion.id!
  const alumnos = await listarAlumnosDeSesion(id)
  const totalCasillas = alumnos.length * EJERCICIOS.length
  const cargadas = alumnos.reduce(
    (acumulado, alumno) => acumulado + EJERCICIOS.filter((ej) => alumno.resultados[ej] !== undefined).length,
    0,
  )
  const porcentaje = totalCasillas > 0 ? Math.round((cargadas / totalCasillas) * 100) : 0

  const tarjeta = el('div', { clase: 'tarjeta tarjeta-sesion' })
  tarjeta.append(
    el('div', {
      clase: 'tarjeta-titulo',
      texto: sesion.lugar ? `${sesion.fecha} — ${sesion.lugar}` : sesion.fecha,
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
