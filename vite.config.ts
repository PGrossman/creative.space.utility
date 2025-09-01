import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isElectronBuild = process.env.ELECTRON_BUILD === 'true'
  
  return {
    plugins: [
      react(),
      electron([
        {
          entry: resolve(__dirname, 'src/main/main.ts'), // Absolute path from project root
          vite: {
            build: {
              outDir: resolve(__dirname, 'dist-electron'),
              rollupOptions: {
                external: ['electron']
              }
            }
          }
        },
        {
          entry: resolve(__dirname, 'src/preload/preload.ts'), // Absolute path from project root
          vite: {
            build: {
              outDir: resolve(__dirname, 'dist-electron'),
              rollupOptions: {
                external: ['electron', 'zod'],
                output: {
                  format: 'cjs'
                }
              }
            }
          }
        }
      ])
    ],
    root: 'src/renderer',
    base: './',
    build: {
      outDir: '../../dist-electron/renderer'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})