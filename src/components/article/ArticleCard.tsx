import React from 'react'
import { ArticleHeader } from './ArticleHeader'
import { ArticleMeta } from './ArticleMeta'
import { ArticleTags } from './ArticleTags'
import { ArticleAttachments } from './ArticleAttachments'
import { ArticleFooter } from './ArticleFooter'
import { Calendar, User } from 'lucide-react'

export interface Article {
  id: string
  title: string
  content?: string
  category?: string
  priority?: 'urgent' | 'important'
  author?: {
    displayName?: string
  }
  createdAt?: string | Date | { toDate: () => Date }
  updatedAt?: string | Date | { toDate: () => Date }
  tags?: string[]
  attachments?: Array<{
    type: 'pdf' | 'image' | 'document'
    name: string
  }>
  views?: number
  slug?: string
}

export interface ArticleCardProps {
  article: Article
  onClick: (article: Article) => void
  children?: React.ReactNode
}

/**
 * ArticleCard Component
 * 
 * PURPOSE: Reusable card component for displaying articles
 * 
 * WHEN TO USE:
 * - News article lists
 * - Knowledge article lists
 * - Any article grid/list display
 * 
 * PROPS:
 * - article: Article data object
 * - onClick: Click handler for navigation
 * - children: Optional custom content (overrides default structure)
 * 
 * USAGE:
 * <ArticleCard 
 *   article={articleData}
 *   onClick={() => navigate('/news/${article.slug}')}
 * />
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onClick,
  children 
}) => {
  const handleClick = () => {
    onClick(article)
  }

  const previewText = article.content 
    ? article.content.substring(0, 150) + '...' 
    : 'Nội dung đang cập nhật...'

  return (
    <div 
      className="news-card clickable"
      onClick={handleClick}
    >
      {children || (
        <>
          {/* Card Header */}
          <ArticleHeader 
            category={article.category}
            priority={article.priority}
          />

          {/* Title and Preview */}
          <ArticleMeta 
            title={article.title}
            previewText={previewText}
          />

          {/* Publication Info */}
          <div className="news-publication">
            <div className="publication-icon">
              <Calendar size={16} />
            </div>
            <div className="publication-text">
              <strong>Ngày đăng:</strong> {
                article.createdAt 
                  ? (() => {
                      const date = article.createdAt
                      if (typeof date === 'string') {
                        return new Date(date).toLocaleDateString('vi-VN')
                      } else if (date && typeof date === 'object' && 'toDate' in date && typeof (date as any).toDate === 'function') {
                        // Firestore Timestamp
                        return (date as any).toDate().toLocaleDateString('vi-VN')
                      } else if (date instanceof Date) {
                        return date.toLocaleDateString('vi-VN')
                      } else {
                        return 'N/A'
                      }
                    })()
                  : ''
              }
            </div>
          </div>

          {/* Author */}
          <div className="news-author">
            <div className="author-icon">
              <User size={16} />
            </div>
            <div className="author-text">
              <strong>Tác giả:</strong> {article.author?.displayName || 'Ban chỉ huy'}
            </div>
          </div>

          {/* Tags */}
          <ArticleTags tags={article.tags} />

          {/* Attachments */}
          {article.attachments && article.attachments.length > 0 && (
            <ArticleAttachments 
              attachments={article.attachments.map(att => ({
                type: att.type as 'pdf' | 'image' | 'document',
                name: att.name
              }))}
            />
          )}

          {/* Footer */}
          <ArticleFooter 
            views={article.views}
            updatedAt={article.updatedAt}
          />
        </>
      )}
    </div>
  )
}
