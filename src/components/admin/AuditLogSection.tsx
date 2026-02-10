import React, { useState } from 'react'
import { History, Search, Filter, User, Clock, FileText } from 'lucide-react'
import { AuditLogEntry } from '../../services/adminService'
import { Timestamp } from 'firebase/firestore'

/**
 * Audit Log Section
 * 
 * Interface for viewing system audit logs
 * Requires VIEW_AUDIT_LOG permission
 */
export const AuditLogSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<'all' | string>('all')
  const [resourceFilter, setResourceFilter] = useState<'all' | string>('all')
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock data - in real implementation, this would use adminService.getAuditLogs
  const mockLogs: AuditLogEntry[] = [
    {
      id: '1',
      userId: 'user1',
      userEmail: 'admin@example.com',
      action: 'create_user',
      resourceType: 'users',
      resourceId: 'new-user-123',
      details: {
        role: 'editor',
        displayName: 'New User'
      },
      timestamp: Timestamp.fromDate(new Date('2024-01-15T10:30:00')),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      userId: 'user1',
      userEmail: 'admin@example.com',
      action: 'delete_article',
      resourceType: 'articles',
      resourceId: 'article-456',
      details: {
        articleType: 'news',
        title: 'Old Article'
      },
      timestamp: Timestamp.fromDate(new Date('2024-01-15T09:15:00')),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '3',
      userId: 'user2',
      userEmail: 'editor@example.com',
      action: 'update_user',
      resourceType: 'users',
      resourceId: 'user-789',
      details: {
        field: 'role',
        oldValue: 'editor',
        newValue: 'admin'
      },
      timestamp: Timestamp.fromDate(new Date('2024-01-14T16:45:00')),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  ]

  // Get unique actions and resources for filters
  const uniqueActions = Array.from(new Set(mockLogs.map(log => log.action)))
  const uniqueResources = Array.from(new Set(mockLogs.map(log => log.resourceType)))

  // Load audit logs (mock implementation)
  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let filteredLogs = mockLogs
      
      // Apply search filter
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log =>
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Apply action filter
      if (actionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === actionFilter)
      }
      
      // Apply resource filter
      if (resourceFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.resourceType === resourceFilter)
      }
      
      setLogs(filteredLogs)
    } catch (err) {
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Timestamp): string => {
    const date = timestamp.toDate()
    return date.toLocaleString()
  }

  // Get action display name
  const getActionDisplayName = (action: string): string => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Get resource display name
  const getResourceDisplayName = (resourceType: string): string => {
    return resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
  }

  // Load logs on mount and when filters change
  React.useEffect(() => {
    loadLogs()
  }, [searchTerm, actionFilter, resourceFilter])

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <History className="w-4 h-4" />
          <span>{logs.length} entries</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {getActionDisplayName(action)}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Resources</option>
              {uniqueResources.map(resource => (
                <option key={resource} value={resource}>
                  {getResourceDisplayName(resource)}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={loadLogs}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.userEmail}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {log.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getActionDisplayName(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {getResourceDisplayName(log.resourceType)}
                      </span>
                      {log.resourceId && (
                        <span className="text-xs text-gray-500">
                          ({log.resourceId})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="font-medium text-gray-600">{key}:</span>{' '}
                          <span className="text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading audit logs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-500">
              {searchTerm || actionFilter !== 'all' || resourceFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No audit activities recorded yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
