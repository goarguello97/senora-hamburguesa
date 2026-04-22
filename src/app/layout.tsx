import type { Metadata } from 'next'
import './globals.css'
import { getDbAsync } from '@/lib/db'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Señoría Hamburguesería',
  description: 'Sistema de pedidos y administración',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  getDbAsync()

  return (
    <html lang="es">
      <body>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}