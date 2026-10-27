import type { IncomingMessage, ServerResponse } from 'node:http'
export function loadTranslationEnv(): void
export function createTranslationHandler(options?: { fetchImpl?: typeof fetch; getKey?: () => string | undefined }): (req: IncomingMessage, res: ServerResponse, next?: () => void) => Promise<void>
export function createSpeechHandler(options?: { fetchImpl?: typeof fetch; getKey?: () => string | undefined }): (req: IncomingMessage, res: ServerResponse, next?: () => void) => Promise<void>
