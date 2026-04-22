'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BottomNav } from '@/components/bottom-nav'
import { Skeleton, SkeletonInput } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useUser } from '@/components/navbar'
import { Check, Plus, Minus, X } from 'lucide-react'

interface Categoria {
  id: number
  nombre: string
  orden: number
}

interface Modificador {
  id: number
  nombre: string
  tipo: string
}

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria_id: number
  toppings: Modificador[]
  aderezos: Modificador[]
}

interface LomitoIngrediente {
  id: number
  nombre: string
  obligatorio: boolean
}

interface CartItem {
  uniqueId: string
  producto_id: number
  producto_nombre: string
  producto_precio: number
  cantidad: number
  toppings: string[]
  aderezos: string[]
  omitidos: string[]
  nota: string
}

export default function PedidosPage() {
  const { user } = useUser()
  const router = useRouter()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [lomitoIngredientes, setLomitoIngredientes] = useState<LomitoIngrediente[]>([])
  const [catActiva, setCatActiva] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [lomitoSeleccionado, setLomitoSeleccionado] = useState<string | null>(null)
  const [editandoItem, setEditandoItem] = useState<CartItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [seleccionarToppings, setSeleccionarToppings] = useState<string[]>([])
  const [seleccionarAderezos, setSeleccionarAderezos] = useState<string[]>([])
  const [omitirIngredientes, setOmitirIngredientes] = useState<string[]>([])
  const [notaItem, setNotaItem] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/categorias').then((r) => r.json()),
      fetch('/api/productos').then((r) => r.json()),
      fetch('/api/lomito-ingredientes').then((r) => r.json()),
    ])
      .then(([cats, prods, loms]) => {
        setCategorias(cats)
        setProductos(prods)
        setLomitoIngredientes(loms)
        if (cats.length > 0) setCatActiva(cats[0].id)
      })
      .catch(() => {
        toast.error('Error al cargar datos')
      })
      .finally(() => {
        setInitialLoading(false)
      })
  }, [])

  function agregarAlCarrito() {
    if (!productoSeleccionado && !lomitoSeleccionado) return

    const esLomito = lomitoSeleccionado?.startsWith('Lomito')
    const item: CartItem = {
      uniqueId: Date.now().toString() + Math.random(),
      producto_id: esLomito ? (lomitoSeleccionado === 'Lomito x2' ? 5 : 4) : productoSeleccionado!.id,
      producto_nombre: esLomito ? lomitoSeleccionado! : productoSeleccionado!.nombre,
      producto_precio: esLomito ? (lomitoSeleccionado === 'Lomito x2' ? 19000 : 10000) : productoSeleccionado!.precio,
      cantidad: 1,
      toppings: esLomito ? [] : seleccionarToppings,
      aderezos: esLomito ? [] : seleccionarAderezos,
      omitidos: esLomito ? omitirIngredientes : [],
      nota: esLomito ? '' : notaItem,
    }

    if (editandoItem) {
      setCart(cart.map((c) => (c.uniqueId === editandoItem.uniqueId ? item : c)))
      setEditandoItem(null)
    } else {
      setCart([...cart, item])
    }

    resetSelectors()
    toast.success('Item agregado al pedido')
  }

  function resetSelectors() {
    setProductoSeleccionado(null)
    setLomitoSeleccionado(null)
    setSeleccionarToppings([])
    setSeleccionarAderezos([])
    setOmitirIngredientes([])
    setNotaItem('')
  }

  function actualizarCantidad(uniqueId: string, delta: number) {
    setCart(
      cart.map((item) => {
        if (item.uniqueId === uniqueId) {
          const nuevaCant = Math.max(1, item.cantidad + delta)
          return { ...item, cantidad: nuevaCant }
        }
        return item
      })
    )
  }

  function eliminarItem(uniqueId: string) {
    setCart(cart.filter((item) => item.uniqueId !== uniqueId))
    toast.info('Item removido del pedido')
  }

  function editarItem(item: CartItem) {
    if (item.producto_nombre.startsWith('Lomito')) {
      setLomitoSeleccionado(item.producto_nombre)
      setOmitirIngredientes(item.omitidos)
    } else {
      setProductoSeleccionado(
        productos.find((p) => p.id === item.producto_id) || null
      )
      setSeleccionarToppings(item.toppings)
      setSeleccionarAderezos(item.aderezos)
      setNotaItem(item.nota)
    }
    setEditandoItem(item)
  }

  function toggleTopping(t: string) {
    setSeleccionarToppings((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  function toggleAderezo(a: string) {
    setSeleccionarAderezos((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  function toggleOmitir(i: string) {
    setOmitirIngredientes((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  async function cerrarPedido(metodo: string) {
    if (cart.length === 0) return
    setLoading(true)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, metodo_pago: metodo }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Pedido creado!', {
          description: `Número de pedido: #${data.id || '...'} | Total: $${total.toLocaleString()}`,
        })
        setCart([])
        setTimeout(() => {
          router.push('/pedidos')
        }, 1500)
      } else {
        const data = await res.json()
        toast.error('Error al crear pedido', {
          description: data.error || 'Intentá de nuevo',
        })
      }
    } catch (err) {
      toast.error('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.producto_precio * item.cantidad, 0)
  const productosDeCategoria = productos.filter((p) => p.categoria_id === catActiva)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <BottomNav user={user} />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav user={user} />
      <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4 pb-24 md:pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCatActiva(cat.id)
                resetSelectors()
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                catActiva === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-muted'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {catActiva === 1 && (
            <>
              {productosDeCategoria.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProductoSeleccionado(p)
                    setLomitoSeleccionado(null)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    productoSeleccionado?.id === p.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-surface hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-primary font-bold">${p.precio.toLocaleString()}</div>
                </button>
              ))}
            </>
          )}

          {catActiva === 2 && (
            <>
              {[4, 5].map((pId) => {
                const p = productos.find((x) => x.id === pId)
                if (!p) return null
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setLomitoSeleccionado(p.nombre)
                      setProductoSeleccionado(null)
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      lomitoSeleccionado === p.nombre
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-surface hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-primary font-bold">${p.precio.toLocaleString()}</div>
                  </button>
                )
              })}
            </>
          )}

          {catActiva === 3 && (
            <>
              {productosDeCategoria.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const item: CartItem = {
                      uniqueId: Date.now().toString() + Math.random(),
                      producto_id: p.id,
                      producto_nombre: p.nombre,
                      producto_precio: p.precio,
                      cantidad: 1,
                      toppings: [],
                      aderezos: [],
                      omitidos: [],
                      nota: '',
                    }
                    setCart([...cart, item])
                    toast.success(`${p.nombre} agregado`)
                  }}
                  className="p-3 rounded-xl border border-border bg-surface hover:border-primary/50 text-left transition-all"
                >
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-primary font-bold">${p.precio.toLocaleString()}</div>
                </button>
              ))}
            </>
          )}
        </div>

        {(productoSeleccionado || lomitoSeleccionado) && (
          <Card className="mt-4 animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {productoSeleccionado?.nombre || lomitoSeleccionado}
                {(productoSeleccionado || lomitoSeleccionado) && (
                  <span className="ml-2 text-primary font-bold">
                    ${(productoSeleccionado?.precio || (lomitoSeleccionado === 'Lomito x2' ? 19000 : 10000)).toLocaleString()}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productoSeleccionado && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Toppings</p>
                    <div className="flex flex-wrap gap-2">
                      {productoSeleccionado.toppings.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => toggleTopping(t.nombre)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            seleccionarToppings.includes(t.nombre)
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'border-border text-muted hover:border-primary/50'
                          }`}
                        >
                          {seleccionarToppings.includes(t.nombre) && <Check className="w-3 h-3 inline mr-1" />}
                          {t.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Aderezos</p>
                    <div className="flex flex-wrap gap-2">
                      {productoSeleccionado.aderezos.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => toggleAderezo(a.nombre)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            seleccionarAderezos.includes(a.nombre)
                              ? 'bg-secondary text-white border-secondary shadow-sm'
                              : 'border-border text-muted hover:border-secondary/50'
                          }`}
                        >
                          {seleccionarAderezos.includes(a.nombre) && <Check className="w-3 h-3 inline mr-1" />}
                          {a.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Input
                      placeholder="Nota especial (opcional)"
                      value={notaItem}
                      onChange={(e) => setNotaItem(e.target.value)}
                    />
                  </div>
                </>
              )}

              {lomitoSeleccionado && (
                <div>
                  <p className="text-sm font-medium mb-2">Omitir ingredientes</p>
                  <div className="flex flex-wrap gap-2">
                    {lomitoIngredientes.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => toggleOmitir(ing.nombre)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          omitirIngredientes.includes(ing.nombre)
                            ? 'bg-danger text-white border-danger shadow-sm'
                            : 'border-border text-muted hover:border-danger/50'
                        }`}
                      >
                        {omitirIngredientes.includes(ing.nombre) && <Check className="w-3 h-3 inline mr-1" />}
                        {ing.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={agregarAlCarrito} className="flex-1">
                  {editandoItem ? 'Actualizar' : 'Agregar al pedido'}
                </Button>
                <Button onClick={resetSelectors} variant="outline">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {cart.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Pedido actual</CardTitle>
                <span className="text-lg font-bold text-primary">${total.toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.uniqueId}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary-50"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => editarItem(item)}
                  >
                    <div className="font-medium">
                      {item.cantidad > 1 && `${item.cantidad}x `}
                      {item.producto_nombre}
                    </div>
                    {item.toppings.length > 0 && (
                      <div className="text-xs text-muted">
                        + {item.toppings.join(', ')}
                      </div>
                    )}
                    {item.aderezos.length > 0 && (
                      <div className="text-xs text-muted">
                        Aderezos: {item.aderezos.join(', ')}
                      </div>
                    )}
                    {item.omitidos.length > 0 && (
                      <div className="text-xs text-danger font-medium">
                        Sin: {item.omitidos.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => actualizarCantidad(item.uniqueId, -1)}
                      className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.uniqueId, 1)}
                      className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarItem(item.uniqueId)}
                      className="w-8 h-8 rounded-lg bg-danger text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {cart.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-surface border-t border-border md:bottom-0">
            <div className="flex gap-2">
              <Button
                onClick={() => cerrarPedido('efectivo')}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Procesando...' : 'Efectivo'}
              </Button>
              <Button
                onClick={() => cerrarPedido('transferencia')}
                disabled={loading}
                variant="secondary"
                className="flex-1"
              >
                Transferencia
              </Button>
            </div>
          </div>
        )}

        <div className="h-20 md:h-4"></div>
      </div>
    </div>
  )
}