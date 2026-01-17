import React from 'react'
import { InfoCard } from './InfoCard'

export interface Article {
  id: string
  title: string
  description: string
  category: string
  author?: string
  createdAt?: string
  tags?: string[]
  image?: string
}

export interface ArticleListProps {
  articles: Article[]
  onArticleClick?: (article: Article) => void
  loading?: boolean
  error?: string
  emptyMessage?: string
  className?: string
}

/**
 * ArticleList Component
 * 
 * WHEN TO USE:
 * - Display lists of knowledge articles or news
 * - Show filtered article collections
 * - Create searchable article grids
 * 
 * PROPS:
 * - articles: Array of article objects
 * - onArticleClick: Handler for article clicks
 * - loading: Show loading state
 * - error: Error message to display
 * - emptyMessage: Custom message for empty state
 * - className: Additional CSS classes
 * 
 * USAGE:
 * <ArticleList 
 *   articles={filteredArticles}
 *   onArticleClick={(article) => navigate(`/article/${article.id}`)}
 * />
 */
export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onArticleClick,
  loading = false,
  error,
  emptyMessage = 'Không có bài viết nào.',
  className = ''
}) => {
  if (loading) {
    return (
      <div className="article-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải bài viết...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="article-list-error">
        <div className="error-icon">⚠️</div>
        <h3>LỖI TẢI DỮ LIỆU</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="article-list-empty">
        <div className="empty-icon">📄</div>
        <h3>CHƯA CÓ BÀI VIẾT</h3>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`article-list ${className}`}>
      <div className="article-grid">
        {articles.map((article) => (
          <InfoCard
            key={article.id}
            title={article.title}
            description={article.description}
            image={article.image}
            imageAlt={article.title}
            onClick={() => onArticleClick?.(article)}
            className="article-card"
          >
            <div className="article-meta">
              {article.category && (
                <span className="article-category">{article.category}</span>
              )}
              {article.author && (
                <span className="article-author">Đăng bởi: {article.author}</span>
              )}
              {article.createdAt && (
                <span className="article-date">
                  {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                </span>
              )}
              {article.tags && article.tags.length > 0 && (
                <div className="article-tags">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </InfoCard>
        ))}
      </div>
    </div>
  )
}
