import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createTranslationHandler, createSpeechHandler } from './translation.mjs'

async function request(options, {text='안녕하세요',raw,method='POST',origin,path='/api/translate'}={}) {
 const server=createServer(path==='/api/speech'?createSpeechHandler(options):createTranslationHandler(options));await new Promise(r=>server.listen(0,'127.0.0.1',r))
 try{
  const response=await fetch(`http://127.0.0.1:${server.address().port}${path}`,{method,headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},...(method==='POST'?{body:raw??JSON.stringify({text})}:{})})
  return {status:response.status,body:response.headers.get('content-type')?.includes('audio/')?Buffer.from(await response.arrayBuffer()):await response.json()}
 }finally{await new Promise(r=>server.close(r))}
}
test('sends Korean-to-Turkish plain text and keeps credentials on server',async()=>{
 let called=false
 const r=await request({getKey:()=> 'test-secret',fetchImpl:async(url,options)=>{
  called=true;assert.equal(url,'https://translation.googleapis.com/language/translate/v2');assert.equal(options.headers['X-Goog-Api-Key'],'test-secret');assert.deepEqual(JSON.parse(options.body),{q:'안녕하세요',source:'ko',target:'tr',format:'text'});return Response.json({data:{translations:[{translatedText:'Merhaba'}]}})
 }})
 assert.ok(called);assert.equal(r.status,200);assert.deepEqual(r.body,{translation:'Merhaba'});assert.ok(!JSON.stringify(r).includes('test-secret'))
})
test('rejects blank, oversized and malformed inputs before contacting Google',async()=>{
 const options={getKey:()=> 'key',fetchImpl:()=>{throw Error('must not call')}}
 for(const data of [{text:'  '},{text:'a'.repeat(1001)},{raw:'{bad json'}])assert.equal((await request(options,data)).status,400)
 assert.equal((await request(options,{text:'a'.repeat(17000)})).status,413)
})
test('missing key returns actionable response',async()=>{const r=await request({getKey:()=>undefined});assert.equal(r.status,503);assert.match(r.body.error,/API 키/)})
test('rejects non-POST and cross-origin requests',async()=>{assert.equal((await request({}, {method:'GET'})).status,405);assert.equal((await request({}, {origin:'https://other.example'})).status,403)})
test('sanitizes Google errors, handles quota and network failures',async()=>{
 for(const [upstream,status] of [[403,502],[429,429],[500,502]]){
  const r=await request({getKey:()=> 'test-secret',fetchImpl:async()=>Response.json({error:{message:'sensitive upstream test-secret'}},{status:upstream})});assert.equal(r.status,status);assert.ok(!JSON.stringify(r).includes('test-secret'))
 }
 const r=await request({getKey:()=> 'key',fetchImpl:async()=>{throw Error('network')}});assert.equal(r.status,502);assert.match(r.body.error,/연결/)
})
test('handles timeout and malformed upstream result',async()=>{
 const timeout=await request({getKey:()=> 'key',fetchImpl:async()=>{throw new DOMException('timeout','TimeoutError')}});assert.match(timeout.body.error,/초과/)
 const malformed=await request({getKey:()=> 'key',fetchImpl:async()=>Response.json({})});assert.equal(malformed.status,502)
})

test('distinguishes restriction, API activation, and billing errors without exposing metadata', async()=>{
 for(const reason of ['API_KEY_HTTP_REFERRER_BLOCKED','API_KEY_IP_ADDRESS_BLOCKED','API_KEY_SERVICE_BLOCKED','API_KEY_INVALID','SERVICE_DISABLED','BILLING_DISABLED']){
  const r=await request({getKey:()=> 'test-secret',fetchImpl:async()=>Response.json({error:{message:'test-secret',details:[{reason,metadata:{key:'test-secret',project:'private-project'}}]}},{status:403})})
  assert.equal(r.status,502);assert.ok(r.body.error.includes(reason));assert.ok(!JSON.stringify(r).includes('test-secret'));assert.ok(!JSON.stringify(r).includes('private-project'))
 }
})

test('Turkish Cloud TTS returns MP3 bytes with server-side credentials',async()=>{
 const bytes=Buffer.from('ID3-test-audio')
 const r=await request({getKey:()=> 'speech-secret',fetchImpl:async(url,options)=>{
  assert.equal(url,'https://texttospeech.googleapis.com/v1/text:synthesize')
  assert.equal(options.headers['X-Goog-Api-Key'],'speech-secret')
  assert.deepEqual(JSON.parse(options.body),{input:{text:'Merhaba'},voice:{languageCode:'tr-TR',name:'tr-TR-Standard-A'},audioConfig:{audioEncoding:'MP3',speakingRate:0.9}})
  return Response.json({audioContent:bytes.toString('base64')})
 }},{path:'/api/speech',text:'Merhaba'})
 assert.equal(r.status,200);assert.deepEqual(r.body,bytes)
})
test('TTS rejects oversized UTF-8 and invalid audio',async()=>{
 const noCall={getKey:()=> 'key',fetchImpl:()=>{throw Error('must not call')}}
 assert.equal((await request(noCall,{path:'/api/speech',text:'한'.repeat(1700)})).status,400)
 const r=await request({getKey:()=> 'key',fetchImpl:async()=>Response.json({audioContent:''})},{path:'/api/speech'})
 assert.equal(r.status,502)
})
test('TTS explains its own API restrictions and hides upstream details',async()=>{
 const r=await request({getKey:()=> 'speech-secret',fetchImpl:async()=>Response.json({error:{message:'speech-secret',details:[{reason:'API_KEY_SERVICE_BLOCKED'}]}},{status:403})},{path:'/api/speech'})
 assert.equal(r.status,502);assert.match(r.body.error,/Cloud Text-to-Speech API/);assert.ok(!r.body.error.includes('speech-secret'))
})

test('accepts Vercel pre-parsed bodies without reading the consumed request stream',async()=>{
 for(const body of [{text:'안녕하세요'},JSON.stringify({text:'안녕하세요'})]){
  let status,result
  const handler=createTranslationHandler({getKey:()=> 'key',fetchImpl:async(_url,options)=>{assert.equal(JSON.parse(options.body).q,'안녕하세요');return Response.json({data:{translations:[{translatedText:'Merhaba'}]}})}})
  await handler({url:'/api/translate',method:'POST',headers:{'content-type':'application/json'},body},{writeHead:code=>{status=code},end:value=>{result=JSON.parse(value)}})
  assert.equal(status,200);assert.equal(result.translation,'Merhaba')
 }
})
