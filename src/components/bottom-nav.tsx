'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  ChefHat,
  Banknote,
  Settings,
  Receipt,
  BarChart3,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const baseItems: NavItem[] = [
  { href: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/cocina', label: 'Cocina', icon: ChefHat },
  { href: '/caja', label: 'Caja', icon: Banknote },
]

const adminItems: NavItem[] = [
  { href: '/admin', label: 'Admin', icon: Settings },
  { href: '/gastos', label: 'Gastos', icon: Receipt },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
]

interface BottomNavProps {
  user: { nombre: string; rol: string } | null
}

function MobileNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = item.href
  }

  return (
    <a
      href={item.href}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
        isActive 
          ? 'text-primary bg-primary/10' 
          : 'text-muted hover:text-text'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className="w-5 h-5" />
      <span className="text-[10px] mt-0.5 font-semibold">{item.label}</span>
    </a>
  )
}

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  if (!user) return null

  const items = user.rol === 'admin' ? [...baseItems, ...adminItems] : baseItems

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex bg-surface border-b border-border/50 px-4 py-3 items-center justify-between shadow-soft shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/pedidos" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <h1 className="text-lg font-bold tracking-tight text-text">Señora</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted font-medium">{user.nombre}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-text transition-colors font-medium"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:block bg-surface/80 backdrop-blur-sm border-b border-border/30 shrink-0">
        <div className="flex max-w-7xl mx-auto">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 min-w-0 py-3.5 px-4 text-center text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-text hover:border-primary/30'
                )}
              >
                <span className="mr-2">
                  <item.icon className="w-4 h-4 inline" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Header - Compact */}
      <header className="md:hidden bg-surface border-b border-border/50 px-3 py-2 flex items-center justify-between shadow-soft shrink-0 sticky top-0 z-40">
        <Link href="/pedidos" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
            S
          </div>
          <h1 className="text-base font-bold tracking-tight text-text">Señora</h1>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">{user.nombre}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-text p-1 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Native Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border/50 z-50 safe-area-bottom shadow-[0_-2px_8px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-16">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <MobileNavItem 
                key={item.href} 
                item={item} 
                isActive={isActive} 
              />
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default BottomNav