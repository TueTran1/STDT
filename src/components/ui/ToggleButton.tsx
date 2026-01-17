import React from 'react'

export interface ToggleButtonProps {
  isActive: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'military'
}

/**
 * ToggleButton Component
 * 
 * WHEN TO USE:
 * - Create on/off toggle switches
 * - Build filter toggles
 * - Show active/inactive states
 * - Create switchable UI elements
 * 
 * PROPS:
 * - isActive: Current active state
 * - onToggle: Toggle handler
 * - children: Button content
 * - className: Additional CSS classes
 * - disabled: Disable the button
 * - size: Button size variant
 * - variant: Button style variant
 * 
 * USAGE:
 * <ToggleButton 
 *   isActive={isSelected}
 *   onToggle={() => setIsSelected(!isSelected)}
 *   variant="military"
 * >
 *   Toggle Me
 * </ToggleButton>
 */
export const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  children,
  className = '',
  disabled = false,
  size = 'medium',
  variant = 'primary'
}) => {
  const handleClick = () => {
    if (!disabled) {
      onToggle()
    }
  }

  const sizeClasses = {
    small: 'toggle-small',
    medium: 'toggle-medium',
    large: 'toggle-large'
  }

  const variantClasses = {
    primary: 'toggle-primary',
    secondary: 'toggle-secondary',
    military: 'toggle-military'
  }

  return (
    <button
      className={`toggle-button ${sizeClasses[size]} ${variantClasses[variant]} ${
        isActive ? 'active' : 'inactive'
      } ${disabled ? 'disabled' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isActive}
    >
      {children}
    </button>
  )
}
