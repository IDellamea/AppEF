import { describe, expect, it } from 'vitest'
import { metrosDesdeCentimetros, segundosATiempo, tiempoASegundos } from '../src/domain/parseo.ts'

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

describe('metrosDesdeCentimetros', () => {
  it('convierte centímetros escritos sin coma a metros', () => {
    expect(metrosDesdeCentimetros('215')).toBe(2.15)
    expect(metrosDesdeCentimetros('173')).toBe(1.73)
    expect(metrosDesdeCentimetros('95')).toBe(0.95)
  })

  it('ignora caracteres que no sean dígitos (ej. si alguien igual escribe la coma)', () => {
    expect(metrosDesdeCentimetros('2,15')).toBe(2.15)
  })

  it('lanza error con texto vacío', () => {
    expect(() => metrosDesdeCentimetros('')).toThrow()
    expect(() => metrosDesdeCentimetros('abc')).toThrow()
  })

  it('lanza error fuera del rango razonable (nadie salta 20 metros o más)', () => {
    expect(() => metrosDesdeCentimetros('2000')).toThrow()
  })

  it('"0" es un caso especial permitido: marca de "no rindió", no un error', () => {
    expect(metrosDesdeCentimetros('0')).toBe(0)
  })
})
