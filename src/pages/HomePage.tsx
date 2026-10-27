import RegionMap from '../components/map/RegionMap'

export default function HomePage() {
  return <>
    <section className="intro">
      <span className="eyebrow">MERHABA, TÜRKİYE</span>
      <h1>처음 만나는 튀르키예.</h1>
      <p>세 도시를 따라, 튀르키예의 일곱 지방을 만나보세요.</p>
    </section>
    <section className="map-section" aria-label="튀르키예 지도"><RegionMap/></section>
    <div className="country-note"><span>수도 앙카라</span><span>언어 터키어</span><span>화폐 리라 · TRY</span></div>
  </>
}
