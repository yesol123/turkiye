import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createTranslationHandler, createSpeechHandler, loadTranslationEnv } from './server/translation.mjs'

loadTranslationEnv()
export default defineConfig({
  cacheDir: 'node_modules/.vite-browser',
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  plugins: [react(), {
    name: 'google-translation-server',
    configureServer(server) { server.middlewares.use(createSpeechHandler()); server.middlewares.use(createTranslationHandler()) },
    configurePreviewServer(server) { server.middlewares.use(createSpeechHandler()); server.middlewares.use(createTranslationHandler()) },
  }],
})
