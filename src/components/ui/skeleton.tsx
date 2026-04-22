import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-primary-100',
          variant === 'circle' && 'rounded-full',
          variant === 'text' && 'h-4 w-20 rounded',
          variant === 'default' && 'rounded-lg',
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton variant="text" className="w-16" />
        <Skeleton variant="text" className="w-20" />
      </div>
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function SkeletonInput() {
  return (
    <div className="space-y-2">
      <Skeleton variant="text" className="w-16 h-4" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonInput }