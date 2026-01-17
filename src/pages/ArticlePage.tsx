import React from 'react'
import { useParams } from 'react-router-dom'
import { useKnowledge, useNews } from '../hooks/useFirestore'
import {
  LoadingState,
  ErrorState,
  BackButton
} from '../components/ui'
import { Newspaper, Landmark, BookOpen, User, Calendar, Eye, Clock, FileText } from 'lucide-react'

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  
  // Get both knowledge and news data
  const { data: knowledgeData, loading: knowledgeLoading, error: knowledgeError } = useKnowledge()
  const { data: newsData, loading: newsLoading, error: newsError } = useNews()
  
  // Combine loading and error states
  const loading = knowledgeLoading || newsLoading
  const error = knowledgeError || newsError
  
  // Find the article by slug from both knowledge and news data
  const article = knowledgeData?.find(item => item.slug === slug) || 
                newsData?.find(item => item.slug === slug)
  // Determine article type based on where we found it
  const articleType = knowledgeData?.find(item => item.slug === slug) ? 'knowledge' : 
                   newsData?.find(item => item.slug === slug) ? 'news' : 'traditions'

  // Handle refresh for error state
  const handleRefresh = () => {
    window.location.reload()
  }

  // Handle back navigation based on article type
  const getBackRoute = () => {
    switch (articleType) {
      case 'knowledge':
        return '/knowledge'
      case 'news':
        return '/news'
      case 'traditions':
        return '/traditions'
      default:
        return '/'
    }
  }

  // Helper functions for component props
  const getTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'news': return <Newspaper size={24} />
      case 'traditions': return <Landmark size={24} />
      case 'knowledge': return <BookOpen size={24} />
      default: return <FileText size={24} />
    }
  }

  const getTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'news': return 'TIN TỨC'
      case 'traditions': return 'TRUYỀN THỐNG'
      case 'knowledge': return 'KIẾN THỨC'
      default: 'BÀI VIẾT'
    }
  }

  if (loading) {
    return (
      <div className="article-page">
        <div className="bronze-drum-pattern"></div>
        <div className="top-icons">
          <div></div>
          <BackButton to={getBackRoute()} />
        </div>
        <div className="main-container">
          <LoadingState message="Đang tải bài viết..." />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="article-page">
        <div className="bronze-drum-pattern"></div>
        <div className="top-icons">
          <div></div>
          <BackButton to={getBackRoute()} />
        </div>
        <div className="main-container">
          <ErrorState 
            message={error || 'Bài viết không tồn tại'}
            onRetry={handleRefresh}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="article-page">
      <div className="bronze-drum-pattern"></div>
      
      {/* Top Icons */}
      <div className="top-icons">
          <div></div>
        <BackButton to={getBackRoute()} />
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Article Header */}
        <div className="article-header">
          <div className="article-type-label">
            {getTypeIcon(articleType)}
            <span>{getTypeLabel(articleType)}</span>
          </div>
          
          <h1 className="article-title">{article.title}</h1>
          
          <div className="article-meta-row">
            <div className="article-meta-item">
              <User size={16} />
              <span>{article.author?.displayName || 'Lữ đoàn 83'}</span>
            </div>
            <div className="article-meta-item">
              <Calendar size={16} />
              <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="article-meta-item">
              <Eye size={16} />
              <span>{articleType === 'knowledge' ? (article as any).engagement?.views || 0 : 0} lượt xem</span>
            </div>
            <div className="article-meta-item">
              <Clock size={16} />
              <span>{articleType === 'knowledge' ? (article as any).estimatedTime || 0 : 0} phút đọc</span>
            </div>
          </div>
        </div>

        {/* Article Content Panel */}
        <div className="article-content-panel">
          {/* Executive Summary */}
          {articleType === 'knowledge' && (article as any).summary && (
            <div className="article-summary">
              <h3 className="summary-title">TÓM TẮT</h3>
              <p className="summary-content">
                {(article as any).summary}
              </p>
            </div>
          )}

          {/* Article Body */}
          <div className="article-body">
            <div 
              className="article-text"
              dangerouslySetInnerHTML={{ 
                __html: article.content?.replace(/\n/g, '<br />') || 'Nội dung đang được cập nhật...' 
              }} 
            />
          </div>

          {/* Article Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="article-tags-section">
              <div className="tag-list">
                {article.tags.map((tag: string, index: number) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
