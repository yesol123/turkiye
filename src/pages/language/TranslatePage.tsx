import PageIntro from '../../components/common/PageIntro'
import TranslationSpeech from '../../components/audio/TranslationSpeech'
import { turkishToHangul } from '../../utils/turkishPronunciation'
import type { TranslationModel } from '../../hooks/useTranslation'

export default function TranslatePage({ model }: { model: TranslationModel }) {
  const { input, message, translation, translating, translate, changeInput } = model
  const pronunciation = translation ? turkishToHangul(translation) : ''
  return <>
    <PageIntro eyebrow="WORDS THAT CONNECT" title="하고 싶은 말을, 터키어로." description="한국어로 적고, 번역하고, 터키어 음성으로 들어보세요."/>
    <section className="translator" aria-labelledby="translate-title">
      <div className="translate-heading"><h2 id="translate-title">어떤 말을 하고 싶으세요?</h2><span className="connection-state">한국어 → 터키어</span></div>
      <div className="translate-panels">
        <div className="input-panel">
          <label htmlFor="korean">한국어 <span>KO</span></label>
          <textarea id="korean" maxLength={1000} disabled={translating} placeholder="예: 공항까지 얼마나 걸리나요?" value={input} onChange={event => changeInput(event.target.value)}/>
          <div className="input-bottom"><button className="clear" disabled={!input || translating} onClick={() => changeInput('')}>지우기</button><span>{input.length} / 1,000</span></div>
        </div>
        <div className="output-panel">
          <h3>터키어 <span>TR</span></h3>
          <div className={translation ? 'translation-result' : 'result-placeholder'} role="status" aria-live="polite" aria-busy={translating}>
            {translating ? '터키어로 번역하고 있어요…' : translation || message || '번역된 문장이 여기에 표시돼요.'}
          </div>
          {translation && <section className="translation-pronunciation" aria-label="터키어의 한글 발음">
            <span className="pronunciation-label">한글로 읽기</span><p lang="ko">{pronunciation}</p><small>한글 표기는 발음 참고용이에요. 음성과 함께 익혀보세요.</small>
          </section>}
          <div className="translation-tools">{translation ? <TranslationSpeech key={translation} text={translation}/> : <span className="output-note">Türkiye’de bir merhaba ile başlar.</span>}</div>
        </div>
      </div>
      <div className="translate-bottom"><p>Google 번역으로 문장을 번역합니다.</p><button className="primary" disabled={!input.trim() || translating} onClick={translate}>{translating ? '번역 중…' : '터키어로 번역'} <span>→</span></button></div>
    </section>
  </>
}
