import React from 'react'

interface EmptyStateProps {
  title: string
  message: string
  icon?: 'document' | 'news' | 'tradition' | 'knowledge'
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  icon = 'document' 
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'document':
        return (
          <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        )
      case 'news':
        return (
          <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        )
      case 'tradition':
        return (
          <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )
      case 'knowledge':
        return (
          <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {getIcon()}
      <h3 className="mt-4 text-lg font-semibold text-yellow-300">{title}</h3>
      <p className="mt-2 text-yellow-200 text-sm max-w-md">{message}</p>
    </div>
  )
}
