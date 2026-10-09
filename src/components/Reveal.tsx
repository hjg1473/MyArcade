import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.classList.add('is-visible'); return }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add('is-visible'); observer.disconnect() } }, { threshold: .12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>{children}</div>
}
