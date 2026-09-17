/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',
  // Asumimos GitHub Pages de proyecto (usuario.github.io/AppEF/). Si en algún
  // momento se pasa a un dominio propio o a un Pages "de usuario"
  // (usuario.github.io), este base debe cambiarse a '/'.
  base: '/AppEF/',
  build: {
    outDir: 'dist',
  },
  plugins: [
    VitePWA({
      // "prompt" en vez de "autoUpdate": no queremos que la app se recargue
      // sola a mitad de una carga de examen en la cancha. Se le avisa al
      // profesor con un banner y él decide cuándo actualizar.
      registerType: 'prompt',
      // Registramos el service worker a mano en src/pwa/updateBanner.ts
      // (usando virtual:pwa-register) para controlar el momento del banner
      // de actualización, así que no dejamos que el plugin inyecte su
      // propio script de registro automático.
      injectRegister: false,
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Examen de Aptitud Física',
        short_name: 'ExamenEF',
        description: 'Toma del examen de aptitud física anual (Resolución 656/12 JP-DRH) para profesores de educación física.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#0b3d91',
        background_color: '#0b3d91',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
