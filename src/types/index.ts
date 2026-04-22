export interface Categoria {
  id: number
  nombre: string
  orden: number
}

export interface Producto {
  id: number
  nombre: string
  precio: number
  categoria_id: number
  activo: number
}

export interface Modificador {
  id: number
  nombre: string
  tipo: 'topping' | 'aderezo'
}

export interface LomitoIngrediente {
  id: number
  nombre: string
  obligatorio: boolean
}

export interface Usuario {
  id: number
  nombre: string
  rol: 'cajero' | 'admin'
}

export interface Pedido {
  id: number
  estado: 'nuevo' | 'en_preparacion' | 'entregado' | 'cancelado'
  total: number
  metodo_pago: 'efectivo' | 'transferencia'
  cashier_id: number
  created_at: string
  entregado_en: string | null
}

export interface PedidoItem {
  id: number
  pedido_id: number
  producto_id: number
  cantidad: number
  toppings: string[]
  aderezos: string[]
  omitidos: string[]
  nota: string
  estado_kds: 'pendiente' | 'listo'
  producto_nombre?: string
  producto_precio?: number
}

export interface Pago {
  id: number
  pedido_id: number
  metodo: 'efectivo' | 'transferencia'
  monto: number
}

export interface CajaApertura {
  id: number
  usuario_id: number
  monto_inicial: number
  created_at: string
}

export interface CajaArqueo {
  id: number
  apertura_id: number
  monto_final: number
  created_at: string
}

export interface Gasto {
  id: number
  descripcion: string
  monto: number
  categoria: string
  fecha: string
  usuario_id: number
}

export type CategoriaGasto = 'Insumos' | 'Materia prima' | 'Limpieza' | 'Servicios' | 'Otros'

export interface CartItem {
  producto_id: number
  producto_nombre: string
  producto_precio: number
  cantidad: number
  toppings: string[]
  aderezos: string[]
  omitidos: string[]
  nota: string
}