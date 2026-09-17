// Captura el evento nativo de instalación de PWA (Chrome/Android) para poder
// ofrecer un botón propio "Instalar app" en vez de depender del aviso
// automático del navegador (que muchos profesores ni notan).

interface EventoInstalacionDiferido extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Escuchador = () => void

let eventoDiferido: EventoInstalacionDiferido | null = null
const escuchadores = new Set<Escuchador>()

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault()
  eventoDiferido = evento as EventoInstalacionDiferido
  escuchadores.forEach((fn) => fn())
})

window.addEventListener('appinstalled', () => {
  eventoDiferido = null
  escuchadores.forEach((fn) => fn())
})

/** true si la app ya está instalada y corriendo en modo standalone (sin navegador). */
export function yaEstaInstalada(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

/** true si el navegador ofreció instalar la app y todavía no se usó ese permiso. */
export function estaListaParaInstalar(): boolean {
  return eventoDiferido !== null
}

/** Se llama cuando cambia la disponibilidad de instalación (aparece o se usa el prompt). */
export function alCambiarDisponibilidad(fn: Escuchador): () => void {
  escuchadores.add(fn)
  return () => escuchadores.delete(fn)
}

/** Dispara el diálogo nativo de instalación. Devuelve el resultado, o null si no está disponible. */
export async function instalarApp(): Promise<'accepted' | 'dismissed' | null> {
  if (!eventoDiferido) return null
  await eventoDiferido.prompt()
  const { outcome } = await eventoDiferido.userChoice
  eventoDiferido = null
  return outcome
}
