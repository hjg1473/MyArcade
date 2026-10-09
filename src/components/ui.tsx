import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Tone = 'yellow' | 'pink' | 'blue' | 'mint' | 'white'

export function Button({ tone = 'yellow', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return <button className={`brutal-button tone-${tone} ${className}`} {...props} />
}

export function ButtonLink({ to, children, tone = 'yellow', className = '', label }: { to: string; children: ReactNode; tone?: Tone; className?: string; label?: string }) {
  return <Link to={to} className={`brutal-button tone-${tone} ${className}`} aria-label={label}>{children}</Link>
}

export function Badge({ children, tone = 'yellow', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`brutal-badge tone-${tone} ${className}`}>{children}</span>
}

export function Section({ children, id, className = '' }: { children: ReactNode; id?: string; className?: string }) {
  return <section id={id} className={`section-shell ${className}`}>{children}</section>
}
