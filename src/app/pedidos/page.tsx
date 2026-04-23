'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { useUser } from '@/components/navbar'
import { SkeletonList } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { Plus, UtensilsCrossed } from 'lucide-react'

interface Pedido {
  id: number
  estado: string
  total: number
  metodo_pago: string
  created_at: string
  cashier_nombre: string
  cliente: string
  items: Array<{
    id: number
    producto_nombre: string
    cantidad: number
    toppings: string
    aderezos: string
    omitidos: string
    estado_kds: string
  }>
}

export default function PedidosPage() {
  const { user, loading: authLoading } = useUser()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pedidos')
      .then((r) => r.json())
      .then((data) => {
        setPedidos(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Error al cargar pedidos')
        setLoading(false)
      })
  }, [])

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
      'completado': 'success',
      'en_preparacion': 'warning',
      'pendiente': 'neutral',
      'cancelado': 'danger',
    }
    return (
      <Badge variant={variants[estado] || 'neutral'} size="sm">
        {estado}
      </Badge>
    )
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <main className="flex-1 p-4 space-y-4 overflow-auto pb-20 md:pb-4">
        <Link href="/pedidos/nueva">
          <Button className="w-full text-lg py-5 shadow-md hover:shadow-lg transition-shadow">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Pedido
          </Button>
        </Link>

        <div className="space-y-2">
          <h2 className="font-semibold text-lg text-text">Pedidos Recientes</h2>
          
          {loading && <SkeletonList count={3} />}
          
          {!loading && pedidos.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No hay pedidos aún</p>
              <Link href="/pedidos/nueva" className="text-primary text-sm hover:underline">
                Crear primer pedido
              </Link>
            </div>
          )}

          {pedidos.map((pedido) => (
            <Link key={pedido.id} href={`/pedidos/${pedido.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-bold text-lg">#{pedido.id}</div>
                      {pedido.cliente && (
                        <div className="font-medium text-primary">{pedido.cliente}</div>
                      )}
                      <div className="text-sm text-muted">
                        {new Date(pedido.created_at).toLocaleTimeString('es-AR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {getStatusBadge(pedido.estado)}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-xl text-primary">
                        ${pedido.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted capitalize">{pedido.metodo_pago}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {pedido.items.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                      >
                        {item.cantidad}x {item.producto_nombre}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}