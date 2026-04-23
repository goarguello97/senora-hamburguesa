'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar({ user }: { user: { nombre: string; rol: string } | null }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  const baseItems = [
    { href: '/pedidos', label: 'Pedidos', icon: '📋' },
    { href: '/cocina', label: 'Cocina', icon: '🍳' },
    { href: '/caja', label: 'Caja', icon: '💰' },
  ]

  const adminItems = [
    { href: '/admin', label: 'Admin', icon: '⚙️' },
    { href: '/gastos', label: 'Gastos', icon: '📝' },
    { href: '/reportes', label: 'Reportes', icon: '📊' },
  ]

  const items = user.rol === 'admin' ? [...baseItems, ...adminItems] : baseItems

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

  return (
    <>
      <header className="bg-surface border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-soft shrink-0">
        <h1 className="text-lg font-bold text-text tracking-tight">Señora</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted font-medium">{user.nombre}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted hover:text-text hover:bg-primary/5">
            Salir
          </Button>
        </div>
      </header>
      <nav className="bg-surface/80 backdrop-blur-sm border-b border-border/30 shrink-0">
        <div className="flex overflow-x-auto">
          {items.map((item) => {
            const isActive = currentPath.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 min-w-0 py-3.5 px-4 text-center text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text hover:border-primary/30'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export function useUser() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; nombre: string; rol: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (checked) return

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setLoading(false)
        setChecked(true)
      })
      .catch(() => {
        router.push('/login')
        setLoading(false)
        setChecked(true)
      })
  }, [router, checked])

  return { user, loading }
}