import React from 'react'
import { cn } from '../../../utils/cn'

interface AdminCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered' | 'elevated'
  hover?: boolean
}

/**
 * AdminCard Component
 * 
 * Consistent card component used across admin interface
 * Extends the main app's card styling with admin-specific variations
 */
export const AdminCard: React.FC<AdminCardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
  hover = false
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md'
  }

  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : ''

  return (
    <div
      className={cn(
        'rounded-lg',
        paddingClasses[padding],
        variantClasses[variant],
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

interface AdminCardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

/**
 * AdminCardHeader Component
 * 
 * Consistent header for admin cards
 */
export const AdminCardHeader: React.FC<AdminCardHeaderProps> = ({
  title,
  subtitle,
  action,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface AdminCardContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * AdminCardContent Component
 * 
 * Consistent content area for admin cards
 */
export const AdminCardContent: React.FC<AdminCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('text-gray-700', className)}>
      {children}
    </div>
  )
}

interface AdminCardFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * AdminCardFooter Component
 * 
 * Consistent footer for admin cards
 */
export const AdminCardFooter: React.FC<AdminCardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}
