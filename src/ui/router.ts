// Router hash simple, sin dependencias externas.

export type ParametrosRuta = Record<string, string>
export type RenderVista = (contenedor: HTMLElement, parametros: ParametrosRuta) => void | Promise<void>

interface Ruta {
  segmentos: string[]
  render: RenderVista
}

const rutas: Ruta[] = []
let contenedorRaiz: HTMLElement | null = null

/** Registra una ruta. Los segmentos que empiezan con ":" son parámetros. */
export function registrarRuta(patron: string, render: RenderVista): void {
  const segmentos = patron.split('/').filter((segmento) => segmento.length > 0)
  rutas.push({ segmentos, render })
}

function obtenerPathActual(): string {
  const hash = window.location.hash.slice(1)
  return hash || '/'
}

function emparejarRuta(path: string): { render: RenderVista; parametros: ParametrosRuta } | null {
  const segmentosActuales = path.split('/').filter((segmento) => segmento.length > 0)

  for (const ruta of rutas) {
    if (ruta.segmentos.length !== segmentosActuales.length) continue

    const parametros: ParametrosRuta = {}
    let coincide = true

    for (let i = 0; i < ruta.segmentos.length; i++) {
      const segmentoPatron = ruta.segmentos[i]!
      const segmentoActual = segmentosActuales[i]!
      if (segmentoPatron.startsWith(':')) {
        parametros[segmentoPatron.slice(1)] = decodeURIComponent(segmentoActual)
      } else if (segmentoPatron !== segmentoActual) {
        coincide = false
        break
      }
    }

    if (coincide) return { render: ruta.render, parametros }
  }

  return null
}

async function manejarCambioDeRuta(): Promise<void> {
  if (!contenedorRaiz) return
  const coincidencia = emparejarRuta(obtenerPathActual())

  if (!coincidencia) {
    contenedorRaiz.innerHTML = '<p>Página no encontrada.</p>'
    return
  }

  try {
    await coincidencia.render(contenedorRaiz, coincidencia.parametros)
  } catch (error) {
    console.error('Error al renderizar la vista:', error)
    contenedorRaiz.innerHTML = '<p class="mensaje-error">Ocurrió un error inesperado al mostrar esta pantalla.</p>'
  }
}

/** Inicializa el router sobre un contenedor y arranca en la ruta actual. */
export function iniciarRouter(contenedor: HTMLElement): void {
  contenedorRaiz = contenedor
  window.addEventListener('hashchange', () => {
    void manejarCambioDeRuta()
  })
  void manejarCambioDeRuta()
}

/** Navega a una ruta (ej: "/sesion/3/ejercicios"). */
export function navegar(path: string): void {
  window.location.hash = path
}
