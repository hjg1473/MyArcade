import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import type { Game } from '../types'
import { Badge } from './ui'

export function FeaturedCarousel({ games }: { games: Game[] }) {
  const { language, t } = useLanguage()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || games.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % games.length), 5200)
    return () => window.clearInterval(timer)
  }, [games.length, paused])

  const move = (direction: number) => setActive((index) => (index + direction + games.length) % games.length)

  return <section className="featured-carousel" aria-roledescription="carousel" aria-label={t('featuredGames')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="featured-track" style={{ transform: `translateX(-${active * 100}%)` }}>
      {games.map((game, index) => <article key={game.id} className="featured-card featured-slide" aria-hidden={index !== active}>
        <div className="featured-media"><img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt="" /><Badge tone={game.delivery === 'download' ? 'blue' : 'pink'} className="featured-sticker sticker-wiggle">★ {game.delivery === 'download' ? 'PC DOWNLOAD' : game.delivery === 'roblox' ? 'ROBLOX EXPERIENCE' : 'PLAY ONLINE'}</Badge></div>
        <div className="featured-copy"><p className="kicker text-ink">HAM GROUND SELECTS · 0{index + 1}</p><h2>{game.title[language]}</h2><p>{game.description[language]}</p><div className="mt-6 flex flex-wrap items-center gap-3"><Link to={`/play/${game.id}`} className="brutal-button tone-yellow featured-play">{game.delivery === 'download' ? t('download') : game.delivery === 'roblox' ? t('playRoblox') : `${t('play')} NOW!`} <span aria-hidden>→</span></Link><Badge tone="white">{game.engine}</Badge></div></div>
      </article>)}
    </div>
    {games.length > 1 && <div className="carousel-controls"><button type="button" onClick={() => move(-1)} aria-label={t('previous')}>←</button><div className="carousel-dots">{games.map((game, index) => <button key={game.id} type="button" className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`${game.title[language]} ${t('slideOf')} ${index + 1}`} aria-current={index === active ? 'true' : undefined} />)}</div><button type="button" onClick={() => move(1)} aria-label={t('next')}>→</button></div>}
  </section>
}
