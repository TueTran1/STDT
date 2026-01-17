import React from 'react'

export interface EmptyStateProps {
  title?: string
  message: string
  icon?: React.ReactNode
  action?: {
    text: string
    onClick: () => void
  }
  className?: string
  children?: React.ReactNode
}

/**
 * EmptyState Component
 * 
 * WHEN TO USE:
 * - Show empty data states
 * - Display no results messages
 * - Provide empty list feedback
 * - Replace inline empty state implementations
 * 
 * PROPS:
 * - title: Empty state title
 * - message: Detailed message
 * - icon: Icon or emoji to display
 * - action: Optional action button
 * - className: Additional CSS classes
 * - children: Custom empty state content
 * 
 * USAGE:
 * <EmptyState 
 *   title="CHƯA CÓ DỮ LIỆU"
 *   message="Chưa có thông tin nào được đăng tải"
 *   action={{
 *     text: 'Thêm mới',
 *     onClick: handleAdd
 *   }}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'TRỐNG',
  message,
  icon = '📄',
  action,
  className = '',
  children
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-icon">{icon}</div>
      {title && <h3 className="empty-title">{title}</h3>}
      <p className="empty-message">{message}</p>
      
      {children && (
        <div className="empty-children">
          {children}
        </div>
      )}
      
      {action && (
        <button 
          className="military-button empty-action-button"
          onClick={action.onClick}
        >
          {action.text}
        </button>
      )}
    </div>
  )
}
