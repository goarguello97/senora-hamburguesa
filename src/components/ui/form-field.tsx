'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input, type InputProps } from './input'
import { Label } from './label'

export interface FormFieldProps extends Omit<InputProps, 'onChange'> {
  label: string
  error?: string
  hint?: string
  onChange?: (value: string) => void
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, hint, onChange, id, ...props }, ref) => {
    const [touched, setTouched] = React.useState(false)
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className={error ? 'text-danger' : ''}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            error && 'border-danger focus-visible:ring-danger',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          onBlur={() => setTouched(true)}
          onChange={handleChange}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && touched && (
          <p id={errorId} className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export { FormField }