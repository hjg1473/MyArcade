import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { games } from '../data/games'

export function PlayPage() {
  const { gameId } = useParams(); const { language, t } = useLanguage(); const game = games.find((item) => item.id === gameId)
  const frameArea = useRef<HTMLDivElement>(null); const [loading, setLoading] = useState(true); const [failed, setFailed] = useState(false)
  useEffect(() => { setLoading(true); setFailed(false); window.scrollTo(0, 0) }, [gameId])
  if (!game) return <Status title={t('missingTitle')} text={t('missingText')} />
  const requestFullscreen = async () => { try { await frameArea.current?.requestFullscreen() } catch { setFailed(true) } }
  const buildUrl = `${import.meta.env.BASE_URL}${game.buildPath}`
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <Link to="/" className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-extrabold text-ink/60 hover:text-coral">← {t('back')}</Link>
    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><span className="rounded-full bg-lemon/35 px-3 py-1 text-xs font-black text-ink/70">{t(game.category)}</span><h1 className="mt-3 text-3xl font-black text-ink sm:text-4xl">{game.title[language]}</h1><p className="mt-3 max-w-2xl leading-7 text-ink/65">{game.description[language]}</p></div>{game.playable && <button onClick={requestFullscreen} className="btn-secondary self-start sm:self-auto" aria-label={`${game.title[language]} ${t('fullscreen')}`}>⛶ {t('fullscreen')}</button>}</div>
    <div ref={frameArea} className="relative mt-8 aspect-video min-h-[260px] overflow-hidden rounded-2xl border-2 border-ink bg-[#172033] shadow-card">
      {game.playable ? <><iframe src={buildUrl} title={game.title[language]} allowFullScreen onLoad={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true) }} className="h-full w-full border-0" />{loading && !failed && <div className="absolute inset-0 grid place-items-center bg-[#172033] text-sm font-bold text-white/75"><span className="animate-pulse">{t('loading')}</span></div>}{failed && <div className="absolute inset-0 grid place-items-center bg-[#172033] px-6 text-center font-bold text-white/75">{t('loadError')}</div>}</> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top,#33415f,#172033_65%)] px-6 text-center text-white"><div><div className="text-5xl" aria-hidden>🛠️</div><h2 className="mt-4 text-2xl font-black">{t('notReadyTitle')}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/65">{t('notReadyText')}</p></div></div>}
    </div>
    {game.keyboardOnly && <p className="mt-4 rounded-xl border border-lemon/70 bg-lemon/20 p-4 text-sm font-bold text-ink/75">⌨️ {t('keyboardNotice')}</p>}
    <div className="mt-8 grid gap-5 md:grid-cols-2"><section className="info-panel"><h2>{t('controls')}</h2><p>{game.controls[language]}</p></section><section className="info-panel"><h2>{t('details')}</h2><dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm"><dt>{t('builtWith')}</dt><dd>{game.engine ?? '—'}</dd><dt>{t('released')}</dt><dd>{game.releaseDate ?? t('preview')}</dd></dl></section></div>
    <div className="mt-10 text-center"><Link to="/" className="btn-secondary">← {t('back')}</Link></div>
  </div>
}

function Status({ title, text }: { title: string; text: string }) { const { t } = useLanguage(); return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center"><div><div className="text-5xl">🧩</div><h1 className="mt-5 text-3xl font-black text-ink">{title}</h1><p className="mt-3 text-ink/60">{text}</p><Link to="/" className="btn-secondary mt-7">← {t('back')}</Link></div></div> }
