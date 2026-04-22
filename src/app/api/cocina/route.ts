import { NextRequest, NextResponse } from 'next/server'
import { getData, getAll, runQuery, countWhere } from '@/lib/db'

export async function GET() {
  try {
    getData()

    const items = getAll('pedido_items') as Array<{
      id: number; pedido_id: number; producto_id: number; cantidad: number;
      toppings: string; aderezos: string; omitidos: string; estado_kds: string
    }>
    const productos = getAll('productos') as Array<{ id: number; nombre: string }>
    const pedidos = getAll('pedidos') as Array<{ id: number; estado: string; created_at: string }>

    const pending = items
      .filter((item) => item.estado_kds === 'pendiente' && !pedidos.find((p) => p.id === item.pedido_id)?.estado.includes('cancel'))
      .map((item) => {
        const producto = productos.find((p) => p.id === item.producto_id)
        const pedido = pedidos.find((p) => p.id === item.pedido_id)
        return {
          ...item,
          producto_nombre: producto?.nombre,
          pedido_fecha: pedido?.created_at,
        }
      })
      .sort((a, b) => new Date(a.pedido_fecha || 0).getTime() - new Date(b.pedido_fecha || 0).getTime())

    return NextResponse.json(pending)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    getData()
    const body = await request.json()
    const { item_id, estado } = body

    if (!item_id || !estado) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    if (estado === 'listo') {
      runQuery('pedido_items', { estado_kds: 'listo' }, { id: item_id })

      const items = getAll('pedido_items') as Array<{ id: number; pedido_id: number; estado_kds: string }>
      const item = items.find((i) => i.id === item_id)
      if (item) {
        const pendingCount = countWhere('pedido_items', 'estado_kds', 'pendiente') - items.filter((i) => i.id === item_id && i.estado_kds === 'pendiente').length

        const pedidoItems = items.filter((i) => i.pedido_id === item.pedido_id)
        if (pedidoItems.every((i) => i.estado_kds === 'listo')) {
          runQuery('pedidos', { estado: 'entregado', entregado_en: new Date().toISOString() }, { id: item.pedido_id })
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}