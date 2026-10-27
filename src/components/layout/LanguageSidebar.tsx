import type { LanguagePageId } from '../../types/navigation'
import { languageNavigation } from '../../data/navigation'

export default function LanguageSidebar({ page, onNavigate }: { page: LanguagePageId; onNavigate: (page: LanguagePageId) => void }) {
  return <aside className="language-sidebar">
    <div className="sidebar-title"><span className="eyebrow">TÜRKÇE</span><h2>언어 배우기</h2><p>한 글자에서, 한 문장으로.</p></div>
    <nav aria-label="언어 학습 메뉴">
      {languageNavigation.map(item => <button key={item.id} className={page === item.id ? 'current' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
        <span className="sidebar-icon">{item.icon}</span>
        <span>{item.title}<small>{item.description}</small></span>
        <span className="sidebar-arrow">→</span>
      </button>)}
    </nav>
    <div className="sidebar-footer"><span>조금씩, 매일.</span><p>오늘 배운 한 단어가<br/>내일의 여행을 바꿔요.</p></div>
  </aside>
}
