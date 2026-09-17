import { describe, expect, it } from 'vitest'
import { EdadFueraDeRangoError, obtenerRangoEtario } from '../src/domain/rangoEtario.ts'

describe('obtenerRangoEtario', () => {
  it('edades límite de cada rango', () => {
    expect(obtenerRangoEtario(25)).toBe('hasta25')
    expect(obtenerRangoEtario(26)).toBe('26-30')
    expect(obtenerRangoEtario(30)).toBe('26-30')
    expect(obtenerRangoEtario(31)).toBe('31-35')
    expect(obtenerRangoEtario(35)).toBe('31-35')
    expect(obtenerRangoEtario(36)).toBe('36-40')
    expect(obtenerRangoEtario(40)).toBe('36-40')
  })

  it('cubre edades bajas dentro de hasta25 sin piso arbitrario', () => {
    expect(obtenerRangoEtario(18)).toBe('hasta25')
    expect(obtenerRangoEtario(1)).toBe('hasta25')
  })

  it('lanza EdadFueraDeRangoError para edad > 40', () => {
    expect(() => obtenerRangoEtario(41)).toThrow(EdadFueraDeRangoError)
  })
})
