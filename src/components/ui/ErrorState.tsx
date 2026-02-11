import React from 'react'
import { HomeButton } from './HomeButton'
import { AlertTriangle } from 'lucide-react'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/**
 * ErrorState Component
 * 
 * WHEN TO USE:
 * - Display error messages for failed operations
 * - Show API or network errors
 * - Provide error recovery options
 * - Replace inline error handling
 * 
 * PROPS:
 * - title: Error title/headline
 * - message: Detailed error message
 * - onRetry: Retry action handler
 * - retryText: Custom retry button text
 * - icon: Error icon or emoji
 * - className: Additional CSS classes
 * - children: Custom error content
 * 
 * USAGE:
 * <ErrorState 
 *   title="LỖI TẢI DỮ LIỆU"
 *   message="Không thể kết nối đến máy chủ"
 *   onRetry={() => refetch()}
 *   retryText="Thử lại"
 * />
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'LỖI',
  message,
  onRetry,
  icon = <AlertTriangle size={48} />,
  className = '',
  children
}) => {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-icon">{icon}</div>
      {title && <h3 className="error-title">{title}</h3>}
      <p className="error-message">{message}</p>
      
      {children && (
        <div className="error-children">
          {children}
        </div>
      )}
      
      {onRetry && (
        <HomeButton 
          onClick={onRetry} 
          variant="full"
          className="error-retry-button"
        />
      )}
    </div>
  )
}
