import React, { useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  Globe, 
  Monitor, 
  RefreshCw,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { HealthCard } from './HealthCard'
import { TrafficSourcesChart } from './TrafficSourcesChart'
import { UserGrowthChart } from './UserGrowthChart'
import { GeographicChart } from './GeographicChart'
import { TopPagesTable } from './TopPagesTable'
import { useTrafficData } from '../../hooks/admin/useTrafficData'
import { TimeRange } from '../../types/analytics'
import { 
  AdminPageWrapper, 
  AdminSection, 
  AdminGrid, 
  AdminEmptyState, 
  AdminLoadingState, 
  AdminErrorState 
} from './shared/AdminPageWrapper'

/**
 * Traffic Overview Section
 * 
 * Displays comprehensive traffic and user analytics with:
 * - Real-time data updates
 * - Interactive charts and tables
 * - Time range selection
 * - Data export functionality
 * - Performance-optimized rendering
 */
export const TrafficOverviewSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  
  const {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    setTimeRange: setHookTimeRange,
    exportData
  } = useTrafficData({ 
    timeRange,
    autoRefresh: true,
    refreshInterval: 300 // 5 minutes
  })

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
    setHookTimeRange(newTimeRange)
  }

  // Handle data export
  const handleExport = (format: 'csv' | 'json') => {
    exportData(format)
  }

  // Handle refresh
  const handleRefresh = async () => {
    await refresh()
  }

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Calculate growth status
  const getGrowthStatus = (growthRate: number): 'up' | 'down' | 'stable' => {
    if (growthRate > 5) return 'up'
    if (growthRate < -5) return 'down'
    return 'stable'
  }

  return (
    <AdminPageWrapper 
      title="Traffic & User Analytics" 
      subtitle="Comprehensive site usage and user engagement metrics"
    >
      {/* Header Controls */}
      <div className="admin-controls">
        {/* Time Range Selector */}
        <div className="admin-control-group">
          <Calendar className="admin-control-icon" />
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
            className="admin-select"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={() => handleExport('csv')}
          disabled={loading || !data}
          className="admin-button admin-button--success"
        >
          <Download className="admin-button-icon" />
          <span>Export</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="admin-button admin-button--secondary"
        >
          <RefreshCw className={`admin-button-icon ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error State */}
      {error && !loading && (
        <AdminErrorState 
          error={error}
          onDismiss={handleRefresh}
        />
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mb-4 text-sm text-gray-500">
          Last updated: {lastUpdated.toDate().toLocaleString()}
        </div>
      )}

      {/* Traffic Overview Cards */}
      <AdminGrid cols={4}>
        {/* Total Traffic Card */}
        <HealthCard
          title="Total Traffic"
          status="healthy"
          value={data ? formatNumber(data.traffic.metrics.totalPageViews) : '---'}
          subtitle="Page views"
          trend={{
            direction: data ? getGrowthStatus(data.traffic.growth.growthRate.pageViews) : 'stable',
            percentage: data ? Math.abs(data.traffic.growth.growthRate.pageViews) : 0
          }}
          icon={BarChart3}
          loading={loading}
        />

        {/* Unique Visitors Card */}
        <HealthCard
          title="Unique Visitors"
          status="healthy"
          value={data ? formatNumber(data.traffic.metrics.uniqueVisitors) : '---'}
          subtitle="Individual users"
          trend={{
            direction: data ? getGrowthStatus(data.traffic.growth.growthRate.uniqueVisitors) : 'stable',
            percentage: data ? Math.abs(data.traffic.growth.growthRate.uniqueVisitors) : 0
          }}
          icon={Users}
          loading={loading}
        />

        {/* User Growth Card */}
        <HealthCard
          title="User Growth"
          status={data && data.users.metrics.userGrowthRate > 0 ? 'healthy' : 'warning'}
          value={data ? `${data.users.metrics.userGrowthRate.toFixed(1)}%` : '---'}
          subtitle="Growth rate"
          trend={{
            direction: data ? getGrowthStatus(data.users.metrics.userGrowthRate) : 'stable',
            percentage: data ? Math.abs(data.users.metrics.userGrowthRate) : 0
          }}
          icon={TrendingUp}
          loading={loading}
        />

        {/* Engagement Rate Card */}
        <HealthCard
          title="Engagement Rate"
          status={data && data.traffic.metrics.bounceRate < 50 ? 'healthy' : 'warning'}
          value={data ? `${(100 - data.traffic.metrics.bounceRate).toFixed(1)}%` : '---'}
          subtitle="Engagement"
          trend={{
            direction: data ? getGrowthStatus(-(data.traffic.metrics.bounceRate)) : 'stable',
            percentage: data ? Math.abs(data.traffic.metrics.bounceRate) : 0
          }}
          icon={Activity}
          loading={loading}
        />
      </AdminGrid>

      {/* Charts Section */}
      <AdminGrid cols={2}>
        {/* Traffic Sources Chart */}
        <AdminSection title="Traffic Sources">
          {data ? (
            <TrafficSourcesChart data={data.traffic.sources} />
          ) : (
            <AdminLoadingState message="Loading traffic sources..." />
          )}
        </AdminSection>

        {/* User Growth Chart */}
        <AdminSection title="User Growth Trend">
          {data ? (
            <UserGrowthChart data={data.users.growth} timeRange={timeRange} />
          ) : (
            <AdminLoadingState message="Loading user growth..." />
          )}
        </AdminSection>
      </AdminGrid>

      {/* Geographic Distribution */}
      <AdminSection title="Geographic Distribution">
        {data ? (
          <GeographicChart data={data.traffic.sources} />
        ) : (
          <AdminLoadingState message="Loading geographic data..." />
        )}
      </AdminSection>

      {/* Top Pages */}
      <AdminSection title="Top Pages">
        {data ? (
          <TopPagesTable pages={[]} />
        ) : (
          <AdminLoadingState message="Loading top pages..." />
        )}
      </AdminSection>

      {/* Empty State */}
      {!loading && !data && !error && (
        <AdminEmptyState
          icon={<BarChart3 />}
          title="No Traffic Data Available"
          description="Traffic data will appear here once users start visiting the site."
        />
      )}
    </AdminPageWrapper>
  )
}
