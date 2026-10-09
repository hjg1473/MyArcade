import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import type { Game } from '../types'
import { Badge } from './ui'

export function GameCard({ game }: { game: Game }) {
  const { language, t } = useLanguage()
  return <Link to={`/play/${game.id}`} className="game-card group" aria-label={`${game.title[language]} — ${game.playable ? t('play') : t('preview')}`}>
    <div className="relative aspect-video overflow-hidden bg-sky/15">
      <img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      <span className="sticker-play" aria-hidden>{game.playable ? 'PLAY!' : 'SOON!'}</span>
      {!game.playable && <Badge tone="white" className="absolute left-3 top-3">{t('demo')}</Badge>}
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="mb-2 flex items-start justify-between gap-3"><h3 className="text-xl font-black leading-tight text-ink">{game.title[language]}</h3><Badge tone={game.category === 'game' ? 'pink' : 'mint'}>{t(game.category)}</Badge></div>
      <p className="line-clamp-2 text-sm leading-6 text-ink/65">{game.description[language]}</p>
      <span className={`card-cta mt-5 ${game.playable ? 'bg-lemon' : 'bg-[#e6e6e6] text-ink/60'}`}>{game.playable ? `${t('play')} NOW!` : t('preview')} <span aria-hidden>→</span></span>
    </div>
  </Link>
}
