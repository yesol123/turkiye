import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/data/grammar/validate.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { parseGrammarCourse } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))

for (const level of ['temel1', 'temel2']) {
  const data = JSON.parse((await readFile(new URL(`../src/data/grammar/${level}.json`, import.meta.url), 'utf8')).replace(/^\uFEFF/, ''))
  const course = parseGrammarCourse(data, level)
  console.log(`${level}: ${course.lessons.length} lessons validated`)
}
