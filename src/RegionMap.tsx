import { useEffect, useRef, useState } from 'react'
import { provinceByCode, regionColors, regionNotes } from './provinces'

type Ring = number[][]
type ProvinceShape = { code: string; polygons: Ring[][] }
type RegionShape = { name: string; polygons: Ring[][] }
type Feature = { properties: { il_kodu?: string; plaka?: number }; geometry: { type: string; coordinates: Ring[] | Ring[][] } }
export const cities = [
 { name: '앙카라', region: '중부아나톨리아', point: [32.86,39.93], description: '앙카라는 아나톨리아 내륙에 자리한 튀르키예의 수도예요.' },
 { name: '이스탄불', region: '마르마라', point: [28.98,41.01], description: '이스탄불은 보스포루스 해협 양쪽에 걸친 도시로, 마르마라 지방에 속해요.' },
 { name: '안탈리야', region: '지중해', point: [30.71,36.90], description: '안탈리야는 토로스산맥과 지중해 사이에 자리한 해안 도시예요.' },
]
const geometrySource = 'https://raw.githubusercontent.com/theaiagent/turkiye_iller_geojson/main/turkiye_iller.geojson'
const project = ([lon, lat]: number[]) => [(lon-35.5)*22,(lat-39)*28]
export function parseBoundaries(data: {features: Feature[]}): ProvinceShape[] {
 if (!Array.isArray(data.features)) throw new Error('지도 데이터 형식 오류')
 const shapes = data.features.map(f => {
  const code = String(f.properties.il_kodu ?? f.properties.plaka).padStart(2,'0')
  if (!provinceByCode[code] || !['Polygon','MultiPolygon'].includes(f.geometry.type)) throw new Error('주 경계 오류')
  const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as Ring[]] : f.geometry.coordinates as Ring[][]
  if (!polygons.length || polygons.some(p => !p.length || p.some(r => r.length<4 || r.some(c => c.length<2 || !c.every(Number.isFinite))))) throw new Error('경계 좌표 오류')
  return {code,polygons}
 })
 if (shapes.length!==81 || new Set(shapes.map(s=>s.code)).size!==81) throw new Error('주 경계 누락')
 return shapes
}
export function groupRegions(shapes: ProvinceShape[]): RegionShape[] {
 // Each province belongs to one region. A shared material and elevation remove
 // province divisions visually, while retaining islands and interior holes.
 return Object.keys(regionColors).map(name=>({name,polygons:shapes.filter(s=>provinceByCode[s.code].region===name).flatMap(s=>s.polygons)}))
}
function MapScene({regions,selected,selectedCity,onRegion,onCity}: {regions: RegionShape[];selected:string|null;selectedCity:string|null;onRegion:(name:string)=>void;onCity:(name:string)=>void}) {
 const host=useRef<HTMLDivElement>(null)
 const live=useRef({selected,selectedCity,onRegion,onCity})
 const [mode,setMode]=useState<'loading'|'3d'|'2d'>('loading')
 const [flat,setFlat]=useState(false)
 const [hover,setHover]=useState<string|null>(null)
 useEffect(()=>{live.current={selected,selectedCity,onRegion,onCity}},[selected,selectedCity,onRegion,onCity])
 useEffect(()=>{
  if(flat)return
  let stopped=false;let cleanup=()=>{}
  const timeout=window.setTimeout(()=>{if(!stopped)setMode('2d')},8000)
  async function mount(){
   try{
    const url='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
    const T=await import(/* @vite-ignore */ url)
    if(stopped||!host.current)return
    const el=host.current
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true})
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0)
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,1,2500)
    scene.add(new T.HemisphereLight(0xffffff,0x66745b,2.7))
    const light=new T.DirectionalLight(0xfff7e8,3);light.position.set(-180,400,200);scene.add(light)
    const group=new T.Group();scene.add(group)
    let mobile=el.clientWidth<=760
    const entries=regions.map(region=>{
     const object=new T.Group()
     const base=new T.Color(regionColors[region.name]);const active=base.clone().lerp(new T.Color('#dbad77'),.2)
     const material=new T.MeshStandardMaterial({color:base,roughness:.85})
     for(const rings of region.polygons){
      const shape=new T.Shape()
      rings[0].forEach((p,i)=>{const [x,y]=project(p);if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y)});shape.closePath()
      for(const ring of rings.slice(1)){const hole=new T.Path();ring.forEach((p,i)=>{const [x,y]=project(p);if(i===0)hole.moveTo(x,y);else hole.lineTo(x,y)});hole.closePath();shape.holes.push(hole)}
      const geometry=new T.ExtrudeGeometry(shape,{depth:7,bevelEnabled:false,steps:1});geometry.rotateX(-Math.PI/2)
      const mesh=new T.Mesh(geometry,material);mesh.userData.region=region.name;object.add(mesh)
     }
     const bounds=new T.Box3().setFromObject(object),center=bounds.getCenter(new T.Vector3())
     const outward=new T.Vector2(center.x,center.z);if(outward.length()>0)outward.normalize()
     group.add(object);return {object,base,active,material,name:region.name,outward}
    })
    const markers=cities.map(city=>{
     const button=document.createElement('button');button.className='city-marker region-city-marker';button.dataset.city=city.name
     const label=document.createElement('span');label.textContent=city.name;button.append(label)
     button.setAttribute('aria-label',`${city.name} · ${city.region} 알아보기`);button.onclick=()=>live.current.onCity(city.name)
     el.append(button);return {button,...city}
    })
    el.prepend(renderer.domElement)
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;mobile=w<=760;renderer.setSize(w,h);camera.aspect=w/h;const distance=Math.max(470,480/Math.max(camera.aspect,.5));camera.position.set(0,distance*(mobile?1.55:.78),distance);group.rotation.set(0,0,0);camera.lookAt(0,0,0);camera.updateProjectionMatrix()}
    const observer=new ResizeObserver(resize);observer.observe(el);resize()
    const ray=new T.Raycaster(),pointer=new T.Vector2()
    let down=false,dragged=false,lastX=0,lastY=0,travel=0
    const hit=(e:PointerEvent|MouseEvent)=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(group.children,true).find((h:{object:{userData:{region?:string}}})=>h.object.userData.region)?.object.userData.region as string|undefined}
    const onDown=(e:PointerEvent)=>{down=true;dragged=false;travel=0;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)}
    const onMove=(e:PointerEvent)=>{if(down){const dx=e.clientX-lastX,dy=e.clientY-lastY;travel+=Math.abs(dx)+Math.abs(dy);dragged=travel>6;if(dragged){const maxYaw=mobile?.2:.45;group.rotation.y=Math.max(-maxYaw,Math.min(maxYaw,group.rotation.y+dx*.003));group.rotation.x=Math.max(mobile?-.06:-.15,Math.min(mobile?.1:.25,group.rotation.x+dy*.002))}lastX=e.clientX;lastY=e.clientY;return}if(e.pointerType==='touch')return;const name=hit(e)||null;setHover(name);renderer.domElement.style.cursor=name?'pointer':'grab'}
    const onUp=()=>{down=false};const onClick=(e:MouseEvent)=>{if(dragged)return;const name=hit(e);if(name)live.current.onRegion(name)};const onLeave=()=>setHover(null)
    renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerup',onUp);renderer.domElement.addEventListener('pointercancel',onUp);renderer.domElement.addEventListener('pointerleave',onLeave);renderer.domElement.addEventListener('click',onClick)
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,clock=new T.Clock();let frame=0
    cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();scene.traverse((o:InstanceType<typeof T.Object3D>)=>o.geometry?.dispose());entries.forEach(e=>e.material.dispose());renderer.dispose();renderer.domElement.remove();markers.forEach(m=>m.button.remove())}
    const tick=()=>{
     if(stopped)return
     const dt=Math.min(clock.getDelta(),.05)
     for(const e of entries){
      const active=live.current.selected===e.name,target=active?(mobile?20:27):0
      const offset=active?(mobile?14:7):0
      e.object.position.y=reduced?target:T.MathUtils.damp(e.object.position.y,target,7,dt)
      e.object.position.x=reduced?e.outward.x*offset:T.MathUtils.damp(e.object.position.x,e.outward.x*offset,7,dt)
      e.object.position.z=reduced?e.outward.y*offset:T.MathUtils.damp(e.object.position.z,e.outward.y*offset,7,dt)
      const faded=mobile&&!!live.current.selected&&!active
      e.material.transparent=true
      e.material.depthWrite=!faded
      e.material.opacity=reduced?(faded?.48:1):T.MathUtils.damp(e.material.opacity,faded?.48:1,8,dt)
      e.material.color.lerp(active?e.active:e.base,reduced?1:1-Math.exp(-7*dt))
     }
     group.updateMatrixWorld(true)
     for(const m of markers){const entry=entries.find(e=>e.name===m.region)!;const [x,y]=project(m.point);const v=new T.Vector3(x,12,-y).applyMatrix4(entry.object.matrixWorld).project(camera);m.button.style.left=`${(v.x*.5+.5)*el.clientWidth}px`;m.button.style.top=`${(-v.y*.5+.5)*el.clientHeight}px`;m.button.setAttribute('aria-pressed',String(live.current.selectedCity===m.name))}
     renderer.render(scene,camera);frame=requestAnimationFrame(tick)
    }
    clearTimeout(timeout);setMode('3d');tick()
   }catch{cleanup();if(!stopped)setMode('2d')}
  }
  void mount();return()=>{stopped=true;clearTimeout(timeout);cleanup()}
 },[regions,flat])
 const showFlat=flat||mode!=='3d'
 // SVG painter order must put the lifted region above all other regions.
 const orderedRegions=[...regions].sort((a,b)=>Number(a.name===selected)-Number(b.name===selected))
 return <><div className="province-map-toolbar"><span>TÜRKİYE <span> / 지방 지도</span></span><button onClick={()=>{setFlat(!flat);setHover(null);if(flat)setMode('loading')}}>{flat?'3D로 보기':'평면으로 보기'}</button></div><div className="province-stage"><div ref={host} className={`province-canvas ${!showFlat?'visible':''}`} aria-label="튀르키예 지방 입체 지도"/>{showFlat&&<svg className="province-svg" viewBox="-235 -125 460 255" aria-label="튀르키예 지방 지도">{orderedRegions.map(r=>{const raised=selected===r.name;const d=r.polygons.map(rings=>rings.map(ring=>ring.map((c,i)=>{const [x,y]=project(c);return `${i?'L':'M'}${x.toFixed(3)},${(-y).toFixed(3)}`}).join(' ')+'Z').join(' ')).join(' ');return <g key={r.name} opacity={selected&& !raised ? .55 : 1} className={`province-piece region-piece ${raised?'raised':''}`} role="button" tabIndex={0} aria-label={`${r.name} 알아보기`} aria-pressed={raised} onClick={()=>onRegion(r.name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onRegion(r.name)}}} onMouseEnter={()=>setHover(r.name)} onMouseLeave={()=>setHover(null)}><title>{r.name}</title><path d={d} transform="translate(0 5)" fill="#889675"/><path d={d} fill={regionColors[r.name]} fillRule="nonzero"/></g>})}{cities.map(c=>{const [x,y]=project(c.point);const up=selected===c.region;return <g key={c.name} className="region-svg-city" transform={`translate(${x} ${-y-(up?15:0)})`} role="button" tabIndex={0} aria-label={`${c.name} · ${c.region} 알아보기`} aria-pressed={selectedCity===c.name} onClick={()=>onCity(c.name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onCity(c.name)}}}><circle r="10" fill="transparent"/><circle r="4.3" fill="#fffaf0"/><circle r="2.1" fill="#b85a40"/><text y={c.name==='안탈리야'?15:-11} textAnchor="middle">{c.name}</text></g>})}</svg>}{hover&&<div className="province-tooltip">{hover}</div>}</div><p className="province-mode-note">{showFlat?'도시의 점이나 이름을 눌러보세요':'드래그로 기울이기 · 도시의 점이나 이름을 눌러보세요'}<span>{flat?'평면 지도':mode==='loading'?'3D 불러오는 중…':mode==='2d'?'3D 로드 불가 · 평면 지도':'실시간 3D'}</span></p></>
}
export default function RegionMap(){
 const [regions,setRegions]=useState<RegionShape[]>([]),[error,setError]=useState(''),[attempt,setAttempt]=useState(0)
 const [selected,setSelected]=useState<string|null>(null),[selectedCity,setSelectedCity]=useState<string|null>(null)
 useEffect(()=>{
  let live=true;const controller=new AbortController();let timer:ReturnType<typeof setTimeout>
  async function load(){
   setError('')
   try{
    let data
    try{const cached=localStorage.getItem('merhaba-provinces-v1');if(cached)data=JSON.parse(cached)}catch{/* Optional cache. */}
    if(data){try{const r=groupRegions(parseBoundaries(data));if(live)setRegions(r);return}catch{/* Reload invalid cache. */}}
    timer=setTimeout(()=>controller.abort(),20000)
    let response:Response
    try{response=await fetch(geometrySource,{signal:controller.signal});if(!response.ok)throw new Error('source')}catch{if(controller.signal.aborted)throw new Error('timeout');response=await fetch('https://cdn.jsdelivr.net/gh/theaiagent/turkiye_iller_geojson@main/turkiye_iller.geojson',{signal:controller.signal})}
    if(!response.ok)throw new Error('source')
    data=await response.json();const r=groupRegions(parseBoundaries(data))
    if(live){setRegions(r);try{localStorage.setItem('merhaba-provinces-v1',JSON.stringify(data))}catch{/* Optional cache. */}}
   }catch{if(live)setError('지도 데이터를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.')}
   finally{clearTimeout(timer)}
  }
  void load();return()=>{live=false;controller.abort();clearTimeout(timer)}
 },[attempt])
 const chooseCity=(name:string)=>{const c=cities.find(c=>c.name===name)!;setSelectedCity(c.name);setSelected(c.region)}
 const chooseRegion=(name:string)=>{setSelected(name);setSelectedCity(null)}
 const city=cities.find(c=>c.name===selectedCity)
 return <div className="province-explorer regional-explorer">{regions.length?<MapScene regions={regions} selected={selected} selectedCity={selectedCity} onRegion={chooseRegion} onCity={chooseCity}/>:<div className="map-loading" role="status">{error?<><p>{error}</p><button className="primary" onClick={()=>setAttempt(attempt+1)}>다시 불러오기</button></>:<><span className="loading-orbit"/><p>튀르키예 지방 지도를 불러오고 있어요.</p></>}</div>}<div className="regional-legend" aria-label="지방 선택">{Object.keys(regionColors).map(name=><button key={name} className={selected===name?'active':''} aria-pressed={selected===name} onClick={()=>chooseRegion(name)}><i style={{background:regionColors[name]}}/>{name}</button>)}</div><section className="regional-info" aria-live="polite">{selected?<><div className="regional-title"><span className="region-swatch" style={{background:regionColors[selected]}}/><div><span className="eyebrow">{city?`${city.name}가 속한 지방`:'TÜRKİYE / REGION'}</span><h2>{selected}<span>지방</span></h2></div><button className="province-close" onClick={()=>{setSelected(null);setSelectedCity(null)}} aria-label="선택 해제">×</button></div>{city&&<p className="city-context">{city.description}</p>}<p>{regionNotes[selected]}</p></>:<><span className="eyebrow">THREE CITIES, SEVEN REGIONS</span><h2>어느 도시에서 시작할까요?</h2><p>앙카라·이스탄불·안탈리야를 누르면 도시가 속한 지방 전체가 떠올라요.<br/>아래에서 도시를 고르거나, 지도 아래 지방 이름을 눌러 살펴보세요.</p></>}<div className="regional-city-shortcuts" aria-label="도시 선택">{cities.map(c=><button key={c.name} className={selectedCity===c.name?'active':''} aria-pressed={selectedCity===c.name} onClick={()=>chooseCity(c.name)}><i/>{c.name}<span>{c.region} ↗</span></button>)}</div></section><p className="province-data-note">지방 경계는 제공해 주신 주별 분류를 묶은 학습용 구분입니다. 공식 측량 자료가 아닙니다.<br/>경계: <a href="https://github.com/theaiagent/turkiye_iller_geojson" target="_blank" rel="noreferrer">theaiagent / cihadturhan</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap 기여자</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer">ODbL</a></p></div>
}
