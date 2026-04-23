import { NextRequest, NextResponse } from 'next/server'
import { getData, getAll, groupByProduct, aggregateSum, countWhere } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    getData()
    const { searchParams } = new URL(request.url)
    const fechaParam = searchParams.get('fecha')
    const fecha = fechaParam || new Date().toISOString().split('T')[0]

    const pedidos = getAll('pedidos') as Array<{
      id: number; metodo_pago: string; estado: string; total: number; created_at: string; cliente: string; cashier_id: number
    }>
    const items = getAll('pedido_items') as Array<{
      id: number; pedido_id: number; producto_id: number; cantidad: number; toppings: string; aderezos: string; omitidos: string; nota: string
    }>
    const productos = getAll('productos') as Array<{ id: number; nombre: string }>
    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string }>

    const pedidosDelDia = pedidos.filter((p) => p.created_at.startsWith(fecha) && p.estado !== 'cancelado')
    const pedidoIds = pedidosDelDia.map((p) => p.id)

    const ingresosEfectivo = pedidosDelDia.filter((p) => p.metodo_pago === 'efectivo').reduce((s, p) => s + p.total, 0)
    const ingresosTransferencia = pedidosDelDia.filter((p) => p.metodo_pago === 'transferencia').reduce((s, p) => s + p.total, 0)

    const gastos = getAll('gastos') as Array<{ monto: number; fecha: string }>
    const gastosDelDia = gastos.filter((g) => g.fecha === fecha).reduce((s, g) => s + g.monto, 0)

    const pedidosDetallados = pedidosDelDia.map((pedido) => {
      const cashier = usuarios.find((u) => u.id === pedido.cashier_id)
      const pedidoItems = items.filter((i) => i.pedido_id === pedido.id).map((item) => {
        const producto = productos.find((p) => p.id === item.producto_id)
        return {
          id: item.id,
          producto_nombre: producto?.nombre,
          cantidad: item.cantidad,
          toppings: JSON.parse(item.toppings || '[]'),
          aderezos: JSON.parse(item.aderezos || '[]'),
          omitidos: JSON.parse(item.omitidos || '[]'),
          nota: item.nota,
        }
      })
      return {
        id: pedido.id,
        cliente: pedido.cliente,
        metodo_pago: pedido.metodo_pago,
        total: pedido.total,
        cashier_nombre: cashier?.nombre,
        items: pedidoItems,
      }
    })

    const productosVendidos = groupByProduct()
      .filter((p) => {
        const pedido = pedidos.find((x) => pedidosDetallados.some((pd) => pd.id === x.id))
        return true
      })

    return NextResponse.json({
      fecha,
      ingresos_efectivo: ingresosEfectivo,
      ingresos_transferencia: ingresosTransferencia,
      ingreso_total: ingresosEfectivo + ingresosTransferencia,
      total_gastos: gastosDelDia,
      pedido_count: pedidosDelDia.length,
      pedidos: pedidosDetallados,
      productos_vendidos: productosVendidos.slice(0, 5),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}