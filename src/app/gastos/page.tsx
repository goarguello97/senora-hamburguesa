'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { useUser } from '@/components/navbar'
import { SkeletonList } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { Plus, Receipt, TrendingDown, X } from 'lucide-react'

interface Gasto {
  id: number
  descripcion: string
  monto: number
  categoria: string
  fecha: string
  usuario_nombre: string
}

export default function GastosPage() {
  const { user, loading: authLoading } = useUser()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [totales, setTotales] = useState({ hoy: 0, semana: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('Insumos')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadGastos()
  }, [])

  async function loadGastos() {
    setLoading(true)
    try {
      const res = await fetch('/api/gastos')
      const data = await res.json()
      setGastos(data.gastos)
      setTotales(data.totales)
    } catch (err) {
      toast.error('Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  async function agregarGasto() {
    if (!descripcion || !monto) {
      toast.error('Completá todos los campos')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto: parseInt(monto), categoria }),
      })

      if (!res.ok) {
        toast.error('Error al registrar gasto')
        return
      }

      toast.success('Gasto registrado')
      setDescripcion('')
      setMonto('')
      setCategoria('Insumos')
      setShowForm(false)
      loadGastos()
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  async function eliminarGasto(id: number) {
    if (!confirm('¿Eliminar gasto?')) return
    try {
      await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasto_id: id }),
      })
      toast.success('Gasto eliminado')
      loadGastos()
    } catch (err) {
      toast.error('Error de conexión')
    }
  }

  const categorias = ['Insumos', 'Materia prima', 'Limpieza', 'Servicios', 'Otros']

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <div className="flex-1 p-4 space-y-4 overflow-auto pb-20 md:pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="animate-slide-up">
            <CardContent className="p-4">
              <div className="text-xs text-muted flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Hoy
              </div>
              <div className="text-xl font-bold text-danger">${totales.hoy.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up">
            <CardContent className="p-4">
              <div className="text-xs text-muted flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Semana
              </div>
              <div className="text-xl font-bold text-danger">${totales.semana.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Gasto
          </Button>
        )}

        {showForm && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle>Nuevo Gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="ej: Pan, carne, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Monto ($)</label>
                <Input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <div className="flex gap-2 flex-wrap">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoria(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        categoria === cat
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'border-border text-muted hover:border-primary/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={agregarGasto} disabled={submitting} className="flex-1">
                  {submitting ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <h2 className="font-semibold">Gastos Recientes</h2>
          {loading && <SkeletonList count={3} />}
          {!loading && gastos.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="w-10 h-10 text-muted mx-auto mb-2" />
              <p className="text-muted text-sm">No hay gastos registrados</p>
            </div>
          )}
          {gastos.map((gasto) => (
            <div key={gasto.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
              <div>
                <div className="font-medium">{gasto.descripcion}</div>
                <div className="text-xs text-muted">
                  {gasto.categoria} • {gasto.fecha}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-danger">${gasto.monto.toLocaleString()}</span>
                <button
                  onClick={() => eliminarGasto(gasto.id)}
                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-danger rounded-full hover:bg-danger/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}