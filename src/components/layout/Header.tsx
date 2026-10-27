import Flag from '../common/Flag'
import type { AppTab } from '../../types/navigation'

export default function Header({ tab, onNavigate }: { tab: AppTab; onNavigate: (tab: AppTab) => void }) {
  return <header>
    <a href="#" className="brand">merhaba<span className="brand-dot">.</span></a>
    <nav className="main-tabs" aria-label="페이지 메뉴">
      <button className={tab === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}>홈</button>
      <button className={tab === 'language' ? 'active' : ''} onClick={() => onNavigate('language')}>언어 <span>Türkçe</span></button>
    </nav>
    <Flag/>
  </header>
}
