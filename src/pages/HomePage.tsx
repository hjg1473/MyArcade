import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GameCard } from '../components/GameCard'
import { useLanguage } from '../context/LanguageContext'
import { games } from '../data/games'
import type { GameCategory } from '../types'
import { Badge, Section } from '../components/ui'
import { Marquee } from '../components/Marquee'
import { Reveal } from '../components/Reveal'

type Filter = 'all' | GameCategory
export function HomePage() {
  const { language, t } = useLanguage(); const [filter, setFilter] = useState<Filter>('all'); const { hash } = useLocation()
  const featured = games.find((game) => game.featured)
  const filtered = useMemo(() => (filter === 'all' ? games : games.filter((game) => game.category === filter)).filter((game) => !game.featured), [filter])
  useEffect(() => { if (hash === '#about') setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 0) }, [hash])
  const moveHeroDecor = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--hero-x', `${(((event.clientX - rect.left) / rect.width) - .5) * 10}px`)
    event.currentTarget.style.setProperty('--hero-y', `${(((event.clientY - rect.top) / rect.height) - .5) * 10}px`)
  }
  const resetHeroDecor = (event: ReactPointerEvent<HTMLDivElement>) => { event.currentTarget.style.setProperty('--hero-x', '0px'); event.currentTarget.style.setProperty('--hero-y', '0px') }
  return <>
    <Section className="pb-10 pt-9 sm:pt-12">
      <div className="hero-panel hero-upgraded" onPointerMove={moveHeroDecor} onPointerLeave={resetHeroDecor}>
        <div className="deco-checks" aria-hidden />
        <div className="cover-edition" aria-hidden>ISSUE 001 · OCT 2026</div><div className="cover-price" aria-hidden>₩ FREE</div>
        <div className="hero-copy"><Badge tone="mint" className="mb-5 -rotate-2 sticker-wiggle">ARCADE SPECIAL!</Badge><h1 className="hero-title"><span className="hero-hey">HEY!</span> WELCOME TO <span className="hero-brand">HAM GROUND!</span></h1><p className="mt-5 max-w-xl text-base font-bold leading-7 text-ink/75 sm:text-lg">{t('subtitle')}</p><a href="#games" className="brutal-button tone-pink mt-7">PLAY NOW! ↓</a><div className="cover-barcode" aria-hidden><span /><small>9 771996 091025</small></div></div>
        <div className="hero-collage" aria-hidden><span className="float-deco deco-heart">♥</span><span className="float-deco deco-bolt">ϟ</span><span className="float-deco deco-smile">☺</span><span className="float-deco deco-gamepad">🎮</span><span className="float-deco deco-arrow">↘</span><span className="float-deco deco-spark">✦</span></div>
      </div>
    </Section>
    <div className="marquee-stack" aria-label="Play, explore, create, repeat"><Marquee /><Marquee reverse /></div>
    <Section id="games" className="scroll-mt-24 py-8">
      {featured && <Reveal className="mb-14"><article className="featured-card group"><div className="featured-media"><img src={`${import.meta.env.BASE_URL}${featured.thumbnail}`} alt="" /><Badge tone="pink" className="featured-sticker sticker-wiggle">★ FEATURED</Badge></div><div className="featured-copy"><p className="kicker text-ink">THE MAIN EVENT</p><h2>{featured.title[language]}</h2><p>{featured.description[language]}</p><div className="mt-6 flex flex-wrap items-center gap-3"><Link to={`/play/${featured.id}`} className="brutal-button tone-yellow featured-play">PLAY NOW! <span aria-hidden>→</span></Link><Badge tone="blue">{featured.engine}</Badge></div></div></article></Reveal>}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="kicker">★ Select a game</p><h2 className="section-title">{t('browse')}</h2></div><div className="category-tabs" role="group" aria-label="Game category filter">{(['all', 'game', 'simulation'] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item === 'all' ? t('all') : item === 'game' ? t('games') : t('simulations')}</button>)}</div></div>
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((game, index) => <Reveal key={game.id} delay={index * 80} className="h-full"><GameCard game={game} /></Reveal>)}</div>
    </Section>
    <Section id="about" className="scroll-mt-24 py-10"><Reveal><div className="about-panel"><div><p className="kicker text-ink">ABOUT THIS PLACE</p><h2 className="section-title">{t('aboutTitle')}</h2><p className="mt-3 max-w-2xl font-semibold leading-7 text-ink/75">{t('aboutText')}</p></div><div className="mt-7 flex shrink-0 gap-3 text-3xl sm:mt-0" aria-hidden><span className="deco-tile -rotate-6">🕹️</span><span className="deco-tile rotate-6">✨</span></div></div></Reveal></Section>
  </>
}
