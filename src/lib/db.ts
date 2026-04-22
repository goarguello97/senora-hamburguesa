import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

interface DbData {
  categorias: Array<{ id: number; nombre: string; orden: number }>
  productos: Array<{ id: number; nombre: string; precio: number; categoria_id: number; activo: number }>
  modificadores: Array<{ id: number; nombre: string; tipo: 'topping' | 'aderezo' }>
  producto_modificador: Array<{ producto_id: number; modificador_id: number }>
  lomito_ingredientes: Array<{ id: number; nombre: string; obligatorio: number }>
  usuarios: Array<{ id: number; nombre: string; password_hash: string; rol: 'cajero' | 'admin' }>
  caja_apertura: Array<{ id: number; usuario_id: number; monto_inicial: number; created_at: string }>
  caja_arqueo: Array<{ id: number; apertura_id: number; monto_final: number; created_at: string }>
  pedidos: Array<{ id: number; estado: string; total: number; metodo_pago: string; cashier_id: number; created_at: string; entregado_en: string }>
  pedido_items: Array<{ id: number; pedido_id: number; producto_id: number; cantidad: number; toppings: string; aderezos: string; omitidos: string; nota: string; estado_kds: string }>
  gastos: Array<{ id: number; descripcion: string; monto: number; categoria: string; fecha: string; usuario_id: number }>
  _nextId: Record<string, number>
}

let data: DbData | null = null

function createEmpty(): DbData {
  return {
    categorias: [],
    productos: [],
    modificadores: [],
    producto_modificador: [],
    lomito_ingredientes: [],
    usuarios: [],
    caja_apertura: [],
    caja_arqueo: [],
    pedidos: [],
    pedido_items: [],
    gastos: [],
    _nextId: {
      categorias: 1, productos: 1, modificadores: 1,
      lomito_ingredientes: 1, caja_apertura: 1, caja_arqueo: 1,
      pedidos: 1, pedido_items: 1, gastos: 1, usuarios: 1
    }
  }
}

export function getData(): DbData {
  if (data) return data

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    data = JSON.parse(raw)
    return data!
  }

  data = createEmpty()
  seedData(data)
  saveData()
  return data
}

function saveData(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function nextId(table: keyof DbData['_nextId']): number {
  const d = getData()
  return d._nextId[table]++
}

function seedData(d: DbData): void {
  d.categorias = [
    { id: 1, nombre: 'Hamburguesas', orden: 1 },
    { id: 2, nombre: 'Lomitos', orden: 2 },
    { id: 3, nombre: 'Pizzas', orden: 3 },
  ]

  d.productos = [
    { id: 1, nombre: 'Simple', precio: 8500, categoria_id: 1, activo: 1 },
    { id: 2, nombre: 'Doble', precio: 10000, categoria_id: 1, activo: 1 },
    { id: 3, nombre: 'Triple', precio: 11500, categoria_id: 1, activo: 1 },
    { id: 4, nombre: 'Lomito x1', precio: 10000, categoria_id: 2, activo: 1 },
    { id: 5, nombre: 'Lomito x2', precio: 19000, categoria_id: 2, activo: 1 },
    { id: 6, nombre: 'Muzzarela', precio: 10000, categoria_id: 3, activo: 1 },
    { id: 7, nombre: 'Especial', precio: 12000, categoria_id: 3, activo: 1 },
    { id: 8, nombre: 'Fugazzeta', precio: 12000, categoria_id: 3, activo: 1 },
    { id: 9, nombre: 'Argentina', precio: 15000, categoria_id: 3, activo: 1 },
  ]

  const toppings = [
    'Queso cheddar', 'Queso dambo', 'Lechuga', 'Tomate', 'Panceta',
    'Cebolla caramelizada', 'Cebolla morada', 'Pepinos', 'Champiñones', 'Pimientos asados', 'Huevo frito'
  ]
  const aderezos = ['Mayonesa', 'Mostaza', 'Ketchup', 'Relish', 'BBQ', 'Tasty', 'Mayo picante', 'Especial']

  let mid = 1
  for (const t of toppings) {
    d.modificadores.push({ id: mid++, nombre: t, tipo: 'topping' })
  }
  for (const a of aderezos) {
    d.modificadores.push({ id: mid++, nombre: a, tipo: 'aderezo' })
  }

  for (let p = 1; p <= 4; p++) {
    for (let m = 1; m <= 19; m++) {
      d.producto_modificador.push({ producto_id: p, modificador_id: m })
    }
  }

  d.lomito_ingredientes = [
    { id: 1, nombre: 'Lechuga', obligatorio: 0 },
    { id: 2, nombre: 'Tomate', obligatorio: 0 },
    { id: 3, nombre: 'Bife de lomo', obligatorio: 1 },
    { id: 4, nombre: 'Jamón cocido', obligatorio: 0 },
    { id: 5, nombre: 'Queso dambo', obligatorio: 0 },
    { id: 6, nombre: 'Huevo frito', obligatorio: 0 },
    { id: 7, nombre: 'Mayonesa de la casa', obligatorio: 0 },
  ]

  d.usuarios = [
    { id: 1, nombre: 'Benjamin', password_hash: bcrypt.hashSync('benjamin123', 10), rol: 'cajero' },
    { id: 2, nombre: 'Gonzalo', password_hash: bcrypt.hashSync('gonzalo123', 10), rol: 'admin' },
  ]

  d._nextId.productos = 10
  d._nextId.modificadores = mid
  d._nextId.lomito_ingredientes = 8
  d._nextId.usuarios = 3
}

export function getDbAsync() {
  getData()
}

export function getAll(table: keyof Omit<DbData, '_nextId'>): Record<string, unknown>[] {
  const d = getData()
  return d[table] as unknown as Record<string, unknown>[]
}

export function getOneById(table: keyof Omit<DbData, '_nextId'>, id: number): Record<string, unknown> | undefined {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>
  return rows.find((r) => r.id === id)
}

export function getAllFiltered(table: keyof Omit<DbData, '_nextId'>, field: string, value: unknown): Record<string, unknown>[] {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>
  return rows.filter((r) => r[field] === value)
}

export function getOneByWhere(table: keyof Omit<DbData, '_nextId'>, where: string, params: unknown[]): Record<string, unknown> | undefined {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>

  const conditions = where.split(',').map((c) => c.trim())
  return rows.find((r) => {
    return conditions.every((_, i) => {
      const [f, op] = where.split(',')[i].split('=')
      if (op === undefined) return !!r[f]
      return r[f] === params[i]
    })
  })
}

export function insertAndGetId(table: keyof Omit<DbData, '_nextId'>, row: Record<string, unknown>): number {
  const d = getData()
  const id = nextId(table as keyof DbData['_nextId'])
  ;(d[table] as unknown as Array<Record<string, unknown>>).push({ ...row, id })
  saveData()
  return id
}

export function runQuery(table: keyof Omit<DbData, '_nextId'>, updates: Record<string, unknown>, where: Record<string, unknown>): void {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>
  const idx = rows.findIndex((r) => Object.keys(where).every((k) => r[k] === where[k]))
  if (idx !== -1) {
    rows[idx] = { ...rows[idx], ...updates }
    saveData()
  }
}

export function deleteByWhere(table: keyof Omit<DbData, '_nextId'>, where: Record<string, unknown>): void {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>
  const filtered = rows.filter((r) => !Object.keys(where).every((k) => r[k] === where[k]))
  ;(d[table] as unknown as Array<Record<string, unknown>>) = filtered
  saveData()
}

export function aggregateSum(table: keyof Omit<DbData, '_nextId'>, field: string, whereField: string, whereValue: unknown): number {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>
  const filtered = whereField && whereValue !== undefined
    ? rows.filter((r) => r[whereField] === whereValue)
    : rows
  return filtered.reduce((sum, r) => sum + ((r[field] as number) || 0), 0)
}

export function countWhere(table: keyof Omit<DbData, '_nextId'>, whereField: string, whereValue: unknown): number {
  const d = getData()
  const rows = d[table] as unknown as Array<Record<string, unknown>>
  return rows.filter((r) => r[whereField] === whereValue).length
}

export function groupByProduct(): Array<{ nombre: string; cantidad: number; total: number }> {
  const d = getData()
  const activePedidos = d.pedidos.filter((p) => p.estado !== 'cancelado')
  const productMap: Record<number, { nombre: string; cantidad: number; total: number }> = {}

  for (const item of d.pedido_items) {
    const pedido = d.pedidos.find((p) => p.id === item.pedido_id)
    if (!pedido || pedido.estado === 'cancelado') continue

    const producto = d.productos.find((p) => p.id === item.producto_id)
    if (!producto) continue

    if (!productMap[producto.id]) {
      productMap[producto.id] = { nombre: producto.nombre, cantidad: 0, total: 0 }
    }
    productMap[producto.id].cantidad += item.cantidad
    productMap[producto.id].total += item.cantidad * producto.precio
  }

  return Object.values(productMap).sort((a, b) => b.cantidad - a.cantidad)
}