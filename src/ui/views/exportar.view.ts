// Exportar a Excel (por sesión o histórico) y respaldo/restauración en JSON.

import { listarSesiones } from '../../data/sesiones.repo.ts'
import { listarAlumnosDeSesion } from '../../data/alumnos.repo.ts'
import { generarExcelHistorico, generarExcelSesion } from '../../export/excel.ts'
import { exportarRespaldoJSON, importarRespaldoJSON } from '../../export/backup.ts'
import { el } from '../dom.ts'
import { navegar } from '../router.ts'
import type { Alumno } from '../../domain/types.ts'

export async function render(contenedor: HTMLElement): Promise<void> {
  contenedor.innerHTML = ''
  contenedor.append(el('h1', { texto: 'Exportar y respaldo' }))

  const sesiones = await listarSesiones()

  contenedor.append(el('h2', { texto: 'Exportar una sesión a Excel' }))
  if (sesiones.length === 0) {
    contenedor.append(el('p', { clase: 'texto-ayuda', texto: 'No hay sesiones cargadas todavía.' }))
  } else {
    const select = document.createElement('select')
    select.className = 'select-sesion'
    for (const sesion of sesiones) {
      const etiqueta = sesion.lugar ? `${sesion.fecha} — ${sesion.lugar}` : sesion.fecha
      select.append(new Option(etiqueta, String(sesion.id ?? '')))
    }
    const botonExportarSesion = el('button', {
      clase: 'boton boton-primario',
      texto: 'Exportar sesión seleccionada',
    })
    botonExportarSesion.addEventListener('click', () => {
      const sesionId = Number(select.value)
      const sesion = sesiones.find((s) => s.id === sesionId)
      if (!sesion) return
      void listarAlumnosDeSesion(sesionId).then((alumnos) => generarExcelSesion(sesion, alumnos))
    })
    contenedor.append(select, botonExportarSesion)
  }

  contenedor.append(el('h2', { texto: 'Exportar histórico completo' }))
  const botonHistorico = el('button', {
    clase: 'boton boton-primario',
    texto: 'Exportar todas las sesiones a Excel',
  })
  botonHistorico.disabled = sesiones.length === 0
  botonHistorico.addEventListener('click', () => {
    void (async () => {
      const alumnosPorSesion = new Map<number, Alumno[]>()
      for (const sesion of sesiones) {
        if (sesion.id === undefined) continue
        alumnosPorSesion.set(sesion.id, await listarAlumnosDeSesion(sesion.id))
      }
      generarExcelHistorico(sesiones, alumnosPorSesion)
    })()
  })
  contenedor.append(botonHistorico)

  contenedor.append(el('h2', { texto: 'Respaldo completo (JSON)' }))
  contenedor.append(
    el('p', {
      clase: 'texto-ayuda',
      texto: 'El respaldo incluye todas las sesiones y alumnos guardados en este dispositivo.',
    }),
  )

  const botonDescargarRespaldo = el('button', {
    clase: 'boton boton-secundario',
    texto: 'Descargar respaldo JSON',
  })
  botonDescargarRespaldo.addEventListener('click', () => void exportarRespaldoJSON())
  contenedor.append(botonDescargarRespaldo)

  contenedor.append(el('h3', { texto: 'Restaurar desde respaldo JSON' }))
  contenedor.append(
    el('p', {
      clase: 'texto-ayuda',
      texto: 'Restaurar AGREGA las sesiones y alumnos del archivo a los que ya tenés en este dispositivo. No borra nada existente.',
    }),
  )

  const inputArchivo = document.createElement('input')
  inputArchivo.type = 'file'
  inputArchivo.accept = 'application/json,.json'
  inputArchivo.className = 'input-archivo'

  const mensajeRestaurar = el('p', { clase: 'mensaje-error oculto' })

  const botonRestaurar = el('button', {
    clase: 'boton boton-secundario',
    texto: 'Restaurar desde archivo',
  })
  botonRestaurar.addEventListener('click', () => {
    mensajeRestaurar.classList.add('oculto')
    const archivo = inputArchivo.files?.[0]
    if (!archivo) {
      alert('Elegí primero un archivo de respaldo (.json).')
      return
    }
    const confirmado = confirm(
      'Esto AGREGA las sesiones y alumnos del archivo a los que ya tenés en este dispositivo (no borra nada existente). ¿Continuar?',
    )
    if (!confirmado) return

    importarRespaldoJSON(archivo)
      .then((resultado) => {
        alert(`Se restauraron ${resultado.sesiones} sesión(es) y ${resultado.alumnos} alumno(s).`)
        navegar('/')
      })
      .catch((error: unknown) => {
        mensajeRestaurar.textContent =
          error instanceof Error ? error.message : 'No se pudo restaurar el respaldo.'
        mensajeRestaurar.classList.remove('oculto')
      })
  })

  contenedor.append(
    el('div', { clase: 'campo-archivo', hijos: [inputArchivo, botonRestaurar] }),
    mensajeRestaurar,
  )

  const botonVolver = el('button', { clase: 'boton boton-texto', texto: '← Volver al inicio' })
  botonVolver.addEventListener('click', () => navegar('/'))
  contenedor.append(botonVolver)
}
