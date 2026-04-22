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
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <h1 className="text-lg font-bold">Señoría</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">{user.nombre}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
            Salir
          </Button>
        </div>
      </header>
      <nav className="bg-surface border-b border-border shrink-0">
        <div className="flex overflow-x-auto">
          {items.map((item) => {
            const isActive = currentPath.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 min-w-0 py-3 px-4 text-center text-sm font-medium whitespace-nowrap border-b-2 ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
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