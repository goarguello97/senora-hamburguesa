'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { useUser } from '@/components/navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react'

interface ReporteData {
  ingresos_efectivo: number
  ingresos_transferencia: number
  total_gastos: number
  pedido_count: number
  productos_vendidos: Array<{
    nombre: string
    cantidad: number
    total: number
  }>
}

export default function ReportesPage() {
  const { user, loading: authLoading } = useUser()
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reportes')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Error al cargar reportes')
        setLoading(false)
      })
  }, [])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted">Acceso denegado</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <BottomNav user={user} />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <BottomNav user={user} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted">Error al cargar reportes</p>
        </div>
      </div>
    )
  }

  const totalIngresos = data.ingresos_efectivo + data.ingresos_transferencia
  const ganancia = totalIngresos - data.total_gastos

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <div className="flex-1 p-4 space-y-4 overflow-auto pb-20 md:pb-4">
        <Card className="animate-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumen de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success-50 p-4 rounded-xl">
                <div className="text-xs text-muted flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Ingresos
                </div>
                <div className="text-xl font-bold text-success">${totalIngresos.toLocaleString()}</div>
              </div>
              <div className="bg-danger-50 p-4 rounded-xl">
                <div className="text-xs text-muted flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Gastos
                </div>
                <div className="text-xl font-bold text-danger">${data.total_gastos.toLocaleString()}</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${ganancia >= 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
              <div className="text-sm text-muted">Ganancia Neta</div>
              <div className={`text-2xl font-bold ${ganancia >= 0 ? 'text-success' : 'text-danger'}`}>
                ${ganancia.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2">
                <span className="text-muted">Pedidos:</span>
                <span className="font-bold">{data.pedido_count}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-muted flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Efectivo:
                </span>
                <span>${data.ingresos_efectivo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-muted">Transferencia:</span>
                <span>${data.ingresos_transferencia.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.productos_vendidos.map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-primary-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{prod.nombre}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{prod.cantidad} uds</div>
                    <div className="text-xs text-muted">${prod.total.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {data.productos_vendidos.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingBag className="w-10 h-10 text-muted mx-auto mb-2" />
                  <p className="text-muted text-sm">Sin ventas hoy</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}