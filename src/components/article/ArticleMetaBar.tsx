import React from 'react'
import { User, Calendar, Eye, Clock } from 'lucide-react'
import type { Article, ContentType } from './ArticleShell'

interface ArticleMetaBarProps {
  article: Partial<Article>
  mode: 'read' | 'edit'
  type: ContentType
  onFieldChange?: (field: keyof Article, value: any) => void
}

/**
 * ArticleMetaBar Component
 * 
 * PURPOSE: Display article metadata (author, date, views, reading time)
 * 
 * USAGE:
 * <ArticleMetaBar article={article} mode="read" type="news" />
 */
export const ArticleMetaBar: React.FC<ArticleMetaBarProps> = ({
  article,
  type
}) => {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('vi-VN')
  }

  const getReadingTime = () => {
    if (type === 'news') {
      return (article as any)?.readingTime || 0
    } else {
      return (article as any)?.estimatedTime || 0
    }
  }

  const getViews = () => {
    if (type === 'news') {
      return (article as any)?.viewCount || 0
    } else {
      return (article as any)?.engagement?.views || 0
    }
  }

  return (
    <div className="article-meta-bar">
      <div className="meta-item">
        <User size={16} />
        <span>{article.author?.displayName || 'Lữ đoàn 83'}</span>
      </div>
      
      <div className="meta-item">
        <Calendar size={16} />
        <span>{formatDate(article.createdAt)}</span>
      </div>
      
      <div className="meta-item">
        <Eye size={16} />
        <span>{getViews()} lượt xem</span>
      </div>
      
      <div className="meta-item">
        <Clock size={16} />
        <span>{getReadingTime()} phút đọc</span>
      </div>
    </div>
  )
}

export default ArticleMetaBar
