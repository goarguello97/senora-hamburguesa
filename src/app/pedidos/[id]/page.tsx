'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { useUser } from '@/components/navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, User, CreditCard, Calendar } from 'lucide-react'

interface PedidoItem {
  id: number
  producto_id: number
  cantidad: number
  toppings: string
  aderezos: string
  omitidos: string
  nota: string
  producto_nombre: string
}

interface Pedido {
  id: number
  estado: string
  total: number
  metodo_pago: string
  created_at: string
  cashier_nombre: string
  items: PedidoItem[]
}

export default function PedidoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pedidos')
      .then((r) => r.json())
      .then((data) => {
        const p = data.find((p: Pedido) => p.id === parseInt(params.id as string))
        if (p) {
          setPedido(p)
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error('Error al cargar pedido')
        setLoading(false)
      })
  }, [params.id])

  function parseJsonSafe(str: string): string[] {
    try {
      return JSON.parse(str || '[]')
    } catch {
      return []
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <BottomNav user={user} />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <BottomNav user={user} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
          <div className="text-4xl">❌</div>
          <p className="text-muted">Pedido no encontrado</p>
          <Link href="/pedidos">
            <Button>Volver a Pedidos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = () => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
      'completado': { variant: 'success', label: 'Completado' },
      'en_preparacion': { variant: 'warning', label: 'En preparación' },
      'pendiente': { variant: 'neutral', label: 'Pendiente' },
      'cancelado': { variant: 'danger', label: 'Cancelado' },
    }
    const status = config[pedido.estado] || { variant: 'neutral' as const, label: pedido.estado }
    return <Badge variant={status.variant}>{status.label}</Badge>
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <div className="flex-1 p-4 space-y-4 pb-20 md:pb-4 overflow-auto">
        <Link href="/pedidos" className="inline-flex items-center text-sm text-muted hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Link>

        <Card className="animate-slide-up">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Pedido #{pedido.id}</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
                <Calendar className="w-4 h-4 text-muted" />
                <div>
                  <span className="text-xs text-muted block">Fecha:</span>
                  <span>{new Date(pedido.created_at).toLocaleString('es-AR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
                <User className="w-4 h-4 text-muted" />
                <div>
                  <span className="text-xs text-muted block">Cajero:</span>
                  <span>{pedido.cashier_nombre}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-muted" />
                <div>
                  <span className="text-xs text-muted block">Método:</span>
                  <span className="font-medium capitalize">{pedido.metodo_pago}</span>
                </div>
              </div>
              <div className="p-2 bg-primary-50 rounded-lg">
                <span className="text-xs text-muted block">Total:</span>
                <span className="font-bold text-xl text-primary">${pedido.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2 animate-slide-up">
          <h2 className="font-semibold">Items</h2>
          {pedido.items.map((item) => (
            <div key={item.id} className="p-4 bg-surface rounded-xl border border-border">
              <div className="font-medium text-lg">
                {item.cantidad}x {item.producto_nombre}
              </div>
              {parseJsonSafe(item.toppings).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parseJsonSafe(item.toppings).map((t, i) => (
                    <Badge key={i} variant="default" size="sm">+ {t}</Badge>
                  ))}
                </div>
              )}
              {parseJsonSafe(item.aderezos).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {parseJsonSafe(item.aderezos).map((a, i) => (
                    <Badge key={i} variant="warning" size="sm">{a}</Badge>
                  ))}
                </div>
              )}
              {parseJsonSafe(item.omitidos).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {parseJsonSafe(item.omitidos).map((o, i) => (
                    <Badge key={i} variant="danger" size="sm">Sin {o}</Badge>
                  ))}
                </div>
              )}
              {item.nota && (
                <div className="text-sm text-muted mt-2 italic">Nota: {item.nota}</div>
              )}
            </div>
          ))}
        </div>

        <Link href="/pedidos" className="block">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Pedidos
          </Button>
        </Link>
      </div>
    </div>
  )
}