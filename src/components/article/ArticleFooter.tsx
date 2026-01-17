import React from 'react'
import { Eye } from 'lucide-react'

export interface ArticleFooterProps {
  views?: number
  updatedAt?: string | Date | { toDate: () => Date }
}

/**
 * ArticleFooter Component
 * 
 * PURPOSE: Displays article metadata (views and update date)
 * 
 * WHEN TO USE:
 * - News article footers
 * - Knowledge article footers
 * - Any article needing view count and date display
 * 
 * PROPS:
 * - views: Number of views
 * - updatedAt: Last update date (string or Date)
 * 
 * USAGE:
 * <ArticleFooter 
 *   views={150}
 *   updatedAt="2024-01-15"}
 * />
 */
export const ArticleFooter: React.FC<ArticleFooterProps> = ({ 
  views, 
  updatedAt 
}) => {
  const formatDate = (date: string | Date | { toDate: () => Date }) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('vi-VN')
    } else if (date && typeof date === 'object' && 'toDate' in date && typeof (date as any).toDate === 'function') {
      // Firestore Timestamp
      return (date as any).toDate().toLocaleDateString('vi-VN')
    } else if (date instanceof Date) {
      return date.toLocaleDateString('vi-VN')
    }
    return ''
  }

  return (
    <div className="news-footer">
      <div className="views">
        <span className="views-icon">
          <Eye size={16} />
        </span>
        <span>{views || 0} lượt xem</span>
      </div>
      <div className="date">
        {updatedAt && formatDate(updatedAt)}
      </div>
    </div>
  )
}
