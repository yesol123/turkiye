import PageIntro from '../../components/common/PageIntro'
import TranslationSpeech from '../../components/audio/TranslationSpeech'
import WordDictionary from '../../components/dictionary/WordDictionary'
import { alphabet, letterTips, type AlphabetLetter } from '../../data/alphabet'

export default function AlphabetPage({ letter, onSelect }: { letter: AlphabetLetter; onSelect: (letter: AlphabetLetter) => void }) {
  return <>
    <PageIntro eyebrow="LETTERS TO WORDS" title="한 글자부터, 천천히." description="글자를 고르면 단어의 뜻과 쓰임을 함께 배울 수 있어요."/>
    <section className="alphabet-section" aria-labelledby="alphabet-title">
      <div className="alphabet-heading">
        <div><span className="eyebrow">01 / ALFABE</span><h2 id="alphabet-title">터키어 알파벳</h2><p>29개의 글자 · 모음 8개와 자음 21개</p></div>
        <span className="alphabet-hint">글자를 눌러 살펴보세요 ↙</span>
      </div>
      <div className="alphabet-layout">
        <div className="alphabet-grid">
          {alphabet.map(item => <button key={item[0]} aria-pressed={letter[0] === item[0]} onClick={() => onSelect(item)} className={letter[0] === item[0] ? 'chosen' : ''}>
            <strong>{item[0]}<span>{item[1]}</span></strong><small>{item[2]}</small>
          </button>)}
        </div>
        <aside className="letter-detail">
          <span className="eyebrow">LETTER NOTES</span>
          <div className="big-letter">{letter[0]}<span>{letter[1]}</span></div>
          <p className="letter-name">글자 이름 · {letter[2]}</p>
          <p className="letter-tip">{letterTips[letter[0]] || '예시 단어를 듣고 글자가 어떻게 소리 나는지 익혀 보세요.'}</p>
          <TranslationSpeech key={letter[0]} text={letter[3]} meaning={letter[4]}/>
        </aside>
      </div>
      <p className="alphabet-note">한글은 글자 이름의 참고 표기예요. 실제 소리는 예시 단어로 들어보세요. Q, W, X는 터키어 기본 알파벳에 없어요. <a href="https://en.wikipedia.org/wiki/Turkish_alphabet" target="_blank" rel="noreferrer">알파벳 자료 ↗</a></p>
    </section>
    <WordDictionary key={letter[3]} word={letter[3]} meaning={letter[4]}/>
  </>
}
