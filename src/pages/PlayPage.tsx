import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { games } from '../data/games'
import { Badge, Button, ButtonLink } from '../components/ui'

export function PlayPage() {
  const { gameId } = useParams()
  const { language, t } = useLanguage()
  const game = games.find((item) => item.id === gameId)
  const frameArea = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setLoading(true); setFailed(false); window.scrollTo(0, 0) }, [gameId])
  if (!game) return <Status title={t('missingTitle')} text={t('missingText')} />

  const requestFullscreen = async () => { try { await frameArea.current?.requestFullscreen() } catch { setFailed(true) } }
  const buildUrl = game.buildPath ? `${import.meta.env.BASE_URL}${game.buildPath}` : ''
  const downloadUrl = game.downloadPath ? `${import.meta.env.BASE_URL}${game.downloadPath}` : ''
  const isGooglePlay = game.delivery === 'googleplay'
  const externalTitle = isGooglePlay ? t('getGooglePlay') : t('playRoblox')
  const externalGuide = isGooglePlay ? t('googlePlayGuide') : t('robloxGuide')

  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <ButtonLink to="/" tone="white">← {t('back')}</ButtonLink>
    <header className="project-heading mt-7"><div className="project-heading-copy">{game.icon && <img className="project-icon" src={`${import.meta.env.BASE_URL}${game.icon}`} alt="" />}<div><div className="flex flex-wrap gap-2"><Badge tone={game.category === 'game' ? 'pink' : 'mint'}>{t(game.category)}</Badge><Badge tone="white">{game.delivery === 'download' ? 'WINDOWS DOWNLOAD' : game.delivery === 'roblox' ? 'ROBLOX EXPERIENCE' : game.delivery === 'googleplay' ? 'GOOGLE PLAY RELEASE' : 'PLAY IN BROWSER'}</Badge></div><h1>{game.title[language]}</h1><p>{game.description[language]}</p></div></div><span className="project-serial" aria-hidden>HG / {game.id.toUpperCase()} / 01</span></header>

    {game.delivery === 'web' ? <div ref={frameArea} className="game-window mt-8"><div className="game-titlebar"><div className="flex items-center gap-2" aria-hidden><span /><span /><span /></div><strong>{game.title[language]}</strong><Button tone="white" className="ml-auto" onClick={requestFullscreen} aria-label={`${game.title[language]} ${t('fullscreen')}`}>⛶ {t('fullscreen')}</Button></div><div className="relative aspect-video min-h-[240px] bg-[#172033]"><iframe src={buildUrl} title={game.title[language]} allowFullScreen onLoad={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true) }} className="h-full w-full border-0" />{loading && !failed && <div className="absolute inset-0 grid place-items-center bg-[#172033] text-sm font-bold text-white/75"><span className="animate-pulse">{t('loading')}</span></div>}{failed && <div className="absolute inset-0 grid place-items-center bg-[#172033] px-6 text-center font-bold text-white/75">{t('loadError')}</div>}</div></div> : game.delivery === 'download' ? <section className="download-stage mt-8"><div className="download-art"><img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt="" /></div><div className="download-copy"><p className="kicker text-ink">WINDOWS BUILD · READY TO DOWNLOAD</p><h2>{t('downloadWindows')}</h2><p>{t('downloadGuide')}</p><div className="download-meta"><span>{game.platform ?? 'Windows'}</span>{game.downloadSize && <span>{game.downloadSize}</span>}<span>{game.engine}</span></div><a className="brutal-button tone-yellow download-button" href={downloadUrl} download={game.downloadFileName}>↓ {t('downloadWindows')}</a></div></section> : <section className={`download-stage mt-8 ${isGooglePlay ? 'googleplay-stage' : 'roblox-stage'}`}><div className="download-art"><img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt="" /></div><div className="download-copy"><p className="kicker text-ink">{isGooglePlay ? 'GOOGLE PLAY · ANDROID RELEASE' : 'ROBLOX EXPERIENCE · ONLINE'}</p><h2>{externalTitle}</h2><p>{externalGuide}</p><div className="download-meta"><span>{isGooglePlay ? 'GOOGLE PLAY' : 'ROBLOX'}</span><span>{game.platform}</span><span>{game.engine}</span></div><a className="brutal-button tone-pink download-button" href={game.externalUrl} target="_blank" rel="noreferrer">↗ {externalTitle}</a></div></section>}

    {game.keyboardOnly && <p className="mt-4 rounded-xl border border-lemon/70 bg-lemon/20 p-4 text-sm font-bold text-ink/75">⌨️ {t('keyboardNotice')}</p>}
    <div className="project-content mt-10"><section className="info-panel project-about"><p className="kicker">EDITORIAL FEATURE</p><h2>{t('aboutGame')}</h2><p>{game.longDescription[language]}</p></section><section className="info-panel"><h2>{t('controls')}</h2><p>{game.controls[language]}</p></section><section className="info-panel"><h2>{t('details')}</h2><dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm"><dt>{t('builtWith')}</dt><dd>{game.engine ?? '—'}</dd><dt>{t('platform')}</dt><dd>{game.platform ?? 'Web'}</dd><dt>{t('released')}</dt><dd>{game.releaseDate ?? '—'}</dd>{game.downloadSize && <><dt>{t('fileSize')}</dt><dd>{game.downloadSize}</dd></>}</dl></section></div>

    <section className="detail-section mt-12"><div className="detail-heading"><p className="kicker">SCREENSHOT ARCHIVE</p><h2>{t('gallery')}</h2></div><div className={`gallery-grid ${game.galleryPortrait ? 'portrait-gallery' : ''}`}>{game.gallery?.length ? game.gallery.map((image, index) => <figure key={image}><img src={`${import.meta.env.BASE_URL}${image}`} alt={`${game.title[language]} screenshot ${index + 1}`} loading="lazy" /></figure>) : [1, 2, 3].map((slot) => <div key={slot} className="gallery-placeholder"><span>IMAGE SLOT / 0{slot}</span><strong>{t('galleryEmpty')}</strong></div>)}</div></section>
    <section className="detail-section video-section mt-12"><div className="detail-heading"><p className="kicker">VIDEO CHANNEL</p><h2>{t('video')}</h2></div>{game.youtubeUrl ? <a href={game.youtubeUrl} target="_blank" rel="noreferrer" className="video-ready"><span aria-hidden>▶</span><strong>{t('watchYoutube')}</strong></a> : <div className="video-placeholder"><span aria-hidden>▶</span><div><strong>YOUTUBE VIDEO SLOT</strong><p>{t('videoEmpty')}</p></div></div>}</section>
    <div className="mt-12 text-center"><ButtonLink to="/" tone="yellow">← {t('back')}</ButtonLink></div>
  </div>
}

function Status({ title, text }: { title: string; text: string }) { const { t } = useLanguage(); return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center"><div className="info-panel"><div className="text-5xl">🧩</div><h1 className="mt-5 text-3xl font-black text-ink">{title}</h1><p className="mt-3 text-ink/70">{text}</p><ButtonLink to="/" className="mt-7">← {t('back')}</ButtonLink></div></div> }
