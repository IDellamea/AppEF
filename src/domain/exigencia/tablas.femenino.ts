// Tablas de exigencia — PERSONAL FEMENINO — Resolución 656/12 JP-DRH (AIP).
// Transcripción literal de los PDF oficiales. NO modificar los valores,
// salvo las 2 irregularidades documentadas explícitamente más abajo
// (tabla 26-30, columna saltoLargo).

import {
  bandaCrecienteMedia,
  bandaCrecienteMejor,
  bandaCrecientePeor,
  bandaResistenciaMedia,
  bandaResistenciaMejor,
  bandaResistenciaPeor,
} from './helpers.ts'
import type { RangoEtario, TablasPorEjercicio } from '../types.ts'

// PERSONAL FEMENINO — HASTA 25 AÑOS (resistencia = 1600m llanos)
const hasta25: TablasPorEjercicio = {
  resistencia: [
    bandaResistenciaPeor('11:49'),
    bandaResistenciaMedia(20, '11:15', '11:48'),
    bandaResistenciaMedia(30, '10:41', '11:14'),
    bandaResistenciaMedia(40, '10:07', '10:40'),
    bandaResistenciaMedia(50, '09:33', '10:06'),
    bandaResistenciaMedia(60, '08:58', '09:32'),
    bandaResistenciaMedia(70, '08:24', '08:57'),
    bandaResistenciaMedia(80, '07:50', '08:23'),
    bandaResistenciaMedia(90, '07:16', '07:49'),
    bandaResistenciaMejor('07:15'),
  ],
  abdominales: [
    bandaCrecientePeor(27),
    bandaCrecienteMedia(20, 28, 33),
    bandaCrecienteMedia(30, 34, 39),
    bandaCrecienteMedia(40, 40, 44),
    bandaCrecienteMedia(50, 45, 50),
    bandaCrecienteMedia(60, 51, 55),
    bandaCrecienteMedia(70, 56, 61),
    bandaCrecienteMedia(80, 62, 67),
    bandaCrecienteMedia(90, 68, 72),
    bandaCrecienteMejor(73),
  ],
  flexiones: [
    bandaCrecientePeor(25),
    bandaCrecienteMedia(20, 26, 29),
    bandaCrecienteMedia(30, 30, 33),
    bandaCrecienteMedia(40, 34, 37),
    bandaCrecienteMedia(50, 38, 41),
    bandaCrecienteMedia(60, 42, 45),
    bandaCrecienteMedia(70, 46, 48),
    bandaCrecienteMedia(80, 49, 52),
    bandaCrecienteMedia(90, 53, 56),
    bandaCrecienteMejor(57),
  ],
  saltoLargo: [
    bandaCrecientePeor(1.24),
    bandaCrecienteMedia(20, 1.25, 1.32),
    bandaCrecienteMedia(30, 1.33, 1.4),
    bandaCrecienteMedia(40, 1.41, 1.48),
    bandaCrecienteMedia(50, 1.49, 1.57),
    bandaCrecienteMedia(60, 1.58, 1.65),
    bandaCrecienteMedia(70, 1.66, 1.73),
    bandaCrecienteMedia(80, 1.74, 1.82),
    bandaCrecienteMedia(90, 1.83, 1.9),
    bandaCrecienteMejor(1.91),
  ],
}

// PERSONAL FEMENINO — 26 A 30 AÑOS
const rango26a30: TablasPorEjercicio = {
  resistencia: [
    bandaResistenciaPeor('12:22'),
    bandaResistenciaMedia(20, '11:45', '12:21'),
    bandaResistenciaMedia(30, '11:08', '11:44'),
    bandaResistenciaMedia(40, '10:31', '11:07'),
    bandaResistenciaMedia(50, '09:54', '10:30'),
    bandaResistenciaMedia(60, '09:16', '09:53'),
    bandaResistenciaMedia(70, '08:39', '09:15'),
    bandaResistenciaMedia(80, '08:02', '08:38'),
    bandaResistenciaMedia(90, '07:25', '08:01'),
    bandaResistenciaMejor('07:24'),
  ],
  abdominales: [
    bandaCrecientePeor(27),
    bandaCrecienteMedia(20, 28, 32),
    bandaCrecienteMedia(30, 33, 37),
    bandaCrecienteMedia(40, 38, 42),
    bandaCrecienteMedia(50, 43, 47),
    bandaCrecienteMedia(60, 48, 52),
    bandaCrecienteMedia(70, 53, 58),
    bandaCrecienteMedia(80, 59, 64),
    bandaCrecienteMedia(90, 65, 69),
    bandaCrecienteMejor(70),
  ],
  flexiones: [
    bandaCrecientePeor(20),
    bandaCrecienteMedia(20, 21, 25),
    bandaCrecienteMedia(30, 26, 30),
    bandaCrecienteMedia(40, 31, 35),
    bandaCrecienteMedia(50, 36, 39),
    bandaCrecienteMedia(60, 40, 44),
    bandaCrecienteMedia(70, 45, 49),
    bandaCrecienteMedia(80, 50, 53),
    bandaCrecienteMedia(90, 54, 58),
    bandaCrecienteMejor(59),
  ],
  // IRREGULARIDAD DOCUMENTADA DE LA FUENTE OFICIAL (no es error de transcripción):
  // En saltoLargo femenino 26-30 hay (1) un hueco entre banda10 (max oficial=1.18)
  // y banda20 (min=1.20): el valor 1.19 no tiene banda explícita en la
  // resolución; y (2) una superposición entre banda70 (max=1.70) y banda80
  // (min=1.70).
  // Resolución adoptada, sin tocar los demás valores de esta columna:
  // - Hueco: se extiende el `max` de banda10 a 1.199999 (en vez de bajar el
  //   `min` de banda20), de forma que 1.19 caiga en la banda inferior más
  //   cercana (10 puntos).
  // - Superposición en 1.70: se deja tal cual (banda70.max=1.70 y
  //   banda80.min=1.70). Como `bandas.find()` recorre el array en orden y este
  //   está ordenado de peor a mejor marca, una marca de 1.70 matchea primero
  //   banda70 y devuelve 70 puntos — el puntaje más bajo entre los que
  //   matchean, que es el comportamiento conservador correcto. No requiere
  //   ningún ajuste numérico adicional.
  saltoLargo: [
    { puntos: 10, min: -Infinity, max: 1.199999 },
    bandaCrecienteMedia(20, 1.2, 1.26),
    bandaCrecienteMedia(30, 1.27, 1.35),
    bandaCrecienteMedia(40, 1.36, 1.44),
    bandaCrecienteMedia(50, 1.45, 1.52),
    bandaCrecienteMedia(60, 1.53, 1.61),
    bandaCrecienteMedia(70, 1.62, 1.7),
    bandaCrecienteMedia(80, 1.7, 1.79),
    bandaCrecienteMedia(90, 1.8, 1.87),
    bandaCrecienteMejor(1.88),
  ],
}

// PERSONAL FEMENINO — 31 A 35 AÑOS
const rango31a35: TablasPorEjercicio = {
  resistencia: [
    bandaResistenciaPeor('12:30'),
    bandaResistenciaMedia(20, '11:53', '12:29'),
    bandaResistenciaMedia(30, '11:17', '11:52'),
    bandaResistenciaMedia(40, '10:40', '11:16'),
    bandaResistenciaMedia(50, '10:03', '10:39'),
    bandaResistenciaMedia(60, '09:27', '10:02'),
    bandaResistenciaMedia(70, '08:50', '09:26'),
    bandaResistenciaMedia(80, '08:13', '08:49'),
    bandaResistenciaMedia(90, '07:37', '08:12'),
    bandaResistenciaMejor('07:36'),
  ],
  abdominales: [
    bandaCrecientePeor(22),
    bandaCrecienteMedia(20, 23, 28),
    bandaCrecienteMedia(30, 29, 34),
    bandaCrecienteMedia(40, 35, 40),
    bandaCrecienteMedia(50, 41, 45),
    bandaCrecienteMedia(60, 46, 51),
    bandaCrecienteMedia(70, 52, 57),
    bandaCrecienteMedia(80, 58, 62),
    bandaCrecienteMedia(90, 63, 67),
    bandaCrecienteMejor(68),
  ],
  flexiones: [
    bandaCrecientePeor(19),
    bandaCrecienteMedia(20, 20, 24),
    bandaCrecienteMedia(30, 25, 28),
    bandaCrecienteMedia(40, 29, 33),
    bandaCrecienteMedia(50, 34, 37),
    bandaCrecienteMedia(60, 38, 42),
    bandaCrecienteMedia(70, 43, 46),
    bandaCrecienteMedia(80, 47, 51),
    bandaCrecienteMedia(90, 52, 55),
    bandaCrecienteMejor(56),
  ],
  saltoLargo: [
    bandaCrecientePeor(1.16),
    bandaCrecienteMedia(20, 1.17, 1.25),
    bandaCrecienteMedia(30, 1.26, 1.33),
    bandaCrecienteMedia(40, 1.34, 1.42),
    bandaCrecienteMedia(50, 1.43, 1.5),
    bandaCrecienteMedia(60, 1.51, 1.59),
    bandaCrecienteMedia(70, 1.6, 1.67),
    bandaCrecienteMedia(80, 1.68, 1.75),
    bandaCrecienteMedia(90, 1.76, 1.84),
    bandaCrecienteMejor(1.85),
  ],
}

// PERSONAL FEMENINO — 36 A 40 AÑOS
const rango36a40: TablasPorEjercicio = {
  resistencia: [
    bandaResistenciaPeor('12:47'),
    bandaResistenciaMedia(20, '12:09', '12:46'),
    bandaResistenciaMedia(30, '11:30', '12:08'),
    bandaResistenciaMedia(40, '10:52', '11:29'),
    bandaResistenciaMedia(50, '10:13', '10:51'),
    bandaResistenciaMedia(60, '09:35', '10:12'),
    bandaResistenciaMedia(70, '08:56', '09:34'),
    bandaResistenciaMedia(80, '08:18', '08:55'),
    bandaResistenciaMedia(90, '07:39', '08:17'),
    bandaResistenciaMejor('07:38'),
  ],
  abdominales: [
    bandaCrecientePeor(20),
    bandaCrecienteMedia(20, 21, 25),
    bandaCrecienteMedia(30, 26, 31),
    bandaCrecienteMedia(40, 32, 37),
    bandaCrecienteMedia(50, 38, 43),
    bandaCrecienteMedia(60, 44, 49),
    bandaCrecienteMedia(70, 50, 55),
    bandaCrecienteMedia(80, 56, 59),
    bandaCrecienteMedia(90, 60, 64),
    bandaCrecienteMejor(65),
  ],
  flexiones: [
    bandaCrecientePeor(14),
    bandaCrecienteMedia(20, 15, 19),
    bandaCrecienteMedia(30, 20, 24),
    bandaCrecienteMedia(40, 25, 29),
    bandaCrecienteMedia(50, 30, 34),
    bandaCrecienteMedia(60, 35, 39),
    bandaCrecienteMedia(70, 40, 44),
    bandaCrecienteMedia(80, 45, 49),
    bandaCrecienteMedia(90, 50, 53),
    bandaCrecienteMejor(54),
  ],
  saltoLargo: [
    bandaCrecientePeor(1.12),
    bandaCrecienteMedia(20, 1.13, 1.2),
    bandaCrecienteMedia(30, 1.21, 1.29),
    bandaCrecienteMedia(40, 1.3, 1.38),
    bandaCrecienteMedia(50, 1.39, 1.47),
    bandaCrecienteMedia(60, 1.48, 1.56),
    bandaCrecienteMedia(70, 1.57, 1.65),
    bandaCrecienteMedia(80, 1.66, 1.74),
    bandaCrecienteMedia(90, 1.75, 1.83),
    bandaCrecienteMejor(1.84),
  ],
}

export const tablasFemenino: Record<RangoEtario, TablasPorEjercicio> = {
  hasta25,
  '26-30': rango26a30,
  '31-35': rango31a35,
  '36-40': rango36a40,
}
