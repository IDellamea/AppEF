// Input con máscara mm:ss para cargar marcas de resistencia.
// El usuario solo tipea dígitos; el componente va armando el formato mm:ss
// a medida que escribe (los últimos 2 dígitos son siempre "ss").

export interface OpcionesInputTiempo {
  valorInicial?: string
}

export function crearInputTiempo(opciones?: OpcionesInputTiempo): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  input.inputMode = 'numeric'
  input.autocomplete = 'off'
  input.placeholder = 'mm:ss'
  input.maxLength = 5
  input.className = 'input-marca input-tiempo'
  if (opciones?.valorInicial) input.value = opciones.valorInicial

  input.addEventListener('input', () => {
    const soloDigitos = input.value.replace(/\D/g, '').slice(0, 4)
    if (soloDigitos.length <= 2) {
      input.value = soloDigitos
    } else {
      const minutos = soloDigitos.slice(0, soloDigitos.length - 2)
      const segundos = soloDigitos.slice(soloDigitos.length - 2)
      input.value = `${minutos}:${segundos}`
    }
  })

  return input
}
