import { NextResponse } from 'next/server'
import { getData, getAll, groupByProduct, aggregateSum, countWhere } from '@/lib/db'

export async function GET() {
  try {
    getData()
    const today = new Date().toISOString().split('T')[0]

    const pedidos = getAll('pedidos') as Array<{
      id: number; metodo_pago: string; estado: string; total: number; created_at: string
    }>

    const todayOrders = pedidos.filter((p) => p.created_at.startsWith(today) && p.estado !== 'cancelado')

    const ingresosEfectivo = todayOrders.filter((p) => p.metodo_pago === 'efectivo').reduce((s, p) => s + p.total, 0)
    const ingresosTransferencia = todayOrders.filter((p) => p.metodo_pago === 'transferencia').reduce((s, p) => s + p.total, 0)

    const gastos = getAll('gastos') as Array<{ monto: number; fecha: string }>
    const gastosHoy = gastos.filter((g) => g.fecha === today).reduce((s, g) => s + g.monto, 0)

    const productosVendidos = groupByProduct()

    return NextResponse.json({
      ingresos_efectivo: ingresosEfectivo,
      ingresos_transferencia: ingresosTransferencia,
      total_gastos: gastosHoy,
      pedido_count: todayOrders.length,
      productos_vendidos: productosVendidos.slice(0, 5),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}