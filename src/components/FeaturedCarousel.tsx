import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import type { Game } from '../types'
import { Badge } from './ui'

export function FeaturedCarousel({ games }: { games: Game[] }) {
  const { language, t } = useLanguage()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(media.matches)
    updatePreference()
    media.addEventListener('change', updatePreference)
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (paused || games.length < 2 || reducedMotion) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % games.length), 8000)
    return () => window.clearInterval(timer)
  }, [games.length, paused, reducedMotion])

  const move = (direction: number) => setActive((index) => (index + direction + games.length) % games.length)

  return <section className="featured-carousel" aria-roledescription="carousel" aria-label={t('featuredGames')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="featured-track" style={{ transform: `translateX(-${active * 100}%)` }}>
      {games.map((game, index) => {
        const videoId = getYouTubeId(game.youtubeUrl)
        const mediaImage = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : `${import.meta.env.BASE_URL}${game.thumbnail}`
        const isShort = game.youtubeUrl?.includes('/shorts/') ?? false
        return <article key={game.id} className={`featured-card featured-slide ${isShort ? 'featured-short' : ''}`} aria-hidden={index !== active}>
          <div className="featured-backdrop" aria-hidden="true">{index === active && videoId ? <iframe src={getTrailerEmbedUrl(videoId, !reducedMotion)} title="" tabIndex={-1} allow="autoplay; encrypted-media" /> : <img src={mediaImage} alt="" />}</div>
          <div className="featured-media">{index === active && videoId ? <div className="featured-player-frame"><iframe src={getTrailerEmbedUrl(videoId, !reducedMotion)} title={`${game.title[language]} trailer`} allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div> : <img src={mediaImage} alt="" />}</div>
          <div className="featured-shade" aria-hidden="true" />
          <Badge tone={game.delivery === 'download' ? 'blue' : 'pink'} className="featured-sticker sticker-wiggle">★ {videoId ? 'WATCH TRAILER' : game.delivery === 'download' ? 'PC DOWNLOAD' : game.delivery === 'roblox' ? 'ROBLOX EXPERIENCE' : game.delivery === 'googleplay' ? 'ANDROID RELEASE' : 'PLAY ONLINE'}</Badge>
          <div className="featured-copy"><p className="kicker">HAM GROUND SELECTS · 0{index + 1}</p><h2>{game.title[language]}</h2><p>{game.description[language]}</p><div className="mt-6 flex flex-wrap items-center gap-3"><Link to={`/play/${game.id}`} className="brutal-button tone-yellow featured-play">{game.delivery === 'download' ? t('download') : game.delivery === 'roblox' ? t('playRoblox') : game.delivery === 'googleplay' ? t('getGooglePlay') : game.delivery === 'video' ? t('watchProject') : `${t('play')} NOW!`} <span aria-hidden>→</span></Link><Badge tone="white">{game.engine}</Badge></div></div>
        </article>
      })}
    </div>
    {games.length > 1 && <div className="carousel-controls"><button type="button" onClick={() => move(-1)} aria-label={t('previous')}>←</button><div className="carousel-dots">{games.map((game, index) => <button key={game.id} type="button" className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`${game.title[language]} ${t('slideOf')} ${index + 1}`} aria-current={index === active ? 'true' : undefined} />)}</div><button type="button" onClick={() => move(1)} aria-label={t('next')}>→</button></div>}
  </section>
}

function getYouTubeId(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.pathname.startsWith('/shorts/') ? parsed.pathname.split('/')[2] : parsed.searchParams.get('v')
    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : ''
  } catch {
    return ''
  }
}

function getTrailerEmbedUrl(videoId: string, autoplay: boolean) {
  const auto = autoplay ? '1' : '0'
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${auto}&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=0&disablekb=1&rel=0`
}
