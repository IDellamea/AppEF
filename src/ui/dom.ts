// Helper mínimo para crear elementos del DOM sin depender de un framework.

interface OpcionesElemento {
  clase?: string
  texto?: string
  atributos?: Record<string, string>
  hijos?: (HTMLElement | string)[]
}

export function el<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  opciones?: OpcionesElemento,
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(etiqueta)
  if (opciones?.clase) elemento.className = opciones.clase
  if (opciones?.texto !== undefined) elemento.textContent = opciones.texto
  if (opciones?.atributos) {
    for (const [clave, valor] of Object.entries(opciones.atributos)) {
      elemento.setAttribute(clave, valor)
    }
  }
  if (opciones?.hijos) {
    elemento.append(...opciones.hijos)
  }
  return elemento
}
