import { useEffect, useRef, useState } from 'react'

export default function TranslationSpeech({text, meaning}: {text: string; meaning?: string}) {
 const audio=useRef<HTMLAudioElement>(null)
 const request=useRef<AbortController|null>(null)
 const objectUrl=useRef('')
 const [speed,setSpeed]=useState(() => {
  try { const saved=Number(localStorage.getItem('merhaba-speech-speed')); if([0.75,1,1.2,1.5].includes(saved))return saved } catch { /* Storage is optional. */ }
  return 1.2
 })

 const [url,setUrl]=useState(''),[loading,setLoading]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState('')
 useEffect(()=>{
  if(audio.current){audio.current.preservesPitch=true;audio.current.playbackRate=speed}
 },[speed,url])
 useEffect(()=>()=>{const pending=request.current;request.current=null;pending?.abort();if(objectUrl.current)URL.revokeObjectURL(objectUrl.current)},[])
 useEffect(()=>{
  if(!url||!audio.current)return
  const player=audio.current
  void player.play().catch(()=>{setPlaying(false);setError('아래 재생 버튼을 눌러 음성을 들어주세요.')})
  return ()=>player.pause()
 },[url])
 const listen=async()=>{
  if(loading)return
  setError('')
  if(url&&audio.current){
   if(!audio.current.paused){audio.current.pause();return}
   try{await audio.current.play()}catch{setError('음성을 재생하지 못했어요. 아래 재생 버튼을 눌러주세요.')}
   return
  }
  const controller=new AbortController();request.current=controller
  const timer=setTimeout(()=>controller.abort(),20000)
  setLoading(true)
  try{
   if('speechSynthesis' in window)speechSynthesis.cancel()
   const response=await fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:controller.signal})
   if(!response.ok){const data=await response.json();throw new Error(data.error||'음성을 만들지 못했어요. 다시 시도해 주세요.')}
   if(!response.headers.get('content-type')?.includes('audio/'))throw new Error('음성 응답을 확인할 수 없어요.')
   const blob=await response.blob()
   if(controller.signal.aborted)return
   if(!blob.size)throw new Error('음성이 비어 있어요. 다시 시도해 주세요.')
   objectUrl.current=URL.createObjectURL(blob);setUrl(objectUrl.current)
  }catch(e){if(request.current!==controller)return;if(!controller.signal.aborted)setError(e instanceof Error&&e.name!=='TypeError'?e.message:'음성 서버에 연결하지 못했어요. 다시 시도해 주세요.');else setError('음성 요청 시간이 초과됐어요. 다시 시도해 주세요.')}
  finally{clearTimeout(timer);if(request.current===controller){request.current=null;setLoading(false)}}
 }
 return <div className={`cloud-speech ${meaning ? 'alphabet-speech' : ''}`}><div className="speech-toolbar"><button className={meaning ? 'word-audio' : 'listen-translation'} disabled={loading} aria-busy={loading} aria-label={meaning ? text+' 예시 단어 '+(playing?'일시정지':'듣기') : undefined} onClick={listen}>{meaning ? <><span><strong>{text}</strong><small>{meaning}</small></span><span aria-hidden="true">{loading?'…':playing?'Ⅱ':'▷'}</span></> : loading?'음성 준비 중…':playing?'Ⅱ 일시정지':'▷ 번역 듣기'}</button><label className="speech-speed">속도<select aria-label={meaning ? "예시 단어 재생 속도" : "번역 음성 재생 속도"} value={speed} onChange={e=>{const value=Number(e.target.value);setSpeed(value);try{localStorage.setItem('merhaba-speech-speed',String(value))}catch{/* Storage is optional. */}}}><option value={0.75}>0.75배</option><option value={1}>1배</option><option value={1.2}>1.2배</option><option value={1.5}>1.5배</option></select></label></div>{url&&<audio ref={audio} src={url} controls preload="auto" aria-label={meaning ? text+" 터키어 발음" : "번역된 터키어 음성"} onPlay={()=>{document.querySelectorAll('audio').forEach(other=>{if(other!==audio.current)other.pause()});setPlaying(true);setError('')}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError('음성을 재생할 수 없어요. 페이지를 새로고침해 다시 시도해 주세요.')}}/>}<p className="speech-status" role="status">{error}</p></div>
}
