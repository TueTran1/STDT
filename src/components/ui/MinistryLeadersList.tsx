import React from 'react'

export interface MinistryLeader {
  id: string
  title: string
  name: string
  image: string
  imageAlt: string
}

export interface MinistryLeadersListProps {
  leaders: MinistryLeader[]
}

/**
 * MinistryLeadersList Component
 * 
 * PURPOSE: Displays Ministry of Defense leadership information
 * 
 * WHEN TO USE:
 * - Show current Ministry of Defense leadership
 * - Display organizational hierarchy
 * - Present leadership information with images
 * 
 * PROPS:
 * - leaders: Array of leader objects with title, name, and image
 * 
 * USAGE:
 * <MinistryLeadersList 
 *   leaders={ministryLeadersData}
 * />
 */
export const MinistryLeadersList: React.FC<MinistryLeadersListProps> = ({ leaders }) => {
  return (
    <div className="ministry-leaders-list">
      {leaders.map((leader) => (
        <div key={leader.id} className="leader-card">
          <div className="leader-image-container">
            <img 
              src={leader.image}
              alt={leader.imageAlt}
              className="leader-image"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = target.nextElementSibling as HTMLElement;
                target.style.display = 'none';
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            <div className="leader-image-fallback">
              <span className="leader-initial">
                {leader.name.split(' ').map(word => word[0]).join('').toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="leader-info">
            <div className="leader-title">{leader.title}</div>
            <div className="leader-name">{leader.name}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
