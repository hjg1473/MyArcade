import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import type { Game } from '../types'

export function GameCard({ game }: { game: Game }) {
  const { language, t } = useLanguage()
  return <Link to={`/play/${game.id}`} className="game-card group" aria-label={`${game.title[language]} — ${game.playable ? t('play') : t('preview')}`}>
    <div className="relative aspect-video overflow-hidden bg-sky/15">
      <img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      {!game.playable && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-ink shadow-sm">{t('demo')}</span>}
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="mb-2 flex items-start justify-between gap-3"><h3 className="text-lg font-black text-ink">{game.title[language]}</h3><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${game.category === 'game' ? 'bg-coral/15 text-[#b83d36]' : 'bg-mint/20 text-[#24745d]'}`}>{t(game.category)}</span></div>
      <p className="line-clamp-2 text-sm leading-6 text-ink/65">{game.description[language]}</p>
      <span className={`mt-5 inline-flex items-center gap-1 self-start text-sm font-extrabold ${game.playable ? 'text-coral' : 'text-ink/45'}`}>{game.playable ? t('play') : t('preview')} <span aria-hidden>→</span></span>
    </div>
  </Link>
}
