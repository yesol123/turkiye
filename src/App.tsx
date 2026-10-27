import { useState } from 'react'
import './App.css'
import './language.css'
import RegionMap from './RegionMap'
import TranslationSpeech from './TranslationSpeech'
import WordDictionary from './WordDictionary'
import { turkishToHangul } from './utils/turkishPronunciation'
function Flag() { return <svg className="flag" viewBox="0 0 60 40" role="img" aria-label="튀르키예 국기"><rect width="60" height="40" rx="4" fill="#e7343f"/><circle cx="25" cy="20" r="11" fill="white"/><circle cx="28" cy="18" r="9" fill="#e7343f"/><path d="m36 13 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" fill="white" transform="rotate(18 36 20)"/></svg> }
const alphabet = [
['A','a','아','araba','자동차'],['B','b','베','bal','꿀'],['C','c','제','cam','유리'],['Ç','ç','체','çay','차'],['D','d','데','deniz','바다'],['E','e','에','ev','집'],['F','f','페','fil','코끼리'],['G','g','게','güneş','태양'],['Ğ','ğ','유무샥 게','dağ','산'],['H','h','헤','hava','공기'],['I','ı','으','ışık','빛'],['İ','i','이','insan','사람'],['J','j','제','jilet','면도날'],['K','k','케','kitap','책'],['L','l','레','limon','레몬'],['M','m','메','merhaba','안녕하세요'],['N','n','네','nar','석류'],['O','o','오','okul','학교'],['Ö','ö','외','öğrenci','학생'],['P','p','페','para','돈'],['R','r','레','renk','색'],['S','s','세','su','물'],['Ş','ş','셰','şeker','설탕'],['T','t','테','tamam','좋아요'],['U','u','우','uzak','먼'],['Ü','ü','위','üzüm','포도'],['V','v','베','var','있다'],['Y','y','예','yol','길'],['Z','z','제','zeytin','올리브']
]
const letterTips: Record<string,string> = { C: '영어 j처럼 /dʒ/ 소리가 나요. Ç의 /tʃ/와 구분해 보세요.', Ç: '영어 ch처럼 /tʃ/ 소리가 나요. çay는 차를 뜻해요.', Ğ: '보통 독립적인 g 소리를 내지 않아요. 앞 모음을 늘이거나 모음 사이를 부드럽게 연결해요.', I: '점 없는 I의 소문자는 ı예요. 한국어 ㅡ와 비슷한 /ɯ/ 소리예요.', İ: '점 있는 İ의 소문자는 i예요. 한국어 이와 비슷한 /i/ 소리예요.', Ö: '에를 말하는 입 모양에서 입술을 둥글게 해 보세요. 한글 외와 정확히 같지는 않아요.', Ü: '이를 말하면서 입술을 둥글게 해 보세요. /y/ 소리예요.', Ş: '영어 sh처럼 /ʃ/ 소리가 나요.', J: '영어 measure의 s처럼 /ʒ/ 소리예요. C와는 달라요.' }
function App() {
 const [tab, setTab] = useState<'home' | 'language'>('home')
 const [letter, setLetter] = useState(alphabet.find(a => a[0] === 'K')!)
 const [languagePage, setLanguagePage] = useState<'alphabet' | 'translate'>('alphabet')

 const [input, setInput] = useState('')
 const [message, setMessage] = useState('')
 const [translation, setTranslation] = useState('')
 const [translating, setTranslating] = useState(false)
 const pronunciation = translation ? turkishToHangul(translation) : ''
 const translate = async () => {
  if (!input.trim() || translating) return
  setTranslating(true); setMessage(''); setTranslation('')
  try {
   const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({text: input}), signal: AbortSignal.timeout(20000) })
   const data = await response.json()
   if (!response.ok) throw new Error(data.error || '번역에 실패했어요. 다시 시도해 주세요.')
   if (typeof data.translation !== 'string') throw new Error('번역 결과를 확인할 수 없어요. 다시 시도해 주세요.')
   // Google may return HTML entities even for plain text; decode as text only.
   const decoder = document.createElement('textarea'); decoder.innerHTML = data.translation
   setTranslation(decoder.value)
  } catch (error) {
   setMessage(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError' ? error.message : '번역 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.')
  } finally { setTranslating(false) }
 }

 return <><header><a href="#" className="brand">merhaba<span className="brand-dot">.</span></a><nav className="main-tabs" aria-label="페이지 메뉴"><button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>홈</button><button className={tab === 'language' ? 'active' : ''} onClick={() => setTab('language')}>언어 <span>Türkçe</span></button></nav><Flag/></header><main>
 {tab === 'home' ? <><section className="intro"><span className="eyebrow">MERHABA, TÜRKİYE</span><h1>처음 만나는 튀르키예.</h1><p>세 도시를 따라, 튀르키예의 일곱 지방을 만나보세요.</p></section>
 <section className="map-section" aria-label="튀르키예 지도">
<RegionMap/>
 </section><div className="country-note"><span>수도 앙카라</span><span>언어 터키어</span><span>화폐 리라 · TRY</span></div></> : <div className="language-shell"><aside className="language-sidebar"><div className="sidebar-title"><span className="eyebrow">TÜRKÇE</span><h2>언어 배우기</h2><p>한 글자에서, 한 문장으로.</p></div><nav aria-label="언어 학습 메뉴"><button className={languagePage === 'alphabet' ? 'current' : ''} aria-current={languagePage === 'alphabet' ? 'page' : undefined} onClick={() => setLanguagePage('alphabet')}><span className="sidebar-icon">Aa</span><span>알파벳<small>글자와 단어 익히기</small></span><span className="sidebar-arrow">→</span></button><button className={languagePage === 'translate' ? 'current' : ''} aria-current={languagePage === 'translate' ? 'page' : undefined} onClick={() => setLanguagePage('translate')}><span className="sidebar-icon">⇄</span><span>번역<small>하고 싶은 말 전하기</small></span><span className="sidebar-arrow">→</span></button></nav><div className="sidebar-footer"><span>조금씩, 매일.</span><p>오늘 배운 한 단어가<br/>내일의 여행을 바꿔요.</p></div></aside><div className="language-content"><div className="language-breadcrumb">언어 <span>/</span> {languagePage === 'alphabet' ? '알파벳' : '번역'}</div>{languagePage === 'alphabet' ? <><section className="language-page-intro"><span className="eyebrow">LETTERS TO WORDS</span><h1>한 글자부터, 천천히.</h1><p>글자를 고르면 단어의 뜻과 쓰임을 함께 배울 수 있어요.</p></section><section className="alphabet-section" aria-labelledby="alphabet-title"><div className="alphabet-heading"><div><span className="eyebrow">01 / ALFABE</span><h2 id="alphabet-title">터키어 알파벳</h2><p>29개의 글자 · 모음 8개와 자음 21개</p></div><span className="alphabet-hint">글자를 눌러 살펴보세요 ↙</span></div><div className="alphabet-layout"><div className="alphabet-grid">{alphabet.map(a => <button key={a[0]} aria-pressed={letter[0] === a[0]} onClick={() => {setLetter(a)}} className={letter[0] === a[0] ? 'chosen' : ''}><strong>{a[0]}<span>{a[1]}</span></strong><small>{a[2]}</small></button>)}</div><aside className="letter-detail"><span className="eyebrow">LETTER NOTES</span><div className="big-letter">{letter[0]}<span>{letter[1]}</span></div><p className="letter-name">글자 이름 · {letter[2]}</p><p className="letter-tip">{letterTips[letter[0]] || '예시 단어를 듣고 글자가 어떻게 소리 나는지 익혀 보세요.'}</p><TranslationSpeech key={letter[0]} text={letter[3]} meaning={letter[4]}/></aside></div><p className="alphabet-note">한글은 글자 이름의 참고 표기예요. 실제 소리는 예시 단어로 들어보세요. Q, W, X는 터키어 기본 알파벳에 없어요. <a href="https://en.wikipedia.org/wiki/Turkish_alphabet" target="_blank" rel="noreferrer">알파벳 자료 ↗</a></p></section><WordDictionary key={letter[3]} word={letter[3]} meaning={letter[4]}/></> : <><section className="language-page-intro"><span className="eyebrow">WORDS THAT CONNECT</span><h1>하고 싶은 말을, 터키어로.</h1><p>한국어로 적고, 번역하고, 터키어 음성으로 들어보세요.</p></section><section className="translator" aria-labelledby="translate-title"><div className="translate-heading"><h2 id="translate-title">어떤 말을 하고 싶으세요?</h2><span className="connection-state">한국어 → 터키어</span></div><div className="translate-panels"><div className="input-panel"><label htmlFor="korean">한국어 <span>KO</span></label><textarea id="korean" maxLength={1000} disabled={translating} placeholder="예: 공항까지 얼마나 걸리나요?" value={input} onChange={e => { setInput(e.target.value); setMessage(''); setTranslation('') }}/><div className="input-bottom"><button className="clear" disabled={!input || translating} onClick={() => { setInput(''); setMessage(''); setTranslation('') }}>지우기</button><span>{input.length} / 1,000</span></div></div><div className="output-panel"><h3>터키어 <span>TR</span></h3><div className={translation ? 'translation-result' : 'result-placeholder'} role="status" aria-live="polite" aria-busy={translating}>{translating ? '터키어로 번역하고 있어요…' : translation || message || '번역된 문장이 여기에 표시돼요.'}</div>{translation && <section className="translation-pronunciation" aria-label="터키어의 한글 발음"><span className="pronunciation-label">한글로 읽기</span><p lang="ko">{pronunciation}</p><small>한글 표기는 발음 참고용이에요. 음성과 함께 익혀보세요.</small></section>}<div className="translation-tools">{translation ? <TranslationSpeech key={translation} text={translation}/> : <span className="output-note">Türkiye’de bir merhaba ile başlar.</span>}</div></div></div><div className="translate-bottom"><p>Google 번역으로 문장을 번역합니다.</p><button className="primary" disabled={!input.trim() || translating} onClick={translate}>{translating ? '번역 중…' : '터키어로 번역'} <span>→</span></button></div></section></>}</div></div>}</main><footer><a href="#" className="brand">merhaba<span className="brand-dot">.</span></a><p>언어 한마디, 여행 한 걸음.</p></footer></>
}
export default App

