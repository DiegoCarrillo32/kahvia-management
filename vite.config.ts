/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    react() as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tailwindcss() as any,
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["assets/images/LOGO-19.svg", "assets/fonts/**/*"],
      manifest: {
        name: "Kahvia Management",
        short_name: "Kahvia",
        description: "Sistema de gestión de órdenes e inventario de Kahvia",
        theme_color: "#410505",
        background_color: "#fff5e1",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/assets/images/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/images/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/images/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,otf}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ],
});
