import { NextRequest, NextResponse } from 'next/server'
import { getData, getAll, insertAndGetId, aggregateSum, getAllFiltered } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    getData()
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const wantHistorial = searchParams.get('historial') === '1'

    const aperturas = getAll('caja_apertura') as Array<{ id: number; usuario_id: number; monto_inicial: number; created_at: string }>
    const arqueos = getAll('caja_arqueo') as Array<{ id: number; apertura_id: number; monto_final: number; created_at: string }>
    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string }>

    if (wantHistorial) {
      const history = aperturas.map((ap) => {
        const arqueo = arqueos.find((a) => a.apertura_id === ap.id)
        const usuario = usuarios.find((u) => u.id === ap.usuario_id)
        return {
          apertura_id: ap.id,
          monto_inicial: ap.monto_inicial,
          monto_final: arqueo?.monto_final || null,
          created_at: ap.created_at,
          usuario: usuario?.nombre,
          cerrada: !!arqueo,
        }
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
      return NextResponse.json({ historial: history })
    }

    let apertura = null
    let arqueo = null

    if (session) {
      const sortedAperturas = [...aperturas].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      if (sortedAperturas.length > 0) {
        apertura = sortedAperturas[0]
        const sortedArqueos = [...arqueos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        arqueo = sortedArqueos.find((a) => a.apertura_id === apertura!.id) || null
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const ingresosEfectivo = aggregateSum('pedidos', 'total', 'metodo_pago', 'efectivo')
    const ingresosTransferencia = aggregateSum('pedidos', 'total', 'metodo_pago', 'transferencia')

    const allPedidos = getAll('pedidos') as Array<{ id: number; metodo_pago: string; estado: string; total: number; created_at: string }>
    const efectivoHoy = allPedidos.filter((p) => p.metodo_pago === 'efectivo' && p.estado !== 'cancelado').reduce((s, p) => s + p.total, 0)
    const transferenciaHoy = allPedidos.filter((p) => p.metodo_pago === 'transferencia' && p.estado !== 'cancelado').reduce((s, p) => s + p.total, 0)

    return NextResponse.json({
      apertura,
      arqueo,
      ingresos_hoy: efectivoHoy,
      ingresos_transferencia: transferenciaHoy,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
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
    const { action, monto_inicial, monto_final } = body

    if (action === 'abrir') {
      if (!monto_inicial) {
        return NextResponse.json({ error: 'Monto inicial requerido' }, { status: 400 })
      }

      const aperturas = getAll('caja_apertura') as Array<{ id: number }>
      const arqueos = getAll('caja_arqueo') as Array<{ id: number; apertura_id: number }>
      const lastApertura = [...aperturas].sort((a, b) => b.id - a.id)[0]

      if (lastApertura && !arqueos.find((a) => a.apertura_id === lastApertura.id)) {
        return NextResponse.json({ error: 'Ya hay una caja abierta. Ciérrala primero.' }, { status: 400 })
      }

      const aperturaId = insertAndGetId('caja_apertura', {
        usuario_id: session.id,
        monto_inicial,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json({ ok: true, apertura_id: aperturaId })
    }

    if (action === 'cerrar') {
      const aperturas = getAll('caja_apertura') as Array<{ id: number }>
      const arqueos = getAll('caja_arqueo') as Array<{ id: number; apertura_id: number }>
      const lastApertura = [...aperturas].sort((a, b) => b.id - a.id)[0]

      if (!lastApertura) {
        return NextResponse.json({ error: 'No hay caja abierta' }, { status: 400 })
      }

      if (arqueos.find((a) => a.apertura_id === lastApertura.id)) {
        return NextResponse.json({ error: 'La caja ya está cerrada' }, { status: 400 })
      }

      if (!monto_final) {
        return NextResponse.json({ error: 'Monto final requerido' }, { status: 400 })
      }

      insertAndGetId('caja_arqueo', {
        apertura_id: lastApertura.id,
        monto_final,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}