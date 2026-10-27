import type { LanguagePageId } from '../types/navigation'

export const languageNavigation: { id: LanguagePageId; icon: string; title: string; description: string }[] = [
  { id: 'alphabet', icon: 'Aa', title: '알파벳', description: '글자와 단어 익히기' },
  { id: 'grammar', icon: '文', title: '기본 문법', description: 'Temel 1 · Temel 2' },
  { id: 'translate', icon: '⇄', title: '번역', description: '하고 싶은 말 전하기' },
]

export const languagePageTitles = Object.fromEntries(languageNavigation.map(item => [item.id, item.title])) as Record<LanguagePageId, string>
