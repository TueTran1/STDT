import React from 'react'
import { RefreshCcw } from 'lucide-react'

export interface RefreshButtonProps {
  onClick: () => void
  className?: string
  variant?: 'icon' | 'large'
  disabled?: boolean
}

/**
 * RefreshButton Component
 * 
 * PURPOSE: Reusable refresh button used across all pages and components
 * 
 * WHEN TO USE:
 * - Top navigation bars for data refresh
 * - Table headers for reloading data
 * - Forms for resetting state
 * - Anywhere user needs to refresh content
 * 
 * VARIANTS:
 * - 'icon': Small icon button (default)
 * - 'large': Larger button with text
 */
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  className = '',
  variant = 'icon',
  disabled = false
}) => {
  const baseClasses = 'transition-all duration-300 focus:outline-none'
  
  const variantClasses = {
    icon: 'icon-button',
    large: 'military-button px-6 py-3 text-sm font-bold text-white flex items-center justify-center gap-2'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`

  if (variant === 'large') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={combinedClasses}
      >
        <RefreshCcw className="w-4 h-4" />
        LÀM MỚI
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      title="Làm mới"
    >
      <RefreshCcw className="w-5 h-5 text-white" />
    </button>
  )
}
