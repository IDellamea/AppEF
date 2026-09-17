// Input para el salto en largo: el profesor escribe la distancia en
// centímetros, tal como la lee en la cinta métrica, sin coma ni punto
// decimal (ej. "215" = 2,15 m). Esto evita el error más común del campo
// (olvidarse la coma). Solo admite dígitos.

export interface OpcionesInputDecimal {
  valorInicial?: string
}

export function crearInputDecimal(opciones?: OpcionesInputDecimal): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  input.inputMode = 'numeric'
  input.autocomplete = 'off'
  input.placeholder = 'cm (ej: 180)'
  input.className = 'input-marca input-decimal'
  if (opciones?.valorInicial) input.value = opciones.valorInicial

  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '')
  })

  return input
}
