import React from 'react'

export interface TimelineCardProps {
  year: string
  title: string
  description: string
  medalImage?: string
  medalAlt?: string
  className?: string
}

/**
 * TimelineCard Component
 * 
 * WHEN TO USE:
 * - Display historical milestones with year and description
 * - Show military honors with optional medal images
 * - Create chronological timelines
 * 
 * PROPS:
 * - year: The year or year range to display
 * - title: The main title/headline for the event
 * - description: Detailed description of the event
 * - medalImage: Optional path to medal image (for honors)
 * - medalAlt: Alt text for medal image
 * - className: Additional CSS classes
 */
export const TimelineCard: React.FC<TimelineCardProps> = ({
  year,
  title,
  description,
  medalImage,
  medalAlt,
  className = ''
}) => {
  const isHonorCard = !!medalImage

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
  }

  return (
    <div className={`timeline-card ${isHonorCard ? 'honor-card' : ''} ${className}`}>
      <div className="year-block">
        <div className="year-content">
          {isHonorCard ? (
            <div className="year-medal-container">
              <span className="year-text">{year}</span>
              <img 
                src={medalImage} 
                alt={medalAlt} 
                className="medal-image"
                onError={handleImageError}
              />
            </div>
          ) : (
            <span className="year-text">{year}</span>
          )}
        </div>
      </div>
      <div className="content-block">
        <div className="card-title">{title}</div>
        <div className="card-description">{description}</div>
      </div>
    </div>
  )
}
