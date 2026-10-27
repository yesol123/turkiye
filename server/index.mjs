import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTranslationHandler, createSpeechHandler, loadTranslationEnv } from './translation.mjs'

loadTranslationEnv()
const root=fileURLToPath(new URL('../dist/',import.meta.url))
const translate=createTranslationHandler()
const speak=createSpeechHandler()
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.ico':'image/x-icon'}
const server=createServer(async(req,res)=>{
 if(req.url?.split('?')[0]==='/api/speech'){await speak(req,res);return}
 if(req.url?.startsWith('/api/')){await translate(req,res);return}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
  let file=resolve(root,'.'+pathname)
  if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep)){res.writeHead(403);res.end();return}
  if(pathname.endsWith('/'))file=resolve(root,'index.html')
  let data
  try{data=await readFile(file)}catch{if(extname(pathname)){res.writeHead(404);res.end();return};file=resolve(root,'index.html');data=await readFile(file)}
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'})
  res.end(req.method==='HEAD'?undefined:data)
 }catch{res.writeHead(500);res.end('페이지를 불러올 수 없습니다. npm run build를 먼저 실행해 주세요.')}
})
server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${process.env.PORT||3000}/`))
