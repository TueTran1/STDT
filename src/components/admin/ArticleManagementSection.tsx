import React, { useState } from 'react'
import { FileText, Search, Filter, Trash2, Eye, Calendar } from 'lucide-react'
import { AdminArticleData } from '../../services/adminService'
import { Timestamp } from 'firebase/firestore'

/**
 * Article Management Section
 * 
 * Interface for viewing and managing all articles in the system
 * Requires VIEW_ARTICLES permission
 */
export const ArticleManagementSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'news' | 'knowledge'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'saved'>('all')
  const [articles, setArticles] = useState<AdminArticleData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock data - in real implementation, this would use adminService
  const mockArticles: AdminArticleData[] = [
    {
      id: '1',
      type: 'news',
      title: 'Breaking News: New System Update',
      slug: 'breaking-news-new-system-update',
      status: 'published',
      author: {
        uid: 'user1',
        displayName: 'John Editor',
        email: 'john@example.com'
      },
      createdAt: Timestamp.fromDate(new Date('2024-01-15')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
      publishedAt: Timestamp.fromDate(new Date('2024-01-15')),
      category: 'technology',
      tags: ['update', 'system', 'news']
    },
    {
      id: '2',
      type: 'knowledge',
      title: 'Understanding Military Strategy',
      slug: 'understanding-military-strategy',
      status: 'saved',
      author: {
        uid: 'user2',
        displayName: 'Jane Writer',
        email: 'jane@example.com'
      },
      createdAt: Timestamp.fromDate(new Date('2024-01-10')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-12')),
      category: 'quan-su',
      tags: ['strategy', 'military', 'knowledge']
    }
  ]

  // Load articles (mock implementation)
  const loadArticles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let filteredArticles = mockArticles
      
      // Apply search filter
      if (searchTerm) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.author.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Apply type filter
      if (typeFilter !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.type === typeFilter)
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.status === statusFilter)
      }
      
      setArticles(filteredArticles)
    } catch (err) {
      setError('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Handle delete article
  const handleDeleteArticle = async (article: AdminArticleData) => {
    if (window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      try {
        // In real implementation, this would call adminService.deleteArticle
        setArticles(prev => prev.filter(a => a.id !== article.id))
      } catch (err) {
        setError('Failed to delete article')
      }
    }
  }

  // Load articles on mount and when filters change
  React.useEffect(() => {
    loadArticles()
  }, [searchTerm, typeFilter, statusFilter])

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Article Management</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{articles.length} articles</span>
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
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'news' | 'knowledge')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="news">News</option>
              <option value="knowledge">Knowledge</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'saved')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="saved">Draft</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={loadArticles}
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

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        /{article.type}/{article.slug}
                      </div>
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {article.author.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {article.author.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.author.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      article.type === 'news' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {article.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.createdAt.toDate().toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View article"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            <p className="text-sm text-gray-500 mt-2">Loading articles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No articles exist in the system yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
