import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/data/grammar/validate.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { parseGrammarCourse } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
const lesson = {
  id: 'temel1-vowels', level: 'temel1', order: 1, title: 'Test lesson', summary: 'Test summary',
  sections: [{ id: 'temel1-vowels-overview', heading: 'Test section', paragraphs: ['Test paragraph'], rules: [],
    examples: [{ id: 'temel1-vowels-overview-example-1', turkish: 'Merhaba.', korean: '안녕하세요.' }] }],
}
const course = lessons => ({ schemaVersion: 1, id: 'temel1', title: 'Temel 1', description: 'Test', lessons })

test('both real JSON courses conform to the shared schema', async () => {
  for (const id of ['temel1', 'temel2']) {
    const data = JSON.parse(await readFile(new URL(`../src/data/grammar/${id}.json`, import.meta.url), 'utf8'))
    assert.equal(parseGrammarCourse(data, id).id, id)
    assert.equal(parseGrammarCourse(data, id).lessons.length, data.lessons.length)
  }
})

test('retains stable IDs while ordering lessons for the UI', () => {
  const later = { ...lesson, id: 'temel1-present-tense', order: 2, sections: [] }
  const result = parseGrammarCourse(course([later, lesson]), 'temel1')
  assert.equal(result.lessons[0].id, 'temel1-vowels')
  assert.equal(result.lessons[1].id, 'temel1-present-tense')
})

test('accepts plain text and structured rules without modifying JSON data', () => {
  const input = structuredClone(lesson)
  input.sections[0].rules = ['ben(나) → -(y)Im', { pattern: '-sIn', description: '2인칭 단수' }]
  const snapshot = JSON.stringify(input)
  const result = parseGrammarCourse(course([input]), 'temel1')
  assert.equal(result.lessons[0].sections[0].rules[0], 'ben(나) → -(y)Im')
  assert.equal(result.lessons[0].sections[0].rules[1].pattern, '-sIn')
  assert.equal(JSON.stringify(input), snapshot)
  const invalid = structuredClone(input)
  invalid.sections[0].rules = [42]
  assert.throws(() => parseGrammarCourse(course([invalid]), 'temel1'))
})

test('rejects duplicate IDs, wrong levels, duplicate order and malformed sections', () => {
  assert.throws(() => parseGrammarCourse(course([lesson, lesson]), 'temel1'))
  assert.throws(() => parseGrammarCourse(course([{ ...lesson, level: 'temel2' }]), 'temel1'))
  assert.throws(() => parseGrammarCourse(course([{ ...lesson, id: 'temel2-vowels' }]), 'temel1'))
  assert.throws(() => parseGrammarCourse(course([lesson, { ...lesson, id: 'temel1-other', sections: [] }]), 'temel1'))
  assert.throws(() => parseGrammarCourse(course([{ ...lesson, sections: [{ ...lesson.sections[0], paragraphs: [42] }] }]), 'temel1'))
  const duplicateExamples = structuredClone(lesson)
  duplicateExamples.sections[0].examples.push(duplicateExamples.sections[0].examples[0])
  assert.throws(() => parseGrammarCourse(course([duplicateExamples]), 'temel1'))
})
