import React from 'react'
import { cn } from '../../../utils/cn'

interface AdminButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

/**
 * AdminButton Component
 * 
 * Reuses military button styling from public app
 * Eliminates admin-specific button divergence
 */
export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button'
}) => {
  const baseClasses = 'military-button transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: '',  // Uses default military-button styling
    secondary: 'military-button--secondary',
    danger: 'military-button--danger',
    ghost: 'military-button--ghost'
  }
  
  const sizeClasses = {
    sm: 'military-button--sm',
    md: '',
    lg: 'military-button--lg'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  )

  const renderIcon = () => {
    if (!icon) return null
    return (
      <span className={cn(iconSizeClasses[size], iconPosition === 'left' && 'mr-2', iconPosition === 'right' && 'ml-2')}>
        {icon}
      </span>
    )
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className={cn('animate-spin', iconSizeClasses[size], iconPosition === 'left' && 'mr-2', iconPosition === 'right' && 'ml-2')} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  )
}

interface AdminButtonGroupProps {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

/**
 * AdminButtonGroup Component
 * 
 * Groups buttons with consistent spacing
 */
export const AdminButtonGroup: React.FC<AdminButtonGroupProps> = ({
  children,
  className,
  spacing = 'sm'
}) => {
  const spacingClasses = {
    sm: 'space-x-2',
    md: 'space-x-3',
    lg: 'space-x-4'
  }

  return (
    <div className={cn('flex items-center', spacingClasses[spacing], className)}>
      {children}
    </div>
  )
}
