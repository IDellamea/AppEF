---
name: actualizar-appef
description: Publica cambios de AppEF (examen de aptitud física) a producción — corre tests, compila, sube a git y confirma que el deploy automático a GitHub Pages terminó bien. Trigger — actualizar, publicar, subir cambios, deploy, sacar una versión nueva.
---

# Actualizar AppEF

Esta skill publica el contenido de la app (pantallas, lógica, tablas, estilos)
para que se actualice sola en los celulares donde ya está instalada — sea
como PWA (instalada desde el navegador) o como el `.apk` (TWA), da lo mismo:
las dos cargan el mismo sitio publicado y comparten el mismo service worker.

**No hace falta re-generar ni redistribuir el `.apk`** para esto. El `.apk`
solo se regenera si cambia el "cascarón" nativo (ícono, nombre, colores de
splash) — eso es un proceso aparte, documentado en
`android-twa/BUILD-NOTES.md`, y es mucho menos frecuente.

## Pasos (en orden, no saltear ninguno)

1. **Verificar el código antes de subir nada**:
   ```
   npm run test
   npm run build
   ```
   Si algo falla, arreglarlo primero. Nunca pushear con tests rotos o un
   build que no compila — es lo único que corre en producción.

2. **Revisar qué se va a subir** (`git status`). Nunca usar `git add -A` a
   ciegas en este repo: excluir siempre `android-twa/` (tiene el keystore de
   firma y las herramientas locales, ya está en `.gitignore`, no debería
   aparecer) y `.atl/` (cache de otra herramienta, no es parte del proyecto).
   Si se tocó `public/descargas/ExamenEF.apk` a propósito (regeneración del
   `.apk`), incluirlo; si no, no debería figurar como modificado.

3. **Commit con conventional commits**, describiendo el cambio real (no
   "actualización" a secas). Sin atribución de IA en el mensaje.

4. **Push a `main`**:
   ```
   git push
   ```
   Este push dispara solo el workflow `.github/workflows/deploy.yml`
   (GitHub Actions): corre los tests de nuevo, compila, y publica `dist/` a
   GitHub Pages. No hace falta ningún paso manual de deploy.

5. **Confirmar que el deploy terminó bien**:
   ```
   gh run list --repo IDellamea/AppEF --limit 1
   ```
   Si figura `in_progress`, esperar con `gh run watch <run-id> --repo IDellamea/AppEF --exit-status`
   hasta que termine. Si falla, leer el log del job que rompió antes de
   avisarle al usuario que está listo.

6. **Avisarle al usuario en una frase** que ya está publicado y que los
   celulares con la app instalada (PWA o `.apk`) van a ver el cartel de
   actualización la próxima vez que la abran — no hace falta que hagan nada
   más, y no hace falta reinstalar ni volver a descargar nada.

## Contexto del proyecto (para no repreguntar)

- Repo: `IDellamea/AppEF` (público, GitHub Pages vía Actions).
- App publicada: `https://idellamea.github.io/AppEF/`.
- El `.apk` (si alguna vez hace falta regenerarlo) se compila con
  `android-twa/build-apk.ps1` — ver `android-twa/BUILD-NOTES.md` para los
  detalles y gotchas de esa máquina (JDK/SDK locales, parche de
  `@bubblewrap/cli`, etc.). No es parte de esta skill.
- El service worker usa `registerType: 'prompt'` (no `autoUpdate`) a
  propósito: no interrumpe una carga de examen a mitad de la cancha, le
  aparece un cartel discreto al profesor y él decide cuándo tocar
  "Actualizar".
