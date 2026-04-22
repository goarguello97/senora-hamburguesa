import { NextRequest, NextResponse } from 'next/server'
import { getData, getAll, getOneById, runQuery } from '@/lib/db'
import { requireAdmin, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    getData()
    const { searchParams } = new URL(request.url)
    const categoria_id = searchParams.get('categoria_id')
    const all = searchParams.get('all')

    let productos = getAll('productos') as Array<{ id: number; nombre: string; precio: number; categoria_id: number; activo: number }>
    if (all !== '1') {
      if (categoria_id) {
        productos = productos.filter((p) => p.categoria_id === parseInt(categoria_id) && p.activo === 1)
      } else {
        productos = productos.filter((p) => p.activo === 1)
      }
    }

    const mods = getAll('modificadores') as Array<{ id: number; nombre: string; tipo: string }>
    const pmods = getAll('producto_modificador') as Array<{ producto_id: number; modificador_id: number }>

    const productosWithMods = productos.map((p) => {
      const modIds = pmods.filter((pm) => pm.producto_id === p.id).map((pm) => pm.modificador_id)
      const prodMods = mods.filter((m) => modIds.includes(m.id))

      const toppings = prodMods.filter((m) => m.tipo === 'topping')
      const aderezos = prodMods.filter((m) => m.tipo === 'aderezo')

      return { ...p, toppings, aderezos }
    })

    return NextResponse.json(productosWithMods)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, nombre, precio, activo } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    getData()
    const producto = getOneById('productos', id) as { id: number; nombre: string; precio: number; activo: number } | undefined
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (nombre) updates.nombre = nombre
    if (precio !== undefined) updates.precio = precio
    if (activo !== undefined) updates.activo = activo

    if (Object.keys(updates).length > 0) {
      runQuery('productos', updates, { id })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Update producto error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}