import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { Button } from './ui'

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { pathname } = useLocation()
  const goToAbout = () => { if (pathname !== '/') window.location.hash = '/#about'; else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }
  return <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-cream/95">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <Link to="/" className="logo-lockup group" aria-label="HAM GROUND home">
        <span className="logo-icon">★</span>
        <span className="text-lg sm:text-2xl">HAM GROUND</span><span className="hidden -rotate-6 text-lg sm:inline" aria-hidden>🎮</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm font-bold sm:gap-3" aria-label="Main navigation">
        <Link to="/" className="nav-link">{t('home')}</Link>
        <Button tone="white" className="nav-link hidden sm:inline-flex" onClick={goToAbout}>{t('about')}</Button>
        <div className="language-switch" aria-label="Language">
          {(['ko', 'en'] as const).map((item) => <button key={item} onClick={() => setLanguage(item)} aria-pressed={language === item} className={language === item ? 'active' : ''}>{item.toUpperCase()}</button>)}
        </div>
      </nav>
    </div>
  </header>
}
