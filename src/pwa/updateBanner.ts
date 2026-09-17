// Banner de actualización de la PWA. Usamos registerType "prompt" (no
// "autoUpdate") a propósito: no queremos recargar la app solos mientras el
// profesor está cargando resultados en la cancha. Se le avisa y ÉL decide
// cuándo actualizar (por ejemplo, entre un ejercicio y otro).

import { registerSW } from 'virtual:pwa-register'

export function iniciarActualizacionesPWA(): void {
  const actualizarSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      mostrarBannerActualizacion(() => {
        void actualizarSW(true)
      })
    },
    onOfflineReady() {
      mostrarToast('La app ya está lista para usarse sin conexión.')
    },
  })
}

function mostrarBannerActualizacion(alConfirmar: () => void): void {
  if (document.querySelector('.banner-actualizacion')) return

  const banner = document.createElement('div')
  banner.className = 'banner-actualizacion'

  const texto = document.createElement('span')
  texto.textContent = 'Hay una nueva versión disponible.'

  const boton = document.createElement('button')
  boton.className = 'boton'
  boton.textContent = 'Actualizar'
  boton.addEventListener('click', () => {
    boton.disabled = true
    boton.textContent = 'Actualizando...'
    alConfirmar()
  })

  banner.append(texto, boton)
  document.body.append(banner)
}

function mostrarToast(texto: string): void {
  const toast = document.createElement('div')
  toast.className = 'toast-offline'
  toast.textContent = texto
  document.body.append(toast)
  setTimeout(() => toast.remove(), 4000)
}
