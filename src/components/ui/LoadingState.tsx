import React from 'react'

export interface LoadingStateProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  showSpinner?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * LoadingState Component
 * 
 * WHEN TO USE:
 * - Show loading state during data fetching
 * - Display loading during async operations
 * - Provide feedback for long-running processes
 * - Replace inline loading implementations
 * 
 * PROPS:
 * - message: Custom loading message
 * - size: Spinner size variant
 * - showSpinner: Whether to show spinner animation
 * - className: Additional CSS classes
 * - children: Custom loading content
 * 
 * USAGE:
 * <LoadingState 
 *   message="Đang tải dữ liệu..."
 *   size="medium"
 *   showSpinner={true}
 * />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Đang tải...',
  size = 'medium',
  showSpinner = true,
  className = '',
  children
}) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  }

  return (
    <div className={`loading-state ${sizeClasses[size]} ${className}`}>
      {showSpinner && (
        <div className="military-spinner"></div>
      )}
      {children || (
        <p className="loading-message">{message}</p>
      )}
    </div>
  )
}
