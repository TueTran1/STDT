import React from 'react'

export interface ButtonOption {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface ButtonGroupProps {
  options: ButtonOption[]
  selectedValue: string
  onSelect: (value: string) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'military'
  allowMultiple?: boolean
  selectedValues?: string[]
}

/**
 * ButtonGroup Component
 * 
 * WHEN TO USE:
 * - Create tab navigation
 * - Build filter button groups
 * - Show selection options
 * - Create navigation menus
 * - Build category selectors
 * 
 * PROPS:
 * - options: Array of button options
 * - selectedValue: Currently selected value (single mode)
 * - onSelect: Selection handler
 * - className: Additional CSS classes
 * - orientation: Layout direction
 * - size: Button size
 * - variant: Button style
 * - allowMultiple: Enable multi-select mode
 * - selectedValues: Selected values (multi-mode)
 * 
 * USAGE:
 * // Single selection
 * <ButtonGroup 
 *   options={tabs}
 *   selectedValue={activeTab}
 *   onSelect={setActiveTab}
 *   orientation="horizontal"
 * />
 * 
 * // Multiple selection
 * <ButtonGroup 
 *   options={filters}
 *   selectedValues={selectedFilters}
 *   onSelect={handleFilterSelect}
 *   allowMultiple={true}
 * />
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  options,
  selectedValue,
  onSelect,
  className = '',
  orientation = 'horizontal',
  size = 'medium',
  variant = 'primary',
  allowMultiple = false,
  selectedValues = []
}) => {
  const isSelected = (optionId: string) => {
    return allowMultiple ? selectedValues.includes(optionId) : selectedValue === optionId
  }

  const handleClick = (optionId: string) => {
    if (allowMultiple) {
      const newSelection = isSelected(optionId)
        ? selectedValues.filter(id => id !== optionId)
        : [...selectedValues, optionId]
      onSelect(newSelection as any) // Type assertion for multi-select
    } else {
      onSelect(optionId)
    }
  }

  const sizeClasses = {
    small: 'btn-group-small',
    medium: 'btn-group-medium',
    large: 'btn-group-large'
  }

  const variantClasses = {
    primary: 'btn-group-primary',
    secondary: 'btn-group-secondary',
    military: 'btn-group-military'
  }

  return (
    <div 
      className={`button-group ${orientation} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role={allowMultiple ? 'group' : 'radiogroup'}
    >
      {options.map((option) => (
        <button
          key={option.id}
          className={`button-group-item ${
            isSelected(option.id) ? 'active' : 'inactive'
          } ${option.disabled ? 'disabled' : ''} ${option.className || ''}`}
          onClick={() => !option.disabled && handleClick(option.id)}
          disabled={option.disabled}
          role={allowMultiple ? 'checkbox' : 'radio'}
          aria-checked={isSelected(option.id)}
        >
          {option.icon && (
            <span className="button-group-icon">{option.icon}</span>
          )}
          <span className="button-group-label">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
