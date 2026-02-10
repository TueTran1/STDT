import React from 'react'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Minus
} from 'lucide-react'
import { HealthStatus, HealthCardProps } from '../../types/adminHealth'

/**
 * Health Card Component
 * 
 * Displays a single health metric with status indicator,
 * trend information, and appropriate styling
 */
export const HealthCard: React.FC<HealthCardProps> = ({
  title,
  status,
  value,
  subtitle,
  trend,
  icon: Icon,
  loading,
  error,
  lastUpdated,
  onClick
}) => {
  // Status styling
  const getStatusStyles = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          cardBg: 'bg-white'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          cardBg: 'bg-white'
        }
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          cardBg: 'bg-white'
        }
      case 'unknown':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          cardBg: 'bg-white'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          cardBg: 'bg-white'
        }
    }
  }

  const styles = getStatusStyles(status)

  // Get status icon
  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'critical':
        return <XCircle className="w-5 h-5" />
      case 'unknown':
        return <Activity className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  // Get trend icon
  const getTrendIcon = (direction?: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingDown className="w-4 h-4" />
      case 'stable':
        return <Minus className="w-4 h-4" />
      default:
        return null
    }
  }

  // Get trend color
  const getTrendColor = (direction?: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  // Format last updated time
  const formatLastUpdated = (timestamp?: import('firebase/firestore').Timestamp) => {
    if (!timestamp) return 'Never'
    
    const now = Date.now()
    const then = timestamp.toDate().getTime()
    const diffMinutes = Math.floor((now - then) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.cardBg} rounded-lg shadow p-6 border ${styles.border}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${styles.bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.cardBg} rounded-lg shadow p-6 border ${styles.border}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-red-600">Error loading data</p>
            </div>
          </div>
        </div>
        <div className="text-sm text-red-600">{error}</div>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`
        ${styles.cardBg} rounded-lg shadow p-6 border ${styles.border}
        transition-all duration-200 hover:shadow-lg
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${styles.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${styles.icon}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className={`flex items-center space-x-2 ${styles.bg} px-3 py-1 rounded-full`}>
          {getStatusIcon(status)}
          <span className={`text-xs font-medium ${styles.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Main value */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        
        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center space-x-2 mt-2">
            <div className={`flex items-center space-x-1 ${getTrendColor(trend.direction)}`}>
              {getTrendIcon(trend.direction)}
              <span className="text-sm font-medium">
                {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
              </span>
            </div>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatLastUpdated(lastUpdated)}</span>
        </div>
        
        {onClick && (
          <span className="text-blue-600 hover:text-blue-800">
            View details →
          </span>
        )}
      </div>
    </div>
  )
}
