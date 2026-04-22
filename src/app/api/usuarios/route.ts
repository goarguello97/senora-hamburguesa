import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getData, getAll, getOneById, runQuery, insertAndGetId, deleteByWhere } from '@/lib/db'
import { requireAdmin, requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()
    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string; password_hash?: string; rol: 'cajero' | 'admin' }>
    const safe = usuarios.map(({ password_hash, ...u }) => u)
    return NextResponse.json(safe)
  } catch (error) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const { nombre, password, rol } = body

    if (!nombre || !password || !rol) {
      return NextResponse.json({ error: 'Nombre, password y rol requeridos' }, { status: 400 })
    }

    if (rol !== 'admin' && rol !== 'cajero') {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    getData()
    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string }>
    if (usuarios.some((u) => u.nombre === nombre)) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const id = insertAndGetId('usuarios', { nombre, password_hash, rol })

    return NextResponse.json({ id, nombre, rol })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const { id, nombre, password, rol } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    getData()
    const usuario = getOneById('usuarios', id) as { id: number; nombre: string; password_hash: string; rol: string } | undefined
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (nombre) updates.nombre = nombre
    if (password) updates.password_hash = await bcrypt.hash(password, 10)
    if (rol && (rol === 'admin' || rol === 'cajero')) updates.rol = rol

    if (Object.keys(updates).length > 0) {
      runQuery('usuarios', updates, { id })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    if (id === session.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    getData()
    const usuario = getOneById('usuarios', id)
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    deleteByWhere('usuarios', { id })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}