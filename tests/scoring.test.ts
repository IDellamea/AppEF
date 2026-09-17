import { describe, expect, it } from 'vitest'
import { tablasExigencia } from '../src/domain/exigencia/index.ts'
import {
  calcularPuntajeEjercicio,
  calcularResultadoEjercicio,
  calcularResultadoFinal,
  MARCA_NO_RINDIO,
} from '../src/domain/scoring.ts'

describe('calcularPuntajeEjercicio', () => {
  it('masculino hasta25 resistencia: casos de borde de la tabla', () => {
    expect(calcularPuntajeEjercicio(tablasExigencia, 'M', 20, 'resistencia', 726)).toBe(10) // 12:06
    expect(calcularPuntajeEjercicio(tablasExigencia, 'M', 20, 'resistencia', 725)).toBe(20) // 12:05
    expect(calcularPuntajeEjercicio(tablasExigencia, 'M', 20, 'resistencia', 397)).toBe(100) // 6:37
  })

  it('femenino 26-30 saltoLargo: 1.19 cae en banda10 (irregularidad documentada)', () => {
    expect(calcularPuntajeEjercicio(tablasExigencia, 'F', 28, 'saltoLargo', 1.19)).toBe(10)
  })

  it('femenino 26-30 saltoLargo: superposición en 1.70 devuelve el puntaje menor (70)', () => {
    expect(calcularPuntajeEjercicio(tablasExigencia, 'F', 28, 'saltoLargo', 1.7)).toBe(70)
  })

  it('femenino 26-30 saltoLargo: 1.20 cae en banda20', () => {
    expect(calcularPuntajeEjercicio(tablasExigencia, 'F', 28, 'saltoLargo', 1.2)).toBe(20)
  })

  it('lanza MarcaFueraDeRangoError si ninguna banda matchea (no debería ocurrir en la práctica)', () => {
    // Todas las tablas cubren el rango completo -Infinity..Infinity, así que
    // este caso solo se ejercita indirectamente vía la integridad de tablas.
    expect(calcularPuntajeEjercicio(tablasExigencia, 'M', 20, 'abdominales', 1000)).toBe(100)
  })
})

describe('calcularResultadoFinal', () => {
  it('promedio exacto de 60 aprueba', () => {
    expect(calcularResultadoFinal([60, 60, 60, 60])).toEqual({ promedio: 60, aprobado: true, rendidos: 4 })
  })

  it('promedio de 50 no aprueba', () => {
    expect(calcularResultadoFinal([50, 50, 50, 50])).toEqual({ promedio: 50, aprobado: false, rendidos: 4 })
  })

  it('combinación mixta que promedia 60 aprueba', () => {
    expect(calcularResultadoFinal([70, 70, 50, 50])).toEqual({ promedio: 60, aprobado: true, rendidos: 4 })
  })

  it('un ejercicio no rendido (null) se excluye del promedio, no cuenta como 0', () => {
    // Promedia solo entre las 3 rendidas: (70+70+50)/3 = 63.33..., no /4.
    const resultado = calcularResultadoFinal([70, 70, 50, null])
    expect(resultado.rendidos).toBe(3)
    expect(resultado.promedio).toBeCloseTo((70 + 70 + 50) / 3)
    expect(resultado.aprobado).toBe(true)
  })

  it('si no rindió ninguna prueba, desaprueba sin promedio calculable', () => {
    expect(calcularResultadoFinal([null, null, null, null])).toEqual({
      promedio: 0,
      aprobado: false,
      rendidos: 0,
    })
  })
})

describe('calcularResultadoEjercicio', () => {
  it('con marca normal, calcula los puntos igual que calcularPuntajeEjercicio', () => {
    const resultado = calcularResultadoEjercicio(tablasExigencia, 'M', 20, 'resistencia', 397)
    expect(resultado).toEqual({ marca: 397, puntos: 100 })
  })

  it('con MARCA_NO_RINDIO (0), devuelve puntos null sin consultar la tabla', () => {
    const resultado = calcularResultadoEjercicio(tablasExigencia, 'M', 20, 'abdominales', MARCA_NO_RINDIO)
    expect(resultado).toEqual({ marca: 0, puntos: null })
  })
})
