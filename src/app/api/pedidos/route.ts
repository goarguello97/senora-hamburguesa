import { NextRequest, NextResponse } from 'next/server'
import { getData, getAll, insertAndGetId, runQuery } from '@/lib/db'
import { getSession } from '@/lib/auth'

function hayCajaAbierta(): boolean {
  const aperturas = getAll('caja_apertura') as Array<{ id: number }>
  const arqueos = getAll('caja_arqueo') as Array<{ id: number; apertura_id: number }>
  if (aperturas.length === 0) return false
  const lastApertura = [...aperturas].sort((a, b) => b.id - a.id)[0]
  return !arqueos.find((a) => a.apertura_id === lastApertura.id)
}

export async function GET() {
  try {
    getData()
    const pedidos = getAll('pedidos') as Array<{ id: number; estado: string; total: number; metodo_pago: string; cashier_id: number; created_at: string; entregado_en: string; cliente: string }>
    const items = getAll('pedido_items') as Array<{ id: number; pedido_id: number; producto_id: number; cantidad: number; toppings: string; aderezos: string; omitidos: string; nota: string; estado_kds: string }>
    const productos = getAll('productos') as Array<{ id: number; nombre: string; precio: number }>
    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string }>

    const sortedPedidos = [...pedidos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)

    const pedidosConItems = sortedPedidos.map((pedido) => {
      const cashier = usuarios.find((u) => u.id === pedido.cashier_id)
      const pedidoItems = items.filter((i) => i.pedido_id === pedido.id).map((item) => {
        const producto = productos.find((p) => p.id === item.producto_id)
        return { ...item, producto_nombre: producto?.nombre }
      })
      return { ...pedido, cashier_nombre: cashier?.nombre, items: pedidoItems }
    })

    return NextResponse.json(pedidosConItems)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function HEAD() {
  try {
    getData()
    const abierta = hayCajaAbierta()
    return NextResponse.json({ caja_abierta: abierta })
  } catch (error) {
    return NextResponse.json({ caja_abierta: false })
  }
}

export async function POST(request: NextRequest) {
  try {
    getData()
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { items, metodo_pago, cliente } = body

    if (!hayCajaAbierta()) {
      return NextResponse.json({ error: 'Caja cerrada. Abri la caja para tomar pedidos.' }, { status: 403 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Pedido vacío' }, { status: 400 })
    }

    const total = items.reduce(
      (sum: number, item: { producto_precio: number; cantidad: number }) =>
        sum + item.producto_precio * item.cantidad,
      0
    )

    const now = new Date().toISOString()
    const pedidoId = insertAndGetId('pedidos', {
      estado: 'nuevo',
      total,
      metodo_pago,
      cashier_id: session.id,
      created_at: now,
      entregado_en: '',
      cliente: cliente || '',
    })

    for (const item of items) {
      insertAndGetId('pedido_items', {
        pedido_id: pedidoId,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        toppings: JSON.stringify(item.toppings || []),
        aderezos: JSON.stringify(item.aderezos || []),
        omitidos: JSON.stringify(item.omitidos || []),
        nota: item.nota || '',
        estado_kds: 'pendiente',
      })
    }

    return NextResponse.json({ ok: true, pedido_id: pedidoId, total })
  } catch (error) {
    console.error('Create pedido error:', error)
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}