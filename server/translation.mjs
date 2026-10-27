import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

export function loadTranslationEnv() {
  try { loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
}

function send(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(payload))
}

function googleFailure(status, payload, speech = false) {
  const details = Array.isArray(payload?.error?.details) ? payload.error.details : []
  const errors = Array.isArray(payload?.error?.errors) ? payload.error.errors : []
  const reasons = [...details.map(d => d.reason), ...errors.map(e => e.reason)]
  const known = {
    API_KEY_HTTP_REFERRER_BLOCKED: '이 키는 웹사이트 제한 때문에 거부됐어요. 번역은 서버에서 호출하므로 키의 애플리케이션 제한을 서버 공인 IP 주소 기준으로 설정해 주세요.',
    API_KEY_IP_ADDRESS_BLOCKED: '서버의 공인 IP 주소가 이 키의 허용 목록에 없어요. Google Cloud의 키 IP 주소 제한을 확인해 주세요.',
    API_KEY_SERVICE_BLOCKED: '이 키에 Cloud Translation API 사용이 허용되지 않았어요. 키의 API 제한에서 Cloud Translation API를 허용해 주세요.',
    API_KEY_INVALID: 'API 키가 유효하지 않아요. .env의 키를 확인한 뒤 서버를 재시작해 주세요.',
    API_KEY_EXPIRED: 'API 키가 만료됐어요. Google Cloud에서 유효한 키를 발급받아 설정해 주세요.',
    SERVICE_DISABLED: '키가 속한 Google Cloud 프로젝트에서 Cloud Translation API를 활성화해 주세요.',
    BILLING_DISABLED: '키가 속한 Google Cloud 프로젝트에 활성 결제 계정을 연결해 주세요.',
    accessNotConfigured: '키가 속한 Google Cloud 프로젝트에서 Cloud Translation API 사용 설정을 확인해 주세요.',
    billingNotActive: '키가 속한 Google Cloud 프로젝트에 활성 결제 계정을 연결해 주세요.',
    dailyLimitExceeded: 'Google 번역의 일일 사용 한도에 도달했어요. 프로젝트 할당량을 확인해 주세요.',
    userRateLimitExceeded: 'Google 번역 요청 한도를 초과했어요. 잠시 후 다시 시도해 주세요.',
    rateLimitExceeded: 'Google 번역 요청 한도를 초과했어요. 잠시 후 다시 시도해 주세요.',
  }
  const reason = reasons.find(r => Object.hasOwn(known, r))
  if (reason) return {error: (speech ? known[reason].replaceAll('Cloud Translation API','Cloud Text-to-Speech API').replaceAll('번역','음성') : known[reason]) + ' (' + reason + ')'}
  return {error: status === 429 ? '번역 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요.' : [400,401,403].includes(status) ? 'Google이 번역 요청을 거부했어요. 키가 속한 프로젝트의 Cloud Translation API 활성화, 결제 연결, 키 제한을 확인해 주세요. (HTTP ' + status + ')' : '번역 서비스가 응답하지 않아요. 잠시 후 다시 시도해 주세요.'}
}

export function createTranslationHandler({ fetchImpl = fetch, getKey = () => process.env.GOOGLE_TRANSLATION_API_KEY, service = 'translation' } = {}) {
  const speech = service === 'speech'
  return async function translate(req, res, next) {
    if (req.url?.split('?')[0] !== (speech ? '/api/speech' : '/api/translate')) { if (next) next(); else send(res, 404, {error:'찾을 수 없는 주소예요.'}); return }
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); send(res,405,{error:'POST 요청만 사용할 수 있어요.'}); return }
    const origin = req.headers.origin
    if (origin) { try { if (new URL(origin).host !== req.headers.host) { send(res,403,{error:'이 페이지에서 번역을 요청해 주세요.'}); return } } catch { send(res,403,{error:'요청 출처를 확인할 수 없어요.'}); return } }
    if (!req.headers['content-type']?.includes('application/json')) { send(res,415,{error:'JSON 형식으로 요청해 주세요.'}); return }
    let body
    try {
      // Vercel parses JSON before invoking the handler; local Node/Vite uses a stream.
      if (req.body !== undefined) {
        const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body)
        if (Buffer.byteLength(raw) > 16000) { send(res,413,{error:'입력 문장이 너무 길어요.'}); return }
        body = JSON.parse(raw)
      } else {
        const chunks=[]; let size=0
        for await (const chunk of req) { size+=Buffer.byteLength(chunk); if(size>16000){ send(res,413,{error:'입력 문장이 너무 길어요.'}); return }; chunks.push(chunk) }
        body=JSON.parse(Buffer.concat(chunks).toString('utf8'))
      }
    } catch { send(res,400,{error:'입력 문장을 확인해 주세요.'}); return }
    const text=typeof body?.text==='string'?body.text.trim():''
    if (speech && (text.length > 4000 || Buffer.byteLength(text, 'utf8') > 5000)) { send(res,400,{error:'음성으로 읽을 문장이 너무 길어요. 문장을 나눠서 번역해 주세요.'}); return }
    if(!text || (!speech && text.length>1000)){send(res,400,{error:text?'최대 1,000자까지 번역할 수 있어요.':'번역할 한국어 문장을 입력해 주세요.'});return}
    const key=getKey()?.trim()
    if(!key){send(res,503,{error:'Google API 키가 설정되지 않았어요. 서버의 .env 설정을 확인해 주세요.'});return}
    try {
      const response=await fetchImpl(speech ? 'https://texttospeech.googleapis.com/v1/text:synthesize' : 'https://translation.googleapis.com/language/translate/v2',{
        method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key},
        body:JSON.stringify(speech ? {input:{text},voice:{languageCode:'tr-TR',name:'tr-TR-Standard-A'},audioConfig:{audioEncoding:'MP3',speakingRate:0.9}} : {q:text,source:'ko',target:'tr',format:'text'}),signal:AbortSignal.timeout(15000),
      })
      if(!response.ok){
        const status=response.status
        let payload
        try { payload = await response.json() } catch { payload = null }
        send(res,status===429?429:502,googleFailure(status,payload,speech));return
      }
      const result=await response.json()
      if (speech) {
        const content=result?.audioContent
        if(typeof content!=='string'||!content||!/^[A-Za-z0-9+/]+={0,2}$/.test(content))throw new Error('Invalid audio response')
        const audio=Buffer.from(content,'base64')
        res.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':audio.length,'Cache-Control':'no-store'})
        res.end(audio);return
      }
      const translation=result?.data?.translations?.[0]?.translatedText
      if(typeof translation!=='string'||!translation.trim())throw new Error('Invalid translation response')
      send(res,200,{translation})
    }catch(error){const label=speech?'음성':'번역';send(res,502,{error:error.name==='TimeoutError'||error.name==='AbortError'?label+' 요청 시간이 초과됐어요. 다시 시도해 주세요.':label+' 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'})}
  }
}

export function createSpeechHandler(options = {}) {
 return createTranslationHandler({...options, service:'speech', getKey: options.getKey ?? (() => process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_TRANSLATION_API_KEY)})
}
