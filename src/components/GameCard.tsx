import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import type { Game } from '../types'
import { Badge } from './ui'

export function GameCard({ game }: { game: Game }) {
  const { language, t } = useLanguage()
  const serial = `HG-${game.id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}`
  const action = game.delivery === 'download' ? t('download') : game.delivery === 'roblox' ? t('playRoblox') : game.delivery === 'googleplay' ? t('getGooglePlay') : t('play')
  return <Link to={`/play/${game.id}`} className={`game-card group category-${game.category}`} aria-label={`${game.title[language]} — ${action}`}>
    <div className="relative aspect-video overflow-hidden bg-sky/15">
      <img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt="" loading="lazy" className={`h-full w-full transition duration-300 group-hover:scale-[1.03] ${game.delivery === 'roblox' || game.delivery === 'googleplay' ? 'bg-ink object-contain' : 'object-cover'}`} />
      <span className="sticker-play" aria-hidden>{game.delivery === 'download' ? 'GET IT!' : 'PLAY!'}</span>
      <Badge tone="white" className="absolute left-3 top-3">{game.delivery === 'download' ? 'WINDOWS' : game.delivery === 'roblox' ? 'ROBLOX' : game.delivery === 'googleplay' ? 'ANDROID' : 'WEB'}</Badge>
    </div>
    <div className="cartridge-body flex flex-1 flex-col p-4 sm:p-5">
      <div className="cartridge-meta"><span>HAM GROUND™</span><span>{serial}</span></div>
      <div className="mb-2 flex items-start justify-between gap-3"><h3 className="text-xl font-black leading-tight text-ink">{game.title[language]}</h3><Badge tone={game.category === 'game' ? 'pink' : 'mint'}>{t(game.category)}</Badge></div>
      <p className="line-clamp-2 text-sm leading-6 text-ink/65">{game.description[language]}</p>
      <span className="card-cta mt-5 bg-lemon">{action} <span aria-hidden>→</span></span>
    </div>
  </Link>
}
