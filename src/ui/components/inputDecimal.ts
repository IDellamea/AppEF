// Input numérico que acepta coma o punto decimal (para el salto en largo, en metros).

export interface OpcionesInputDecimal {
  valorInicial?: string
}

export function crearInputDecimal(opciones?: OpcionesInputDecimal): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  input.inputMode = 'decimal'
  input.autocomplete = 'off'
  input.placeholder = '0,00'
  input.className = 'input-marca input-decimal'
  if (opciones?.valorInicial) input.value = opciones.valorInicial

  input.addEventListener('input', () => {
    // Permite dígitos y un único separador decimal (coma o punto).
    let valor = input.value.replace(/[^0-9.,]/g, '')
    const primerSeparador = valor.search(/[.,]/)
    if (primerSeparador !== -1) {
      const antes = valor.slice(0, primerSeparador + 1)
      const despues = valor.slice(primerSeparador + 1).replace(/[.,]/g, '')
      valor = antes + despues
    }
    input.value = valor
  })

  return input
}
