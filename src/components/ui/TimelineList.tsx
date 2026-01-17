import React from 'react'
import { TimelineCard, type TimelineCardProps } from './TimelineCard'

export interface TimelineListProps {
  items: TimelineCardProps[]
  className?: string
}

/**
 * TimelineList Component
 * 
 * WHEN TO USE:
 * - Display multiple timeline cards in sequence
 * - Create chronological lists of events
 * - Show military honors or historical milestones
 * 
 * PROPS:
 * - items: Array of timeline card data
 * - className: Additional CSS classes
 * 
 * USAGE:
 * <TimelineList 
 *   items={[
 *     { year: '1944', title: 'Khai sinh', description: '...' },
 *     { year: '1950', title: 'Huân chương', description: '...', medalImage: '...' }
 *   ]}
 * />
 */
export const TimelineList: React.FC<TimelineListProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className={`timeline-cards ${className}`}>
      {items.map((item, index) => (
        <TimelineCard 
          key={`${item.year}-${index}`}
          {...item}
        />
      ))}
    </div>
  )
}
