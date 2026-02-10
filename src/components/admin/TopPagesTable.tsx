import React from 'react'
import { Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PageData {
  path: string
  title: string
  pageViews: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  growthRate: number
}

interface TopPagesTableProps {
  data?: PageData[]
  loading?: boolean
  error?: string
  timeRange?: string
}

export const TopPagesTable: React.FC<TopPagesTableProps> = ({
  data,
  loading,
  error,
  timeRange
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {error || 'No page data available'}
      </div>
    )
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 5) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (rate < -5) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getGrowthColor = (rate: number): string => {
    if (rate > 5) return 'text-green-600'
    if (rate < -5) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h3 className="admin-table-title">Top Pages</h3>
        <p className="admin-table-subtitle">
          Most visited pages {timeRange ? `in the last ${timeRange}` : ''}
        </p>
      </div>
      
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead className="admin-table-thead">
            <tr>
              <th className="admin-table-th">Page</th>
              <th className="admin-table-th">Page Views</th>
              <th className="admin-table-th">Unique Views</th>
              <th className="admin-table-th">Avg Time</th>
              <th className="admin-table-th">Bounce Rate</th>
              <th className="admin-table-th">Growth</th>
            </tr>
          </thead>
          <tbody className="admin-table-tbody">
            {data.map((page, index) => (
              <tr key={index} className="admin-table-row">
                <td className="admin-table-td">
                  <div className="admin-table-page-info">
                    <Globe className="admin-table-icon" />
                    <div>
                      <div className="admin-table-page-title">
                        {page.title || page.path}
                      </div>
                      <div className="admin-table-page-path">
                        {page.path}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="admin-table-td admin-table-number">
                  {formatNumber(page.pageViews)}
                </td>
                <td className="admin-table-td admin-table-number">
                  {formatNumber(page.uniqueViews)}
                </td>
                <td className="admin-table-td admin-table-number">
                  {formatDuration(page.avgTimeOnPage)}
                </td>
                <td className="admin-table-td admin-table-number">
                  {page.bounceRate.toFixed(1)}%
                </td>
                <td className="admin-table-td">
                  <div className="admin-table-growth">
                    {getGrowthIcon(page.growthRate)}
                    <span className={`admin-table-growth-text ${getGrowthColor(page.growthRate)}`}>
                      {page.growthRate > 0 ? '+' : ''}{page.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
