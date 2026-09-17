import { tablasFemenino } from './tablas.femenino.ts'
import { tablasMasculino } from './tablas.masculino.ts'
import type { TablasExigencia } from '../types.ts'

export const tablasExigencia: TablasExigencia = {
  M: tablasMasculino,
  F: tablasFemenino,
}
