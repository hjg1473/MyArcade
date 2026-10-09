import { useEffect, useRef } from 'react'

interface Ripple { x: number; y: number; radius: number; opacity: number }

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    let width = 0; let height = 0; let dpr = 1; let frame = 0; let offset = 0
    let mouseX = -1000; let mouseY = -1000; let easedX = -1000; let easedY = -1000
    const ripples: Ripple[] = []

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth; height = window.innerHeight
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      const gap = width < 640 ? 34 : 30
      if (!reducedMotion.matches) offset = (offset + 0.12) % gap
      easedX += (mouseX - easedX) * 0.055; easedY += (mouseY - easedY) * 0.055

      for (let y = -gap + offset; y < height + gap; y += gap) {
        for (let x = -gap + offset; x < width + gap; x += gap) {
          let dotX = x; let dotY = y
          if (finePointer.matches && !reducedMotion.matches) {
            const dx = x - easedX; const dy = y - easedY; const distance = Math.hypot(dx, dy)
            if (distance < 120 && distance > 0) {
              const force = (1 - distance / 120) * 8
              dotX += (dx / distance) * force; dotY += (dy / distance) * force
            }
          }
          context.beginPath(); context.arc(dotX, dotY, 1.45, 0, Math.PI * 2)
          context.fillStyle = 'rgba(48,43,42,.115)'; context.fill()
        }
      }

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index]
        context.beginPath(); context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        context.strokeStyle = `rgba(48,43,42,${ripple.opacity})`; context.lineWidth = 2; context.stroke()
        ripple.radius += 1.4; ripple.opacity -= 0.008
        if (ripple.opacity <= 0) ripples.splice(index, 1)
      }
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => { mouseX = event.clientX; mouseY = event.clientY }
    const onPointerLeave = () => { mouseX = -1000; mouseY = -1000 }
    const onClick = (event: MouseEvent) => { if (!reducedMotion.matches) ripples.push({ x: event.clientX, y: event.clientY, radius: 4, opacity: .22 }) }
    const onMotionChange = () => { cancelAnimationFrame(frame); draw() }

    resize(); draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('click', onClick)
    reducedMotion.addEventListener('change', onMotionChange)
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave); window.removeEventListener('click', onClick); reducedMotion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return <canvas ref={canvasRef} className="interactive-background" aria-hidden="true" />
}
