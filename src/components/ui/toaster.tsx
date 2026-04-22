'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toast]:m-0 group-[.toast]:bg-surface group-[.toast]:text-text group-[.toast]:shadow-lg group-[.toast]:border group-[.toast]:border-border rounded-xl',
          description: 'group-[.toast]:text-muted text-sm',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-white rounded-lg',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-text rounded-lg',
          title: 'font-medium text-sm',
          success: 'border-l-4 border-l-success',
          error: 'border-l-4 border-l-danger',
          warning: 'border-l-4 border-l-warning',
          info: 'border-l-4 border-l-primary',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }