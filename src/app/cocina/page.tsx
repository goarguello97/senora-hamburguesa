'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { useUser } from '@/components/navbar'
import { Skeleton, SkeletonList } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { ChefHat, CheckCircle2 } from 'lucide-react'

interface KitchenItem {
  id: number
  pedido_id: number
  producto_nombre: string
  cantidad: number
  toppings: string
  aderezos: string
  omitidos: string
  estado_kds: string
  pedido_fecha: string
  pedido_cliente: string
}

export default function CocinaPage() {
  const { user, loading: authLoading } = useUser()
  const [items, setItems] = useState<KitchenItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch('/api/cocina')
      const data = await res.json()
      setItems(data)
    } catch (err) {
      toast.error('Error al cargar pedidos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
    const interval = setInterval(loadItems, 5000)
    return () => clearInterval(interval)
  }, [loadItems])

  async function marcarListo(itemId: number) {
    try {
      const res = await fetch('/api/cocina', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, estado: 'listo' }),
      })
      
      if (res.ok) {
        toast.success('Item marcado como listo')
        loadItems()
      } else {
        toast.error('Error al actualizar')
      }
    } catch (err) {
      toast.error('Error de conexión')
      console.error(err)
    }
  }

  function parseJsonSafe(str: string): string[] {
    try {
      return JSON.parse(str || '[]')
    } catch {
      return []
    }
  }

  const groupedByPedido = items.reduce((acc, item) => {
    if (!acc[item.pedido_id]) acc[item.pedido_id] = []
    acc[item.pedido_id].push(item)
    return acc
  }, {} as Record<number, KitchenItem[]>)

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <div className="flex-1 p-4 space-y-4 pb-20 md:pb-4 overflow-auto">
        {loading ? (
          <SkeletonList count={2} />
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <ChefHat className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted">No hay pedidos pendientes</p>
              <p className="text-sm text-muted mt-1">Los nuevos pedidos aparecerán aquí</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedByPedido).map(([pedidoId, pedidoItems]) => (
            <div key={pedidoId}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-bold text-lg">
                  Pedido #{pedidoId}
                </h2>
                {pedidoItems[0].pedido_cliente && (
                  <span className="font-medium text-primary">
                    - {pedidoItems[0].pedido_cliente}
                  </span>
                )}
                <span className="text-xs text-muted">
                  {new Date(pedidoItems[0].pedido_fecha).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="space-y-2">
                {pedidoItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 bg-surface transition-all ${
                      item.estado_kds === 'listo' 
                        ? 'border-success/50 bg-success-50 opacity-75' 
                        : 'border-primary shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-lg">
                          {item.cantidad > 1 && `${item.cantidad}x `}
                          {item.producto_nombre}
                        </div>
                        
                        {parseJsonSafe(item.toppings).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {parseJsonSafe(item.toppings).map((t, i) => (
                              <Badge key={i} variant="default" size="sm">
                                + {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {parseJsonSafe(item.aderezos).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {parseJsonSafe(item.aderezos).map((a, i) => (
                              <Badge key={i} variant="warning" size="sm">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {parseJsonSafe(item.omitidos).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {parseJsonSafe(item.omitidos).map((o, i) => (
                              <Badge key={i} variant="danger" size="sm">
                                Sin {o}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {item.estado_kds !== 'listo' ? (
                        <Button 
                          onClick={() => marcarListo(item.id)} 
                          size="sm" 
                          variant="success"
                          className="shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Listo
                        </Button>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Listo
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}