import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getData, insertAndGetId, getAll } from '@/lib/db'
import { createToken, type UserPayload } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    getData()

    const body = await request.json()
    const { nombre, password } = body

    if (!nombre || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
    }

    const usuarios = getAll('usuarios') as Array<{ id: number; nombre: string; password_hash: string; rol: 'cajero' | 'admin' }>
    const user = usuarios.find((u) => u.nombre === nombre)

    if (!user) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    const payload: UserPayload = { id: user.id, nombre: user.nombre, rol: user.rol }
    const token = await createToken(payload)

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return NextResponse.json({ ok: true, user: payload })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}