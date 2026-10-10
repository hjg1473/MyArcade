import { useEffect, useRef, useState } from 'react'

const items = ['PLAY', '★', 'EXPLORE', '🎮', 'CREATE', '✦', 'REPEAT', '♥']

export function Marquee({ reverse = false }: { reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const slowRef = useRef(false)
  const [copies, setCopies] = useState(2)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const updateCopies = () => {
      const groupWidth = group.offsetWidth
      if (groupWidth > 0) setCopies(Math.max(2, Math.ceil(window.innerWidth / groupWidth) + 1))
    }
    const observer = new ResizeObserver(updateCopies)
    observer.observe(group)
    window.addEventListener('resize', updateCopies)
    updateCopies()
    return () => { observer.disconnect(); window.removeEventListener('resize', updateCopies) }
  }, [])

  useEffect(() => {
    const track = trackRef.current; const group = groupRef.current
    if (!track || !group) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0; let last = performance.now(); let position = 0; let speed = reverse ? 46 : -46
    const tick = (time: number) => {
      const delta = Math.min((time - last) / 1000, .05); last = time
      const target = (reverse ? 1 : -1) * (slowRef.current ? 13 : 46)
      speed += (target - speed) * Math.min(delta * 3.5, 1)
      const width = group.offsetWidth
      if (width > 0) {
        position += speed * delta
        if (position <= -width) position += width
        if (position >= 0) position -= width
        track.style.transform = `translate3d(${position}px,0,0)`
      }
      frame = requestAnimationFrame(tick)
    }
    if (!reducedMotion.matches) frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reverse])

  const group = (key: string, ref?: React.RefObject<HTMLDivElement | null>) => <div key={key} ref={ref} className="marquee-group">{items.map((item, index) => <span key={`${key}-${index}`} className={index % 2 ? 'accent' : ''}>{item}</span>)}</div>
  return <div className={`marquee ${reverse ? 'marquee-reverse' : ''}`} onMouseEnter={() => { slowRef.current = true }} onMouseLeave={() => { slowRef.current = false }}><div ref={trackRef} className="marquee-track">{Array.from({ length: copies }, (_, index) => group(`group-${index}`, index === 0 ? groupRef : undefined))}</div></div>
}
