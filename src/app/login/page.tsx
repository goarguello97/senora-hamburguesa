'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkeletonInput } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ nombre?: string; password?: string }>({})

  function validateForm() {
    const newErrors: { nombre?: string; password?: string } = {}
    
    if (!nombre.trim()) {
      newErrors.nombre = 'Ingresa tu usuario'
    } else if (nombre.length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres'
    }
    
    if (!password) {
      newErrors.password = 'Ingresa tu contraseña'
    } else if (password.length < 4) {
      newErrors.password = 'Mínimo 4 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Corregí los errores antes de continuar')
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al iniciar sesión', {
          description: 'Verificá tus credenciales e intentá de nuevo',
        })
        return
      }

      toast.success('Bienvenido a Señoría', {
        description: `Hola, ${data.nombre || nombre}!`,
      })
      
      router.push('/pedidos')
      router.refresh()
    } catch (err) {
      toast.error('Error de conexión', {
        description: 'Intentá de nuevo en unos segundos',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl text-primary font-bold">Señoría</CardTitle>
          <p className="text-sm text-muted">Hamburguesería</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Usuario</Label>
              <Input
                id="nombre"
                name="nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  if (errors.nombre) {
                    setErrors(prev => ({ ...prev, nombre: undefined }))
                  }
                }}
                onBlur={() => {
                  if (nombre && nombre.length < 3) {
                    setErrors(prev => ({ ...prev, nombre: 'Mínimo 3 caracteres' }))
                  }
                }}
                placeholder="Tu usuario"
                autoComplete="username"
                disabled={loading}
              />
              {errors.nombre && (
                <p className="text-xs text-danger" role="alert">{errors.nombre}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }
                }}
                onBlur={() => {
                  if (password && password.length < 4) {
                    setErrors(prev => ({ ...prev, password: 'Mínimo 4 caracteres' }))
                  }
                }}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-danger" role="alert">{errors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}