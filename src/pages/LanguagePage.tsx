import { lazy, Suspense } from 'react'
import LanguageSidebar from '../components/layout/LanguageSidebar'
import { languagePageTitles } from '../data/navigation'
import GrammarErrorBoundary from '../components/grammar/GrammarErrorBoundary'
import AlphabetPage from './language/AlphabetPage'
import TranslatePage from './language/TranslatePage'
import type { AlphabetLetter } from '../data/alphabet'
import type { TranslationModel } from '../hooks/useTranslation'
import type { LanguagePageId } from '../types/navigation'

const GrammarPage = lazy(() => import('./language/GrammarPage'))

interface LanguagePageProps {
  page: LanguagePageId
  onNavigate: (page: LanguagePageId) => void
  letter: AlphabetLetter
  onSelectLetter: (letter: AlphabetLetter) => void
  translation: TranslationModel
}

export default function LanguagePage({ page, onNavigate, letter, onSelectLetter, translation }: LanguagePageProps) {
  return <div className="language-shell">
    <LanguageSidebar page={page} onNavigate={onNavigate}/>
    <div className="language-content">
      <div className="language-breadcrumb">언어 <span>/</span> {languagePageTitles[page]}</div>
      {page === 'alphabet' ? <AlphabetPage letter={letter} onSelect={onSelectLetter}/>
        : page === 'grammar' ? <GrammarErrorBoundary><Suspense fallback={<section className="grammar-empty" role="status">문법을 불러오는 중…</section>}><GrammarPage/></Suspense></GrammarErrorBoundary>
        : <TranslatePage model={translation}/>}
    </div>
  </div>
}
