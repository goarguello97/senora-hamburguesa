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
import { Users, Package, Plus, Pencil, Trash2 } from 'lucide-react'

interface Usuario {
  id: number
  nombre: string
  rol: 'cajero' | 'admin'
}

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria_id: number
  activo: number
  categoria_nombre?: string
}

const CATEGORIAS: Record<number, string> = { 1: 'Hamburguesas', 2: 'Lomitos', 3: 'Pizzas' }

export default function AdminPage() {
  const { user, loading: authLoading } = useUser()
  const [tab, setTab] = useState<'usuarios' | 'productos'>('usuarios')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({ nombre: '', password: '', rol: 'cajero' as 'cajero' | 'admin' })
  const [editProd, setEditProd] = useState<Producto | null>(null)
  const [prodEditData, setProdEditData] = useState({ nombre: '', precio: '' })

  useEffect(() => {
    if (!authLoading) loadData()
  }, [tab, authLoading])

  async function loadData() {
    setLoading(true)
    try {
      if (tab === 'usuarios') {
        const res = await fetch('/api/usuarios')
        if (res.ok) setUsuarios(await res.json())
      } else {
        const res = await fetch('/api/productos?all=1')
        const data = await res.json()
        setProductos(data.map((p: Producto) => ({ ...p, categoria_nombre: CATEGORIAS[p.categoria_id] })))
      }
    } catch (err) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  async function guardarUsuario() {
    if (!formData.nombre || !formData.password) {
      toast.error('Completá todos los campos')
      return
    }
    try {
      const res = await fetch('/api/usuarios', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando ? { id: editando.id, ...formData } : formData),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al guardar')
        return
      }
      toast.success(editando ? 'Usuario actualizado' : 'Usuario creado')
      setShowForm(false)
      setEditando(null)
      setFormData({ nombre: '', password: '', rol: 'cajero' })
      loadData()
    } catch (err) {
      toast.error('Error de conexión')
    }
  }

  async function eliminarUsuario(id: number) {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      const res = await fetch(`/api/usuarios?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Usuario eliminado')
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error)
      }
    } catch (err) {
      toast.error('Error de conexión')
    }
  }

  async function guardarProducto() {
    if (!editProd || !prodEditData.nombre || !prodEditData.precio) return
    try {
      const res = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editProd.id,
          nombre: prodEditData.nombre,
          precio: parseInt(prodEditData.precio),
        }),
      })
      if (res.ok) {
        toast.success('Producto actualizado')
        setEditProd(null)
        setProdEditData({ nombre: '', precio: '' })
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error)
      }
    } catch (err) {
      toast.error('Error de conexión')
    }
  }

  async function toggleProducto(p: Producto) {
    try {
      await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, activo: p.activo === 1 ? 0 : 1 }),
      })
      toast.success(p.activo === 1 ? 'Producto desactivado' : 'Producto activado')
      loadData()
    } catch (err) {
      toast.error('Error de conexión')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (user?.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted">Acceso denegado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <div className="flex-1 p-4 overflow-auto pb-20 md:pb-4">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={tab === 'usuarios' ? 'default' : 'outline'} 
            onClick={() => setTab('usuarios')}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </Button>
          <Button 
            variant={tab === 'productos' ? 'default' : 'outline'} 
            onClick={() => setTab('productos')}
            className="flex-1"
          >
            <Package className="w-4 h-4 mr-2" />
            Productos
          </Button>
        </div>

        {tab === 'usuarios' && (
          <>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="mb-4 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            )}
            {showForm && (
              <Card className="mb-4 animate-slide-up">
                <CardHeader className="pb-2">
                  <CardTitle>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder={editando ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <select
                    className="w-full p-2.5 border border-border rounded-lg bg-surface"
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'cajero' | 'admin' })}
                  >
                    <option value="cajero">Cajero</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={guardarUsuario} className="flex-1">
                      Guardar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowForm(false)
                        setEditando(null)
                        setFormData({ nombre: '', password: '', rol: 'cajero' })
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? <SkeletonList count={3} /> : (
              <div className="space-y-2">
                {usuarios.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border"
                  >
                    <div>
                      <div className="font-medium">{u.nombre}</div>
                      <Badge variant={u.rol === 'admin' ? 'warning' : 'neutral'} size="sm">
                        {u.rol === 'admin' ? 'Administrador' : 'Cajero'}
                      </Badge>
                    </div>
                    {user?.id !== u.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditando(u)
                            setFormData({ nombre: u.nombre, password: '', rol: u.rol })
                            setShowForm(true)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarUsuario(u.id)}
                          className="text-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'productos' && (
          <>
            {loading ? <SkeletonList count={4} /> : (
              <div className="space-y-2">
                {productos.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 bg-surface rounded-xl border transition-all ${
                      p.activo === 1 ? 'border-border' : 'border-danger/30 opacity-60'
                    }`}
                  >
                    {editProd?.id === p.id ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Nombre"
                          value={prodEditData.nombre}
                          onChange={(e) => setProdEditData({ ...prodEditData, nombre: e.target.value })}
                        />
                        <Input
                          type="number"
                          placeholder="Precio"
                          value={prodEditData.precio}
                          onChange={(e) => setProdEditData({ ...prodEditData, precio: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={guardarProducto}>
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditProd(null)
                              setProdEditData({ nombre: '', precio: '' })
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{p.nombre}</div>
                          <div className="text-xs text-muted">
                            {p.categoria_nombre} • ${p.precio.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditProd(p)
                              setProdEditData({ nombre: p.nombre, precio: p.precio.toString() })
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <button
                            onClick={() => toggleProducto(p)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              p.activo === 1 
                                ? 'bg-success/20 text-success' 
                                : 'bg-danger/20 text-danger'
                            }`}
                          >
                            {p.activo === 1 ? 'Activo' : 'Inactivo'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}