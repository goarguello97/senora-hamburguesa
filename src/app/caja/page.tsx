'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { useUser } from '@/components/navbar'
import { SkeletonInput } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { Banknote, ArrowRightLeft, DollarSign } from 'lucide-react'

export default function CajaPage() {
  const { user, loading: authLoading } = useUser()
  const [apertura, setApertura] = useState<{ id: number; monto_inicial: number; created_at: string } | null>(null)
  const [arqueo, setArqueo] = useState<{ id: number; monto_final: number; created_at: string } | null>(null)
  const [ingresos, setIngresos] = useState({ efectivo: 0, transferencia: 0 })
  const [montoInicial, setMontoInicial] = useState('')
  const [montoFinal, setMontoFinal] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    loadCaja()
  }, [])

  async function loadCaja() {
    setLoadingData(true)
    try {
      const res = await fetch('/api/caja')
      const data = await res.json()
      setApertura(data.apertura)
      setArqueo(data.arqueo)
      setIngresos({ efectivo: data.ingresos_hoy, transferencia: data.ingresos_transferencia })
    } catch (err) {
      toast.error('Error al cargar datos')
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  async function abrirCaja() {
    if (!montoInicial) return
    setLoading(true)

    try {
      const res = await fetch('/api/caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'abrir', monto_inicial: parseInt(montoInicial) }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al abrir caja')
        return
      }

      toast.success('Caja abierta', {
        description: `Monto inicial: $${parseInt(montoInicial).toLocaleString()}`,
      })
      setMontoInicial('')
      loadCaja()
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function cerrarCaja() {
    if (!montoFinal) return
    setLoading(true)

    try {
      const res = await fetch('/api/caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cerrar', monto_final: parseInt(montoFinal) }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al cerrar caja')
        return
      }

      toast.success('Caja cerrada', {
        description: diferencia !== null 
          ? `Diferencia: ${diferencia >= 0 ? '+' : ''}$${diferencia.toLocaleString()}`
          : 'Caja cerrada exitosamente',
      })
      setMontoFinal('')
      loadCaja()
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const efectivoEsperado = apertura ? apertura.monto_inicial + ingresos.efectivo : 0
  const diferencia = arqueo && apertura ? arqueo.monto_final - efectivoEsperado : null

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
        {!loadingData && !apertura && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                Apertura de Caja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Monto inicial ($)</label>
                <Input
                  type="number"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button 
                onClick={abrirCaja} 
                disabled={loading || !montoInicial} 
                className="w-full"
              >
                {loading ? 'Abriendo...' : 'Abrir Caja'}
              </Button>
            </CardContent>
          </Card>
        )}

        {loadingData && (
          <Card>
            <CardHeader>
              <SkeletonInput />
            </CardHeader>
            <CardContent>
              <SkeletonInput />
            </CardContent>
          </Card>
        )}

        {!loadingData && apertura && !arqueo && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-success" />
                Caja Abierta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted">
                Apertura: {new Date(apertura.created_at).toLocaleString('es-AR')}
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <span className="text-sm">Fondo inicial:</span>
                <span className="font-bold text-lg">${apertura.monto_inicial.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-50 p-3 rounded-lg">
                  <div className="text-xs text-muted flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Efectivo
                  </div>
                  <div className="font-bold text-primary text-lg">${ingresos.efectivo.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-muted flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" /> Transferencia
                  </div>
                  <div className="font-bold text-lg">${ingresos.transferencia.toLocaleString()}</div>
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm">Efectivo esperado:</span>
                <span className="font-bold">${efectivoEsperado.toLocaleString()}</span>
              </div>
              <div>
                <label className="text-sm font-medium">Monto en mano ($)</label>
                <Input
                  type="number"
                  value={montoFinal}
                  onChange={(e) => setMontoFinal(e.target.value)}
                  placeholder="Ingresá el monto"
                />
              </div>
              {montoFinal && (
                <div className={`p-3 rounded-lg text-center font-bold ${
                  diferencia !== null && diferencia >= 0 
                    ? 'bg-success/20 text-success' 
                    : 'bg-danger/20 text-danger'
                }`}
                >
                  Diferencia: ${diferencia?.toLocaleString() || 0}
                </div>
              )}
              <Button 
                onClick={cerrarCaja} 
                disabled={loading || !montoFinal} 
                className="w-full"
              >
                {loading ? 'Cerrando...' : 'Cerrar Caja'}
              </Button>
            </CardContent>
          </Card>
        )}

        {!loadingData && apertura && arqueo && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-muted" />
                Caja Cerrada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted">
                Cerrada: {new Date(arqueo.created_at).toLocaleString('es-AR')}
              </div>
              <div className="flex justify-between p-2">
                <span>Ingresos efectivo:</span>
                <span className="font-bold">${ingresos.efectivo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span>Monto final:</span>
                <span className="font-bold">${arqueo.monto_final.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-primary-50 rounded-lg">
                <span>Diferencia:</span>
                <span className={`font-bold ${diferencia !== null && diferencia >= 0 ? 'text-success' : 'text-danger'}`}>
                  {diferencia !== null && diferencia >= 0 ? '+' : ''}${diferencia?.toLocaleString() || 0}
                </span>
              </div>
              <Button onClick={() => { setApertura(null); setArqueo(null); loadCaja(); }} variant="outline" className="w-full mt-4">
                Nueva Apertura
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}