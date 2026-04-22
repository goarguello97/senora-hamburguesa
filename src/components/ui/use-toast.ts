'use client'

import { toast as sonnerToast } from 'sonner'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  description?: string
}

function createToast(type: ToastType) {
  return (message: string, options?: ToastOptions) => {
    const { duration = 3000, description } = options || {}
    
    if (type === 'success') {
      sonnerToast.success(message, { description, duration })
    } else if (type === 'error') {
      sonnerToast.error(message, { description, duration })
    } else if (type === 'warning') {
      sonnerToast.warning(message, { description, duration })
    } else {
      sonnerToast.info(message, { description, duration })
    }
  }
}

export const useToast = {
  success: createToast('success'),
  error: createToast('error'),
  warning: createToast('warning'),
  info: createToast('info'),
  dismiss: (id?: string) => sonnerToast.dismiss(id),
  promise: sonnerToast.promise,
}

export { useToast as toast }