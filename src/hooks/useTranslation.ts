import { useState } from 'react'

export function useTranslation() {
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  const [translation, setTranslation] = useState('')
  const [translating, setTranslating] = useState(false)

  const translate = async () => {
    if (!input.trim() || translating) return
    setTranslating(true)
    setMessage('')
    setTranslation('')
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
        signal: AbortSignal.timeout(20000),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '번역에 실패했어요. 다시 시도해 주세요.')
      if (typeof data.translation !== 'string') throw new Error('번역 결과를 확인할 수 없어요. 다시 시도해 주세요.')
      // Decode Google HTML entities as text without inserting them into the page.
      const decoder = document.createElement('textarea')
      decoder.innerHTML = data.translation
      setTranslation(decoder.value)
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError'
        ? error.message : '번역 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setTranslating(false)
    }
  }

  const changeInput = (text: string) => {
    setInput(text)
    setMessage('')
    setTranslation('')
  }

  return { input, message, translation, translating, translate, changeInput }
}

export type TranslationModel = ReturnType<typeof useTranslation>
