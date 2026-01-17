import React from 'react'
import { InfoCard } from './InfoCard'
import type { Article } from './ArticleList'

export interface ArticleItemProps {
  article: Article
  onClick?: (article: Article) => void
  className?: string
  showMeta?: boolean
  showTags?: boolean
}

/**
 * ArticleItem Component
 * 
 * WHEN TO USE:
 * - Display single article in detail
 * - Show article preview with metadata
 * - Create article list items with consistent styling
 * 
 * PROPS:
 * - article: Article object to display
 * - onClick: Click handler for article
 * - className: Additional CSS classes
 * - showMeta: Show author, date, category info
 * - showTags: Show article tags
 * 
 * USAGE:
 * <ArticleItem 
 *   article={article}
 *   onClick={(article) => navigate(`/article/${article.id}`)}
 *   showMeta={true}
 * />
 */
export const ArticleItem: React.FC<ArticleItemProps> = ({
  article,
  onClick,
  className = '',
  showMeta = true,
  showTags = true
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(article)
    }
  }

  return (
    <InfoCard
      title={article.title}
      description={article.description}
      image={article.image}
      imageAlt={article.title}
      onClick={handleClick}
      className={`article-item ${className}`}
    >
      {showMeta && (
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
        </div>
      )}
      
      {showTags && article.tags && article.tags.length > 0 && (
        <div className="article-tags">
          {article.tags.map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
        </div>
      )}
    </InfoCard>
  )
}
