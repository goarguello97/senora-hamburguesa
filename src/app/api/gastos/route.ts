import { NextRequest, NextResponse } from 'next/server'
import { getData, getAll, insertAndGetId, runQuery, deleteByWhere } from '@/lib/db'
import { getSession, requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    getData()
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const weekStart = startOfWeek.toISOString().split('T')[0]

    const gastos = getAll('gastos') as Array<{
      id: number; descripcion: string; monto: number;
      categoria: string; fecha: string; usuario_id: number
    }>
    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string }>

    const gastosConUsuario = gastos.map((g) => ({
      ...g,
      usuario_nombre: usuarios.find((u) => u.id === g.usuario_id)?.nombre,
    })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    const totalHoy = gastos.filter((g) => g.fecha === today).reduce((s, g) => s + g.monto, 0)
    const totalSemana = gastos.filter((g) => g.fecha >= weekStart).reduce((s, g) => s + g.monto, 0)

    return NextResponse.json({
      gastos: gastosConUsuario,
      totales: { hoy: totalHoy, semana: totalSemana },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    getData()
    const session = await requireAdmin()

    const body = await request.json()
    const { descripcion, monto, categoria, fecha } = body

    if (!descripcion || !monto || !categoria) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const fechaGasto = fecha || new Date().toISOString().split('T')[0]

    insertAndGetId('gastos', {
      descripcion,
      monto,
      categoria,
      fecha: fechaGasto,
      usuario_id: session.id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    getData()
    await requireAdmin()

    const body = await request.json()
    const { gasto_id, descripcion, monto, categoria } = body

    if (!gasto_id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    if (descripcion && monto && categoria) {
      runQuery('gastos', { descripcion, monto, categoria }, { id: gasto_id })
    } else {
      deleteByWhere('gastos', { id: gasto_id })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}