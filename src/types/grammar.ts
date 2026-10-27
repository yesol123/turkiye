export type GrammarLevel = 'temel1' | 'temel2'

export interface GrammarExample {
  id: string
  label?: string
  turkish: string
  korean: string
  pronunciation?: string
}

export interface GrammarSection {
  id: string
  heading: string
  paragraphs: string[]
  rules: GrammarRule[]
  examples: GrammarExample[]
}

/** Support both plain explanations and structured pattern/description pairs. */
export type GrammarRule = string | { pattern: string; description: string }

export interface GrammarLesson {
  /** Stable ID, e.g. temel1-vowels. Do not change it when editing a title. */
  id: `${GrammarLevel}-${string}`
  level: GrammarLevel
  order: number
  title: string
  turkishTitle?: string
  summary: string
  sections: GrammarSection[]
}

export interface GrammarCourse {
  schemaVersion: 1
  id: GrammarLevel
  title: string
  description: string
  lessons: GrammarLesson[]
}
