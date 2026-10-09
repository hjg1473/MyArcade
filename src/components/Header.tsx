import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { pathname } = useLocation()
  const goToAbout = () => { if (pathname !== '/') window.location.hash = '/#about'; else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }
  return <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <Link to="/" className="group flex items-center gap-2 font-black tracking-tight text-ink" aria-label="My Arcade home">
        <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-lemon text-xl shadow-[2px_3px_0_#26314a] transition-transform group-hover:-rotate-3">★</span>
        <span className="text-lg sm:text-xl">My Arcade</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm font-bold sm:gap-3" aria-label="Main navigation">
        <Link to="/" className="nav-link">{t('home')}</Link>
        <button className="nav-link hidden sm:block" onClick={goToAbout}>{t('about')}</button>
        <div className="ml-1 flex rounded-full border border-ink/15 bg-white p-1" aria-label="Language">
          {(['ko', 'en'] as const).map((item) => <button key={item} onClick={() => setLanguage(item)} aria-pressed={language === item} className={`rounded-full px-2.5 py-1 text-xs transition ${language === item ? 'bg-ink text-white' : 'text-ink/55 hover:text-ink'}`}>{item.toUpperCase()}</button>)}
        </div>
      </nav>
    </div>
  </header>
}
