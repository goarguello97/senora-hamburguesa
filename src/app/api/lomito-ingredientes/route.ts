import { NextResponse } from 'next/server'
import { getData, getAll } from '@/lib/db'

export async function GET() {
  try {
    getData()
    const ingredientes = getAll('lomito_ingredientes') as Array<{ id: number; nombre: string; obligatorio: number }>
    return NextResponse.json(ingredientes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}