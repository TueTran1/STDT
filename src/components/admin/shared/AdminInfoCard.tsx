import React from 'react'
import { InfoCard, type InfoCardProps } from '../../ui/InfoCard'

/**
 * AdminInfoCard Component
 * 
 * Wraps public app InfoCard with admin-specific enhancements
 * Reuses existing component to prevent divergence
 */
export const AdminInfoCard: React.FC<InfoCardProps> = (props) => {
  return (
    <InfoCard 
      {...props}
      className={`admin-info-card ${props.className || ''}`}
    />
  )
}

/**
 * AdminMetricCard Component
 * 
 * Specialized InfoCard for admin metrics and statistics
 * Reuses InfoCard base with admin-specific styling
 */
interface AdminMetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: string
  className?: string
}

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  title,
  value,
  change,
  icon,
  className = ''
}) => {
  const getChangeColor = () => {
    switch (change?.type) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    switch (change?.type) {
      case 'increase': return '↑'
      case 'decrease': return '↓'
      default: return '→'
    }
  }

  return (
    <InfoCard
      title={title}
      icon={icon}
      className={`admin-metric-card ${className}`}
    >
      <div className="admin-metric-content">
        <div className="admin-metric-value">
          {value}
        </div>
        {change && (
          <div className={`admin-metric-change ${getChangeColor()}`}>
            {getChangeIcon()} {Math.abs(change.value)}%
          </div>
        )}
      </div>
    </InfoCard>
  )
}
