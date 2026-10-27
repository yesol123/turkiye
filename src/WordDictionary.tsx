import { useEffect, useState } from 'react'
import { parseDictionary, wordNotes, type WordDetails } from './dictionary'
import TranslationSpeech from './TranslationSpeech'
import { turkishToHangul } from './utils/turkishPronunciation'
const cache=new Map<string,WordDetails|null>()
export default function WordDictionary({word,meaning}: {word:string;meaning:string}) {
 const [entry,setEntry]=useState<WordDetails|null>(cache.get(word)||null)
 const [status,setStatus]=useState<'loading'|'ready'|'missing'|'error'>(cache.has(word)?cache.get(word)?'ready':'missing':'loading')
 const [retry,setRetry]=useState(0)
 useEffect(()=>{
  let active=true;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000)
  async function load(){
   if(cache.has(word)){setEntry(cache.get(word)||null);setStatus(cache.get(word)?'ready':'missing');clearTimeout(timer);return}
   setStatus('loading')
   try{
    const response=await fetch(`https://freedictionaryapi.com/api/v1/entries/tr/${encodeURIComponent(word)}?translations=true`,{signal:controller.signal})
    if(response.status===404){cache.set(word,null);if(active){setEntry(null);setStatus('missing')};return}
    if(!response.ok)throw new Error('Dictionary unavailable')
    const details=parseDictionary(await response.json());cache.set(word,details)
    if(active){setEntry(details);setStatus(details?'ready':'missing')}
   }catch{if(active)setStatus('error')}
   finally{clearTimeout(timer)}
  }
  void load();return()=>{active=false;controller.abort();clearTimeout(timer)}
 },[word,retry])
 const note=wordNotes[word]
 const example=note?.example||entry?.example
 const plural=entry?.plural||note?.plural
 const accusative=entry?.accusative||note?.accusative
 return <section className="word-dictionary" aria-label={`${word} 단어 설명`}><div className="dictionary-heading"><div><span className="eyebrow">WORD EXPLORER</span><h2>{word}</h2><p className="dictionary-pos">{entry?.pos||note?.pos||(status==='loading'?'품사 정보 확인 중':'품사 미제공')}</p></div><span className="dictionary-letter" aria-hidden="true">Aa</span></div><p className="dictionary-meaning">{meaning}</p>{entry?.definition&&entry.definition!==meaning&&<p className="dictionary-definition">사전 풀이 <span>{entry.definition}</span></p>}<div className="dictionary-sections"><div><h3>예문 <span>Örnek</span></h3>{example?<><p className="dictionary-example" lang="tr">{example}</p><div className="dictionary-example-pronunciation"><span>한글로 읽기</span><p lang="ko">{turkishToHangul(example)}</p><small>발음 참고용 표기예요.</small></div>{note?.exampleKo?<p className="dictionary-example-ko">{note.exampleKo}</p>:<p className="dictionary-empty">한국어 예문 풀이 미제공</p>}</>:<p className="dictionary-empty">이 단어의 예문은 아직 제공되지 않았어요.</p>}</div><div><h3>문법 정보 <span>Dil bilgisi</span></h3><dl className="dictionary-grammar"><div><dt>복수형</dt><dd>{plural||'미제공'}</dd></div><div><dt>목적격 <small>단수</small></dt><dd>{accusative||'미제공'}</dd></div></dl></div></div><div className="dictionary-listen"><TranslationSpeech key={word} text={word} meaning={meaning}/></div><div className="dictionary-status" role="status">{status==='loading'?'사전 정보를 불러오는 중…':status==='error'?<>사전을 불러오지 못해 준비된 학습 정보를 표시하고 있어요. <button onClick={()=>setRetry(retry+1)}>다시 시도</button></>:status==='missing'?'이 단어의 추가 사전 정보가 아직 없어요.':'사전 정보 업데이트 완료'}</div>{note&&<p className="dictionary-supplement">예문·한국어 풀이 및 일부 활용형은 학습용 보충 자료입니다.</p>}<p className="dictionary-attribution"><a href="https://freedictionaryapi.com/" target="_blank" rel="noreferrer">FreeDictionaryAPI.com</a> · <a href={entry?.source||`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}#Turkish`} target="_blank" rel="noreferrer">Wiktionary</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p></section>
}
