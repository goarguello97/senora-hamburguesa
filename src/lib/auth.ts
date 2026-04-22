import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.AUTH_SECRET || 'change-this-in-production'
)

export interface UserPayload extends JWTPayload {
  id: number
  nombre: string
  rol: 'cajero' | 'admin'
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as UserPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<UserPayload> {
  const session = await getSession()
  if (!session) throw new Error('No autenticado')
  return session
}

export async function requireAdmin(): Promise<UserPayload> {
  const session = await requireAuth()
  if (session.rol !== 'admin') throw new Error('Acceso denegado')
  return session
}