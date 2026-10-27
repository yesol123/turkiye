import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/turkishPronunciation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { turkishToHangul } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))

test('keeps the y glide in words without exception entries', () => {
  assert.equal(turkishToHangul('yemek'), '예멕')
  assert.equal(turkishToHangul('yeni'), '예니')
  assert.equal(turkishToHangul('yol'), '욜')
  assert.equal(turkishToHangul('ya ye yi yo yu'), '야 예 이 요 유')
})

test('handles the reported sentence and uppercase with punctuation intact', () => {
  assert.equal(turkishToHangul('Şu an bir elma yemek istiyorum.'), '수 안 비르 엘마 예멕 이스티요룸.')
  assert.equal(turkishToHangul('YEMEK!\nyemek?'), '예멕!\n예멕?')
})

test('preserves existing exceptions and other content', () => {
  assert.equal(turkishToHangul('Merhaba, teşekkür ederim.'), '메르하바, 테셰퀴르 에데림.')
  assert.equal(turkishToHangul('kitap 123 · 안녕하세요'), '키탑 123 · 안녕하세요')
  assert.equal(turkishToHangul(''), '')
})
