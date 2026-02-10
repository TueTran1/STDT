import React from 'react'
import { Users, FileText, Shield, Activity } from 'lucide-react'

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalArticles: number
  publishedArticles: number
  recentActivity: {
    userRegistrations: number
    articleCreations: number
    adminActions: number
  }
}

/**
 * System Overview Section
 * 
 * Displays high-level system metrics and statistics
 * No permissions required - visible to all admin users
 */
export const SystemOverviewSection: React.FC = () => {
  // Mock data - in real implementation, this would come from a service
  const metrics: SystemMetrics = {
    totalUsers: 45,
    activeUsers: 38,
    totalArticles: 127,
    publishedArticles: 89,
    recentActivity: {
      userRegistrations: 3,
      articleCreations: 12,
      adminActions: 8
    }
  }

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      change: metrics.recentActivity.userRegistrations,
      changeLabel: 'new this week',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      change: metrics.activeUsers / metrics.totalUsers * 100,
      changeLabel: 'activation rate',
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Total Articles',
      value: metrics.totalArticles,
      change: metrics.recentActivity.articleCreations,
      changeLabel: 'created this week',
      icon: FileText,
      color: 'purple'
    },
    {
      title: 'Published Articles',
      value: metrics.publishedArticles,
      change: (metrics.publishedArticles / metrics.totalArticles * 100).toFixed(1),
      changeLabel: 'publish rate',
      icon: Shield,
      color: 'yellow'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => {
          const Icon = card.icon
          const colorClasses = {
            blue: 'bg-blue-500 text-blue-600 bg-blue-50',
            green: 'bg-green-500 text-green-600 bg-green-50',
            purple: 'bg-purple-500 text-purple-600 bg-purple-50',
            yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50'
          }

          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{card.changeLabel}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {typeof card.change === 'number' ? card.change : card.change}%
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.recentActivity.userRegistrations}
              </div>
              <p className="text-sm text-gray-600">New Users This Week</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.recentActivity.articleCreations}
              </div>
              <p className="text-sm text-gray-600">Articles Created This Week</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.recentActivity.adminActions}
              </div>
              <p className="text-sm text-gray-600">Admin Actions This Week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
