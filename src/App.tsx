import { useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import LanguagePage from './pages/LanguagePage'
import { alphabet } from './data/alphabet'
import { useTranslation } from './hooks/useTranslation'
import type { AppTab, LanguagePageId } from './types/navigation'
import './styles/app.css'
import './styles/language.css'

export default function App() {
  const [tab, setTab] = useState<AppTab>('home')
  const [languagePage, setLanguagePage] = useState<LanguagePageId>('alphabet')
  const [letter, setLetter] = useState(alphabet.find(letter => letter[0] === 'K')!)
  // Preserve input and letter selection when switching pages, as before.
  const translation = useTranslation()

  return <>
    <Header tab={tab} onNavigate={setTab}/>
    <main>
      {tab === 'home' ? <HomePage/> : <LanguagePage
        page={languagePage} onNavigate={setLanguagePage}
        letter={letter} onSelectLetter={setLetter} translation={translation}
      />}
    </main>
    <Footer/>
  </>
}
