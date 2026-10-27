import type { GrammarCourse, GrammarLevel } from '../../types/grammar'

function object(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid grammar object')
}
function strings(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string')) throw new Error('Invalid grammar text')
}

/** Validate JSON now; the same boundary can later validate a database response. */
export function parseGrammarCourse(data: unknown, level: GrammarLevel): GrammarCourse {
  object(data)
  if (data.schemaVersion !== 1 || data.id !== level || typeof data.title !== 'string' || typeof data.description !== 'string' || !Array.isArray(data.lessons)) throw new Error(`Invalid grammar course: ${level}`)
  const ids = new Set<string>()
  const orders = new Set<number>()
  const checkId = (id: unknown, prefix: string) => {
    if (typeof id !== 'string' || !id.startsWith(prefix + '-') || !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(id) || ids.has(id)) throw new Error(`Invalid or duplicate grammar ID: ${String(id)}`)
    ids.add(id)
  }
  const lessons = data.lessons.map(lesson => {
    object(lesson)
    checkId(lesson.id, level)
    if (lesson.level !== level || typeof lesson.order !== 'number' || !Number.isInteger(lesson.order) || lesson.order < 1 || orders.has(lesson.order) || typeof lesson.title !== 'string' || typeof lesson.summary !== 'string' || !Array.isArray(lesson.sections)) throw new Error(`Invalid grammar lesson: ${String(lesson.id)}`)
    orders.add(lesson.order)
    if (lesson.turkishTitle !== undefined && typeof lesson.turkishTitle !== 'string') throw new Error('Invalid Turkish lesson title')
    for (const section of lesson.sections) {
      object(section)
      checkId(section.id, String(lesson.id))
      if (typeof section.heading !== 'string' || !Array.isArray(section.rules) || !Array.isArray(section.examples)) throw new Error('Invalid grammar section')
      strings(section.paragraphs)
      for (const rule of section.rules) {
        if (typeof rule === 'string') continue
        object(rule)
        if (typeof rule.pattern !== 'string' || typeof rule.description !== 'string') throw new Error('Invalid grammar rule')
      }
      for (const example of section.examples) {
        object(example)
        checkId(example.id, String(section.id))
        if (typeof example.turkish !== 'string' || typeof example.korean !== 'string') throw new Error('Invalid grammar example')
        if (example.pronunciation !== undefined && typeof example.pronunciation !== 'string') throw new Error('Invalid example pronunciation')
        if (example.label !== undefined && typeof example.label !== 'string') throw new Error('Invalid example label')
      }
    }
    return lesson
  })
  // All nested fields were checked above; preserve the JSON as the only content source.
  return { ...data, lessons: lessons.sort((a, b) => Number(a.order) - Number(b.order)) } as unknown as GrammarCourse
}
