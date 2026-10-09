import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { InteractiveBackground } from './InteractiveBackground'

export function Layout() {
  return <div className="relative isolate min-h-screen"><InteractiveBackground /><div className="print-texture" aria-hidden="true" /><Header /><main><Outlet /></main><Footer /></div>
}
