import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  useEffect(() => {
    const finePointer = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const movePattern = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const x = ((event.clientX / window.innerWidth) - 0.5) * 10
        const y = ((event.clientY / window.innerHeight) - 0.5) * 10
        document.documentElement.style.setProperty('--pattern-x', `${x.toFixed(2)}px`)
        document.documentElement.style.setProperty('--pattern-y', `${y.toFixed(2)}px`)
      })
    }
    const resetPattern = () => {
      document.documentElement.style.setProperty('--pattern-x', '0px')
      document.documentElement.style.setProperty('--pattern-y', '0px')
    }

    window.addEventListener('pointermove', movePattern, { passive: true })
    document.documentElement.addEventListener('mouseleave', resetPattern)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', movePattern)
      document.documentElement.removeEventListener('mouseleave', resetPattern)
      resetPattern()
    }
  }, [])

  return <div className="relative isolate min-h-screen"><div className="animated-pattern" aria-hidden="true" /><Header /><main><Outlet /></main><Footer /></div>
}
