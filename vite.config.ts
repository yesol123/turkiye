import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createTranslationHandler, createSpeechHandler, loadTranslationEnv } from './server/translation.mjs'

loadTranslationEnv()
export default defineConfig({
  plugins: [react(), {
    name: 'google-translation-server',
    configureServer(server) { server.middlewares.use(createSpeechHandler()); server.middlewares.use(createTranslationHandler()) },
    configurePreviewServer(server) { server.middlewares.use(createSpeechHandler()); server.middlewares.use(createTranslationHandler()) },
  }],
})
