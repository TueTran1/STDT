import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { AdminPermission } from '../../types/admin'
import { trafficService } from '../../services/trafficService'
import { 
  AnalyticsData, 
  AnalyticsQueryOptions, 
  TimeRange,
  UseTrafficDataResult
} from '../../types/analytics'

interface UseTrafficDataOptions extends AnalyticsQueryOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
}

/**
 * Traffic Data Hook
 * 
 * Provides comprehensive traffic and user analytics with:
 * - Automatic data refresh
 * - Error handling and fallbacks
 * - Permission validation
 * - Large dataset handling with pagination
 */
export const useTrafficData = (options: UseTrafficDataOptions = { 
  timeRange: '24h',
  autoRefresh: true,
  refreshInterval: 300 // 5 minutes
}): UseTrafficDataResult => {
  const { adminUser, hasPermission } = useAdminAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<import('firebase/firestore').Timestamp | null>(null)
  const [currentOptions, setCurrentOptions] = useState<UseTrafficDataOptions>(options)

  // Permission validation
  const validatePermission = useCallback((): boolean => {
    if (!adminUser) return false
    return hasPermission(AdminPermission.VIEW_AUDIT_LOG) // Use audit log permission for analytics
  }, [adminUser, hasPermission])

  // Fetch traffic data
  const fetchTrafficData = useCallback(async (): Promise<void> => {
    if (!validatePermission()) {
      setError('Insufficient permissions to view analytics data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const analyticsData = await trafficService.getAnalyticsData({
        timeRange: options.timeRange,
        includeGrowth: true,
        includeDemographics: true,
        includeGeographic: true,
        includeContentPerformance: true,
        limit: options.limit
      })

      setData(analyticsData)
      setLastUpdated(analyticsData.lastUpdated)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch traffic data'
      setError(errorMessage)
      console.error('Traffic data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [validatePermission, currentOptions.timeRange, currentOptions.limit])

  // Refresh function
  const refresh = useCallback(async (): Promise<void> => {
    await fetchTrafficData()
  }, [fetchTrafficData])

  // Set time range
  const setTimeRange = useCallback((newTimeRange: TimeRange): void => {
    setCurrentOptions(prev => ({ ...prev, timeRange: newTimeRange }))
    fetchTrafficData()
  }, [fetchTrafficData])

  // Export data for external use
  const exportData = useCallback((format: 'csv' | 'json'): void => {
    if (!data) return

    if (format === 'csv') {
      // Implement CSV export
      const csv = [
        'Metric,Value,Time Range',
        'Total Page Views', 'Total Page Views',
        'Unique Visitors', 'Unique Visitors',
        'Total Sessions', 'Total Sessions',
        'Avg Session Duration', `${data.traffic.metrics.avgSessionDuration}s`,
        'Bounce Rate', `${data.traffic.metrics.bounceRate}%`,
        'Page Views Per Session', 'Page Views Per Session'
      ].join('\n')
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${options.timeRange}_${Date.now()}.csv`
      a.click()
      document.body.removeChild(a)
    } else {
      // Implement JSON export
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${options.timeRange}_${Date.now()}.json`
      a.click()
      document.body.removeChild(a)
    }
  }, [data, options.timeRange])

  // Auto-refresh effect
  useEffect(() => {
    if (!validatePermission()) return

    // Initial fetch
    fetchTrafficData()

    // Set up auto-refresh if enabled
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchTrafficData, options.refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [validatePermission, options.autoRefresh, options.refreshInterval, fetchTrafficData])

  // Permission change effect
  useEffect(() => {
    if (!validatePermission()) {
      setData(null)
      setError('Insufficient permissions to view analytics data')
    }
  }, [validatePermission])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    setTimeRange,
    exportData
  }
}
