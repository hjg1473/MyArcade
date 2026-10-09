import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GameCard } from '../components/GameCard'
import { useLanguage } from '../context/LanguageContext'
import { games } from '../data/games'
import type { GameCategory } from '../types'
import { Badge, Section } from '../components/ui'

type Filter = 'all' | GameCategory
export function HomePage() {
  const { t } = useLanguage(); const [filter, setFilter] = useState<Filter>('all'); const { hash } = useLocation()
  const filtered = useMemo(() => filter === 'all' ? games : games.filter((game) => game.category === filter), [filter])
  useEffect(() => { if (hash === '#about') setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 0) }, [hash])
  return <>
    <Section className="pb-8 pt-9 sm:pt-12">
      <div className="hero-panel">
        <div className="deco-checks" aria-hidden /><div className="deco-star star-one" aria-hidden>★</div><div className="deco-star star-two" aria-hidden>✦</div>
        <div className="relative max-w-3xl"><Badge tone="mint" className="mb-5 -rotate-2">PRESS START</Badge><h1 className="hero-title">HEY! WELCOME TO <span>HAM GROUND!</span></h1><p className="mt-5 max-w-xl text-base font-bold leading-7 text-ink/75 sm:text-lg">{t('subtitle')}</p><a href="#games" className="brutal-button tone-pink mt-7">{t('browse')} ↓</a></div>
      </div>
    </Section>
    <Section id="games" className="scroll-mt-24 py-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="kicker">★ Select a game</p><h2 className="section-title">{t('browse')}</h2></div><div className="category-tabs" role="group" aria-label="Game category filter">{(['all', 'game', 'simulation'] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item === 'all' ? t('all') : item === 'game' ? t('games') : t('simulations')}</button>)}</div></div>
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((game) => <GameCard key={game.id} game={game} />)}</div>
    </Section>
    <Section id="about" className="scroll-mt-24 py-10"><div className="about-panel"><div><p className="kicker text-ink">ABOUT THIS PLACE</p><h2 className="section-title">{t('aboutTitle')}</h2><p className="mt-3 max-w-2xl font-semibold leading-7 text-ink/75">{t('aboutText')}</p></div><div className="mt-7 flex shrink-0 gap-3 text-3xl sm:mt-0" aria-hidden><span className="deco-tile -rotate-6">🕹️</span><span className="deco-tile rotate-6">✨</span></div></div></Section>
  </>
}
