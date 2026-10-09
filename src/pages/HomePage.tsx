import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GameCard } from '../components/GameCard'
import { useLanguage } from '../context/LanguageContext'
import { games } from '../data/games'
import type { GameCategory } from '../types'

type Filter = 'all' | GameCategory
export function HomePage() {
  const { t } = useLanguage(); const [filter, setFilter] = useState<Filter>('all'); const { hash } = useLocation()
  const filtered = useMemo(() => filter === 'all' ? games : games.filter((game) => game.category === filter), [filter])
  useEffect(() => { if (hash === '#about') setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 0) }, [hash])
  return <>
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-white px-6 py-10 shadow-card sm:px-10 sm:py-12">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-lemon/55" /><div className="absolute bottom-0 right-24 h-14 w-14 rounded-t-full bg-sky/25" />
        <div className="relative max-w-2xl"><span className="mb-4 inline-flex rounded-full bg-mint/20 px-3 py-1 text-xs font-extrabold tracking-wide text-[#24745d]">PRESS START</span><h1 className="text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl">{t('welcome')}</h1><p className="mt-4 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">{t('subtitle')}</p><a href="#games" className="mt-7 inline-flex rounded-xl border-2 border-ink bg-coral px-5 py-3 text-sm font-black text-white shadow-[3px_4px_0_#26314a] transition hover:-translate-y-0.5 hover:shadow-[4px_6px_0_#26314a]">{t('browse')} ↓</a></div>
      </div>
    </section>
    <section id="games" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[.16em] text-coral">Select a game</p><h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{t('browse')}</h2></div><div className="flex w-fit gap-1 rounded-xl border border-ink/10 bg-white p-1.5" role="group" aria-label="Game category filter">{(['all', 'game', 'simulation'] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`rounded-lg px-3.5 py-2 text-sm font-extrabold transition ${filter === item ? 'bg-ink text-white' : 'text-ink/55 hover:bg-ink/5 hover:text-ink'}`}>{item === 'all' ? t('all') : item === 'game' ? t('games') : t('simulations')}</button>)}</div></div>
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((game) => <GameCard key={game.id} game={game} />)}</div>
    </section>
    <section id="about" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="rounded-[1.75rem] border border-ink/10 bg-[#eef8ff] p-7 sm:flex sm:items-center sm:justify-between sm:gap-12 sm:p-10"><div><p className="text-sm font-black uppercase tracking-[.16em] text-sky">About</p><h2 className="mt-2 text-2xl font-black text-ink">{t('aboutTitle')}</h2><p className="mt-3 max-w-2xl leading-7 text-ink/65">{t('aboutText')}</p></div><div className="mt-7 flex shrink-0 gap-2 text-3xl sm:mt-0" aria-hidden><span className="rotate-[-8deg] rounded-2xl bg-white p-3 shadow-sm">🕹️</span><span className="rotate-[7deg] rounded-2xl bg-white p-3 shadow-sm">✨</span></div></div></section>
  </>
}
