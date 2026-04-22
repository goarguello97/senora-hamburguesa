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
        'flex flex-col items-center justify-center flex-1 h-full transition-all',
        isActive 
          ? 'text-primary bg-primary/5' 
          : 'text-muted hover:text-text'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className="w-5 h-5" />
      <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
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
      <header className="hidden md:flex bg-primary text-white px-4 py-3 items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/pedidos" className="flex items-center gap-2">
            <ChefHat className="w-6 h-6" />
            <h1 className="text-lg font-bold">Señora Hamburguesa</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{user.nombre}</span>
          <button
            onClick={handleLogout}
            className="text-sm opacity-80 hover:opacity-100 transition-opacity"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:block bg-surface border-b border-border shrink-0">
        <div className="flex max-w-7xl mx-auto">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 min-w-0 py-3 px-4 text-center text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-text hover:border-gray-300'
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
      <header className="md:hidden bg-primary text-white px-3 py-2 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-40">
        <Link href="/pedidos" className="flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          <h1 className="text-base font-bold">Señora Hamburguesa</h1>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-80">{user.nombre}</span>
          <button
            onClick={handleLogout}
            className="text-xs opacity-80 hover:opacity-100 p-1"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Native Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 safe-area-bottom">
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