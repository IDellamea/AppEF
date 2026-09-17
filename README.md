# AppEF — Examen de Aptitud Física (Policía de Chubut)

Aplicación web (PWA) para que los profesores de educación física tomen el
examen de aptitud física anual según la **Resolución Nº 656/12 JP-DRH (AIP)**.
Funciona 100% sin conexión a internet una vez instalada, y está pensada para
usarse desde el celular, parada en la cancha.

No hace falta ser programador para usarla: se abre desde el navegador (o como
app instalada) y se usa tocando botones. Esta guía es para quien la instala o
la mantiene.

## Qué hace

1. Se crea una sesión de examen (fecha y lugar) y se carga la lista de
   alumnos a evaluar.
2. Se elige un ejercicio (Resistencia, Abdominales, Flexiones o Salto en
   largo) y se cargan los resultados de TODOS los alumnos para ese ejercicio,
   uno por uno, con guardado automático fila por fila.
3. Cuando un alumno tiene los 4 ejercicios cargados, la app calcula solo el
   promedio y si aprobó (según las tablas oficiales).
4. Se puede ver un resumen de la sesión y exportarlo a Excel, o hacer un
   respaldo/restauración completa de todos los datos en un archivo JSON.

Todo se guarda en el dispositivo (IndexedDB), no en un servidor.

**Importante:** las tablas de exigencia oficiales y el motor de cálculo de
puntaje (`src/domain/`) ya están 100% testeados (147 tests automáticos) contra
la Resolución 656/12. No deben modificarse sin volver a revisar la
resolución original, porque cualquier cambio ahí afecta directamente si un
alumno aprueba o no.

## Cómo correrlo en desarrollo

Necesitás [Node.js](https://nodejs.org/) instalado (versión 18 o superior).

```bash
npm install
npm run dev
```

Esto abre un servidor local (mira la terminal para ver la dirección, algo
como `http://localhost:5173/AppEF/`). Los cambios en el código se ven al
instante.

Otros comandos útiles:

```bash
npm run test    # corre los 147 tests del motor de dominio + los que agregues
npm run build   # genera la versión de producción en dist/
npm run preview # sirve dist/ localmente para probar el build final
```

## Cómo se publica (deploy)

El proyecto se publica solo a **GitHub Pages** cada vez que se hace push a la
rama `main`, usando GitHub Actions (`.github/workflows/deploy.yml`): instala
dependencias, corre los tests, compila y sube el resultado.

Para que funcione la primera vez, hay que habilitar Pages una sola vez en la
configuración del repositorio:

1. Entrar a **Settings → Pages** del repositorio en GitHub.
2. En "Build and deployment" → "Source", elegir **GitHub Actions**.
3. Hacer push a `main`. La app queda publicada en
   `https://<usuario>.github.io/AppEF/`.

Si el repositorio no se llama `AppEF`, o si se va a usar un dominio propio o
un Pages "de usuario" (`usuario.github.io` sin subcarpeta), hay que ajustar
la propiedad `base` en `vite.config.ts` (está comentado ahí mismo).

## Cómo actualiza la app sola (PWA)

La app se instala en el celular como una PWA. Cuando se publica una versión
nueva (push a `main`), la próxima vez que el profesor abra la app le va a
aparecer un cartel abajo diciendo **"Hay una nueva versión disponible"** con
un botón **"Actualizar"**. La app NO se actualiza sola de golpe a propósito,
para no interrumpir una carga de examen en la mitad de la cancha: el
profesor decide cuándo tocar "Actualizar" (por ejemplo, entre un ejercicio y
otro).

## Cómo generar el .apk instalable (PWABuilder)

Con la app ya publicada en GitHub Pages, se puede generar un instalador
`.apk` para Android sin necesidad de subirla a Google Play:

1. Entrar a [pwabuilder.com](https://www.pwabuilder.com/).
2. Pegar la URL publicada (`https://<usuario>.github.io/AppEF/`) y analizar.
3. Elegir la opción de descargar el paquete para **Android**.
4. Descargar el `.apk` generado y pasarlo al celular (por ejemplo, por
   WhatsApp, Drive o cable USB).
5. En el celular, al abrir el archivo `.apk`, Android va a pedir habilitar
   "Instalar apps de orígenes desconocidos" (u "orígenes no confiables") para
   esa app que se usa para abrirlo (el navegador o el gestor de archivos).
   Hay que habilitarlo y confirmar la instalación.

## Estructura del proyecto

```
src/domain/     → motor de dominio (YA HECHO, 147 tests, no tocar sin revisar la resolución)
src/data/       → persistencia local con Dexie (IndexedDB)
src/export/     → exportación a Excel y respaldo/restauración JSON
src/ui/         → router, vistas y componentes de la interfaz
src/pwa/        → banner de actualización de la PWA
src/styles/     → CSS de toda la app
public/icons/   → íconos de la PWA (ver nota abajo)
scripts/        → script para regenerar los íconos placeholder
```

## Pendiente antes de distribuir masivamente

- **Íconos**: los archivos en `public/icons/` (`icon-192.png`, `icon-512.png`,
  `icon-maskable-512.png`) se generaron con un script propio
  (`scripts/generar-iconos.mjs`, sin dependencias externas) y muestran un
  diseño simple (círculo blanco con las iniciales "EF" sobre fondo azul
  institucional). Son válidos y funcionan, pero conviene reemplazarlos por un
  arte real/definitivo antes de una distribución masiva. Para regenerarlos
  (por ejemplo, si se cambia el color institucional) alcanza con correr
  `node scripts/generar-iconos.mjs`.
- **Restaurar respaldo JSON**: la restauración **agrega** las sesiones y
  alumnos del archivo a los que ya están en el dispositivo (no borra nada).
  Si en algún momento se necesita una opción de "reemplazar todo", hay que
  implementarla como una acción aparte con una confirmación explícita, porque
  sería destructiva.
