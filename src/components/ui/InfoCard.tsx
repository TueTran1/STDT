import React from 'react'

export interface InfoCardProps {
  title: string
  description?: string
  icon?: string
  image?: string
  imageAlt?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

/**
 * InfoCard Component
 * 
 * WHEN TO USE:
 * - Display information cards with title and description
 * - Show clickable cards for navigation
 * - Present knowledge articles or news items
 * - Create grid layouts of information
 * 
 * PROPS:
 * - title: Main title of the card
 * - description: Optional description text
 * - icon: Optional emoji or icon string
 * - image: Optional image URL
 * - imageAlt: Alt text for image
 * - onClick: Click handler for interactive cards
 * - className: Additional CSS classes
 * - children: Optional child content
 * 
 * USAGE:
 * <InfoCard 
 *   title="Article Title"
 *   description="Article description..."
 *   onClick={() => navigate('/article/1')}
 * />
 */
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  image,
  imageAlt,
  onClick,
  className = '',
  children
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className={`info-card ${onClick ? 'clickable' : ''} ${className}`}
      onClick={handleClick}
    >
      {(icon || image) && (
        <div className="info-card-media">
          {icon && <div className="info-card-icon">{icon}</div>}
          {image && (
            <img 
              src={image} 
              alt={imageAlt || title}
              className="info-card-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
        </div>
      )}
      
      <div className="info-card-content">
        <h3 className="info-card-title">{title}</h3>
        {description && (
          <p className="info-card-description">{description}</p>
        )}
        {children && (
          <div className="info-card-children">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
