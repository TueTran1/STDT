import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { AdminPermission } from '../../types/admin'
import { adminHealthService } from '../../services/adminHealthService'
import { 
  AdminHealthData, 
  MonitoringStatus, 
  HealthQueryOptions, 
  UseAdminHealthResult
} from '../../types/adminHealth'

interface UseAdminHealthOptions extends HealthQueryOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
}

/**
 * Admin Health Hook
 * 
 * Provides real-time system health monitoring with:
 * - Automatic data refresh
 * - Error handling and fallbacks
 * - Permission validation
 * - Loading states
 */
export const useAdminHealth = (options: UseAdminHealthOptions = { timeRange: '24h' }): UseAdminHealthResult => {
  const { adminUser, hasPermission } = useAdminAuth()
  const [data, setData] = useState<AdminHealthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<import('firebase/firestore').Timestamp | null>(null)
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null)

  // Permission validation
  const validatePermission = useCallback((): boolean => {
    if (!adminUser) return false
    return hasPermission(AdminPermission.VIEW_AUDIT_LOG) // Health monitoring requires audit log permission
  }, [adminUser, hasPermission])

  // Fetch health data
  const fetchHealthData = useCallback(async (): Promise<void> => {
    if (!validatePermission()) {
      setError('Insufficient permissions to view health data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [healthData, monitoringStatusData] = await Promise.all([
        adminHealthService.getHealthData(options),
        adminHealthService.getMonitoringStatus()
      ])

      setData(healthData)
      setMonitoringStatus(monitoringStatusData)
      setLastUpdated(healthData.lastUpdated)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health data'
      setError(errorMessage)
      console.error('Health data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [validatePermission, options])

  // Refresh function
  const refresh = useCallback(async (): Promise<void> => {
    await fetchHealthData()
  }, [fetchHealthData])

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    if (!adminUser) {
      throw new Error('User not authenticated')
    }

    try {
      await adminHealthService.acknowledgeAlert(alertId, adminUser.uid)
      // Refresh data to show updated alert status
      await fetchHealthData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert'
      setError(errorMessage)
      throw err
    }
  }, [adminUser, fetchHealthData])

  // Resolve alert
  const resolveAlert = useCallback(async (alertId: string): Promise<void> => {
    if (!adminUser) {
      throw new Error('User not authenticated')
    }

    try {
      await adminHealthService.resolveAlert(alertId, adminUser.uid)
      // Refresh data to show updated alert status
      await fetchHealthData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve alert'
      setError(errorMessage)
      throw err
    }
  }, [adminUser, fetchHealthData])

  // Auto-refresh effect
  useEffect(() => {
    if (!validatePermission()) return

    // Initial fetch
    fetchHealthData()

    // Set up auto-refresh if enabled
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchHealthData, options.refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [validatePermission, fetchHealthData, options.autoRefresh, options.refreshInterval])

  // Permission change effect
  useEffect(() => {
    if (!validatePermission()) {
      setData(null)
      setMonitoringStatus(null)
      setError('Insufficient permissions to view health data')
    }
  }, [validatePermission])

  return {
    data,
    loading,
    error,
    lastUpdated,
    monitoringStatus,
    refresh,
    acknowledgeAlert,
    resolveAlert
  }
}
