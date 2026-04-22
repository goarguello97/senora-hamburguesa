import { NextResponse } from 'next/server'
import { getData, getAll } from '@/lib/db'

export async function GET() {
  try {
    getData()
    const categorias = getAll('categorias') as Array<{ id: number; nombre: string; orden: number }>
    const sorted = [...categorias].sort((a, b) => a.orden - b.orden)
    return NextResponse.json(sorted)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}