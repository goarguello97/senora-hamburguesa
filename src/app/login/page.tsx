'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
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

      toast.success('Bienvenido a Señora', {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white text-3xl font-bold mb-4 shadow-soft-lg">
            S
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text">Señora</h1>
          <p className="text-muted mt-1 font-medium">Hamburguesería</p>
        </div>

        {/* Login Form */}
        <div className="bg-surface rounded-3xl p-8 shadow-soft-md border border-border/40 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-semibold">Usuario</Label>
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
                className="h-12"
              />
              {errors.nombre && (
                <p className="text-xs text-danger font-medium" role="alert">{errors.nombre}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
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
                className="h-12"
              />
              {errors.password && (
                <p className="text-xs text-danger font-medium" role="alert">{errors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base shadow-soft" 
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
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted mt-8 relative z-10">
        Sistema de gestión · Señora Hamburguesería
      </p>
    </div>
  )
}