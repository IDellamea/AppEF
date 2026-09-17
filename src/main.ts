// Punto de entrada de la aplicación.

import './styles/app.css'
import { iniciarRouter, registrarRuta } from './ui/router.ts'
import { iniciarActualizacionesPWA } from './pwa/updateBanner.ts'

import { render as renderHome } from './ui/views/home.view.ts'
import { render as renderNuevaSesion } from './ui/views/nuevaSesion.view.ts'
import { render as renderSeleccionEjercicio } from './ui/views/seleccionEjercicio.view.ts'
import { render as renderCargaEjercicio } from './ui/views/cargaEjercicio.view.ts'
import { render as renderResumenSesion } from './ui/views/resumenSesion.view.ts'
import { render as renderExportar } from './ui/views/exportar.view.ts'

registrarRuta('/', renderHome)
registrarRuta('/sesion/nueva', renderNuevaSesion)
registrarRuta('/sesion/:id/ejercicios', renderSeleccionEjercicio)
registrarRuta('/sesion/:id/ejercicio/:tipo', renderCargaEjercicio)
registrarRuta('/sesion/:id/resumen', renderResumenSesion)
registrarRuta('/exportar', renderExportar)

const app = document.querySelector<HTMLDivElement>('#app')
if (app) {
  iniciarRouter(app)
}

iniciarActualizacionesPWA()
