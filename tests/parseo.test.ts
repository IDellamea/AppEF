import { describe, expect, it } from 'vitest'
import { parseDecimalComaAr, segundosATiempo, tiempoASegundos } from '../src/domain/parseo.ts'

describe('tiempoASegundos', () => {
  it('convierte mm:ss a segundos', () => {
    expect(tiempoASegundos('12:06')).toBe(726)
    expect(tiempoASegundos('06:37')).toBe(397)
    expect(tiempoASegundos('00:00')).toBe(0)
  })

  it('lanza error con formato inválido', () => {
    expect(() => tiempoASegundos('abc')).toThrow()
    expect(() => tiempoASegundos('12:06:30')).toThrow()
  })
})

describe('segundosATiempo', () => {
  it('convierte segundos a mm:ss', () => {
    expect(segundosATiempo(726)).toBe('12:06')
    expect(segundosATiempo(397)).toBe('6:37')
    expect(segundosATiempo(0)).toBe('0:00')
  })

  it('es inversa de tiempoASegundos para casos normales', () => {
    expect(tiempoASegundos(segundosATiempo(725))).toBe(725)
  })

  it('lanza error con segundos negativos', () => {
    expect(() => segundosATiempo(-1)).toThrow()
  })
})

describe('parseDecimalComaAr', () => {
  it('convierte coma decimal a number', () => {
    expect(parseDecimalComaAr('1,73')).toBe(1.73)
    expect(parseDecimalComaAr('2,00')).toBe(2)
  })

  it('acepta también punto decimal', () => {
    expect(parseDecimalComaAr('1.73')).toBe(1.73)
  })

  it('lanza error con texto inválido', () => {
    expect(() => parseDecimalComaAr('abc')).toThrow()
  })
})
