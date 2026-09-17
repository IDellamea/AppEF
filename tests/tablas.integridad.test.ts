import { describe, expect, it } from 'vitest'
import { tablasExigencia } from '../src/domain/exigencia/index.ts'
import type { Ejercicio, RangoEtario, Sexo, TablaEjercicio } from '../src/domain/types.ts'

// Red de seguridad contra errores de transcripción en las ~320 cifras de las
// tablas oficiales (Resolución 656/12 JP-DRH - AIP).

const sexos: Sexo[] = ['M', 'F']
const rangos: RangoEtario[] = ['hasta25', '26-30', '31-35', '36-40']
const ejercicios: Ejercicio[] = ['resistencia', 'abdominales', 'flexiones', 'saltoLargo']

// Paso esperado entre el max de una banda y el min de la siguiente (sin
// huecos ni superposiciones): 1 segundo/repetición, o 0.01m para saltoLargo.
function pasoEsperado(ejercicio: Ejercicio): number {
  return ejercicio === 'saltoLargo' ? 0.01 : 1
}

// Irregularidades documentadas de la fuente oficial (ver tablas.femenino.ts,
// comentario en rango26a30.saltoLargo): NO son errores de transcripción, así
// que se excluyen del chequeo genérico de adyacencia entre bandas.
// - par (índice 0,1): hueco entre banda10 (max=1.199999) y banda20 (min=1.20)
// - par (índice 6,7): superposición entre banda70 (max=1.70) y banda80 (min=1.70)
function esParExcluido(sexo: Sexo, rango: RangoEtario, ejercicio: Ejercicio, indice: number): boolean {
  return sexo === 'F' && rango === '26-30' && ejercicio === 'saltoLargo' && (indice === 0 || indice === 6)
}

function verificarExtremos(ejercicio: Ejercicio, bandas: TablaEjercicio): void {
  const primera = bandas[0]!
  const ultima = bandas[bandas.length - 1]!
  if (ejercicio === 'resistencia') {
    // Menos tiempo = mejor: banda10 (peor) abierta hacia +Infinity, banda100 (mejor) abierta hacia -Infinity.
    expect(primera.max).toBe(Infinity)
    expect(ultima.min).toBe(-Infinity)
  } else {
    // Más marca = mejor: banda10 (peor) abierta hacia -Infinity, banda100 (mejor) abierta hacia +Infinity.
    expect(primera.min).toBe(-Infinity)
    expect(ultima.max).toBe(Infinity)
  }
}

describe('integridad de las tablas de exigencia', () => {
  for (const sexo of sexos) {
    for (const rango of rangos) {
      for (const ejercicio of ejercicios) {
        it(`${sexo} / ${rango} / ${ejercicio}: 10 bandas ordenadas de 10 a 100 puntos`, () => {
          const bandas = tablasExigencia[sexo][rango][ejercicio]
          expect(bandas).toHaveLength(10)
          expect(bandas.map((b) => b.puntos)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
        })

        it(`${sexo} / ${rango} / ${ejercicio}: extremos correctamente abiertos`, () => {
          const bandas = tablasExigencia[sexo][rango][ejercicio]
          verificarExtremos(ejercicio, bandas)
        })

        it(`${sexo} / ${rango} / ${ejercicio}: cada banda tiene min <= max`, () => {
          const bandas = tablasExigencia[sexo][rango][ejercicio]
          for (const banda of bandas) {
            expect(banda.min).toBeLessThanOrEqual(banda.max)
          }
        })

        it(`${sexo} / ${rango} / ${ejercicio}: sin huecos ni superposiciones entre bandas consecutivas`, () => {
          const bandas = tablasExigencia[sexo][rango][ejercicio]
          const paso = pasoEsperado(ejercicio)
          for (let i = 0; i < bandas.length - 1; i++) {
            if (esParExcluido(sexo, rango, ejercicio, i)) continue
            const actual = bandas[i]!
            const siguiente = bandas[i + 1]!
            // El array está ordenado de peor a mejor puntaje. En resistencia
            // "mejor" es menos tiempo, así que la marca DECRECE al avanzar en
            // el array; en los demás ejercicios "mejor" es más marca, así que
            // CRECE. La adyacencia se compara en el sentido correspondiente.
            const diferencia =
              ejercicio === 'resistencia' ? actual.min - siguiente.max : siguiente.min - actual.max
            expect(diferencia).toBeCloseTo(paso, 6)
          }
        })
      }
    }
  }
})
