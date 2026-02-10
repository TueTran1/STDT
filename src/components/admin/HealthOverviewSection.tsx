import React from 'react'
import { 
  Server, 
  Zap, 
  AlertTriangle, 
  Shield, 
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { HealthCard } from './HealthCard'
import { useAdminHealth } from '../../hooks/admin/useAdminHealth'
import { HealthStatus } from '../../types/adminHealth'

/**
 * Health Overview Section
 * 
 * Displays the at-a-glance health metrics for the system
 * with real-time data and proper error handling
 */
export const HealthOverviewSection: React.FC = () => {
  const {
    data,
    loading,
    error,
    lastUpdated,
    monitoringStatus,
    refresh
  } = useAdminHealth({ 
    timeRange: '24h',
    autoRefresh: true,
    refreshInterval: 60 // Refresh every minute
  })

  // Get health status from data
  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }): HealthStatus => {
    if (value >= thresholds.critical) return 'critical'
    if (value >= thresholds.warning) return 'warning'
    return 'healthy'
  }

  // Calculate health status for each metric
  const siteStatus = data ? 
    (data.siteStatus.status === 'up' ? 'healthy' : 
     data.siteStatus.status === 'down' ? 'critical' : 'warning') : 
    'unknown'

  const performanceStatus = data ? 
    getHealthStatus(data.performance.averageLoadTime, { warning: 3000, critical: 5000 }) : 
    'unknown'

  const errorStatus = data ? 
    getHealthStatus(data.errors.errorRate, { warning: 1, critical: 5 }) : 
    'unknown'

  const securityStatus = data ? 
    getHealthStatus(data.security.totalAlerts, { warning: 1, critical: 5 }) : 
    'unknown'

  // Handle refresh
  const handleRefresh = async () => {
    await refresh()
  }

  // Handle card clicks
  const handleSiteStatusClick = () => {
    // TODO: Navigate to detailed site status page
    console.log('Navigate to site status details')
  }

  const handlePerformanceClick = () => {
    // TODO: Navigate to performance details page
    console.log('Navigate to performance details')
  }

  const handleErrorClick = () => {
    // TODO: Navigate to error details page
    console.log('Navigate to error details')
  }

  const handleSecurityClick = () => {
    // TODO: Navigate to security details page
    console.log('Navigate to security details')
  }

  // Monitoring status indicator
  const renderMonitoringStatus = () => {
    if (!monitoringStatus) return null

    const isOnline = monitoringStatus.isOnline
    const hasIssues = monitoringStatus.issues.length > 0

    if (!isOnline || hasIssues) {
      return (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {isOnline ? 'Monitoring issues detected' : 'Monitoring system offline'}
            </span>
          </div>
          {hasIssues && (
            <div className="mt-2 text-xs text-yellow-700">
              Issues: {monitoringStatus.issues.map(issue => issue.message).join(', ')}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600">Real-time system monitoring and metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Last updated */}
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toDate().toLocaleTimeString()}
            </div>
          )}
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Monitoring Status */}
      {renderMonitoringStatus()}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">Failed to load health data</span>
            </div>
            <button
              onClick={handleRefresh}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
          <div className="mt-2 text-xs text-red-700">{error}</div>
        </div>
      )}

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Site Status Card */}
        <HealthCard
          title="Site Status"
          status={siteStatus}
          value={data ? data.siteStatus.uptime.toFixed(1) + '%' : '---'}
          subtitle="Uptime this month"
          trend={{
            direction: data && data.siteStatus.uptime > 95 ? 'stable' : 'down',
            percentage: data ? 100 - data.siteStatus.uptime : 0
          }}
          icon={Server}
          loading={loading}
          error={error ? 'Site status unavailable' : undefined}
          lastUpdated={data?.siteStatus.lastChecked}
          onClick={handleSiteStatusClick}
        />

        {/* Performance Card */}
        <HealthCard
          title="Page Load Speed"
          status={performanceStatus}
          value={data ? (data.performance.averageLoadTime / 1000).toFixed(2) + 's' : '---'}
          subtitle="Average load time"
          trend={{
            direction: data && data.performance.averageLoadTime > 3000 ? 'down' : 'stable',
            percentage: data ? Math.round((data.performance.averageLoadTime / 1000) * 10) : 0
          }}
          icon={Zap}
          loading={loading}
          error={error ? 'Performance data unavailable' : undefined}
          lastUpdated={data?.lastUpdated}
          onClick={handlePerformanceClick}
        />

        {/* Error Rate Card */}
        <HealthCard
          title="Error Rate"
          status={errorStatus}
          value={data ? data.errors.errorRate.toFixed(1) + '%' : '---'}
          subtitle={`${data?.errors.totalErrors || 0} errors in 24h`}
          trend={{
            direction: data && data.errors.errorRate > 1 ? 'up' : 'stable',
            percentage: data ? Math.round(data.errors.errorRate * 10) : 0
          }}
          icon={AlertTriangle}
          loading={loading}
          error={error ? 'Error data unavailable' : undefined}
          lastUpdated={data?.lastUpdated}
          onClick={handleErrorClick}
        />

        {/* Security Alerts Card */}
        <HealthCard
          title="Security Alerts"
          status={securityStatus}
          value={data ? data.security.totalAlerts.toString() : '---'}
          subtitle="Active security alerts"
          trend={{
            direction: data && data.security.totalAlerts > 0 ? 'up' : 'stable',
            percentage: data ? data.security.totalAlerts * 20 : 0
          }}
          icon={Shield}
          loading={loading}
          error={error ? 'Security data unavailable' : undefined}
          lastUpdated={data?.lastUpdated}
          onClick={handleSecurityClick}
        />
      </div>

      {/* Additional Info */}
      {data && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Page Views</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.performance.totalPageViews.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.performance.bounceRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security Score</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.security.securityScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Data Freshness */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Freshness</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Site Status</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.dataFreshness.siteStatus}m ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Performance</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.dataFreshness.performance}m ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Errors</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.dataFreshness.errors}m ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.dataFreshness.security}m ago
                </span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monitoring</span>
                <span className={`text-sm font-medium ${
                  monitoringStatus?.isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {monitoringStatus?.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sources</span>
                <span className="text-sm font-medium text-gray-900">
                  {monitoringStatus?.dataSources ? 
                    Object.values(monitoringStatus.dataSources)
                      .filter(status => status === 'online').length
                    : 0}/4 online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Check</span>
                <span className="text-sm font-medium text-gray-900">
                  {monitoringStatus?.lastDataReceived ? 
                    monitoringStatus.lastDataReceived.toDate().toLocaleTimeString() : 
                    'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
