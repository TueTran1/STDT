import React from 'react'
import { Eye, Clock } from 'lucide-react'

export interface ArticleFooterMetaProps {
  views?: number
  readingTime?: number
}

/**
 * ArticleFooterMeta Component
 * 
 * PURPOSE: Footer metadata section for articles
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with engagement metrics
 * 
 * PROPS:
 * - views: Number of views
 * - readingTime: Estimated reading time in minutes
 * 
 * USAGE:
 * <ArticleFooterMeta views={100} readingTime={5} />
 */
export const ArticleFooterMeta: React.FC<ArticleFooterMetaProps> = ({
  views = 0,
  readingTime = 0
}) => {
  return (
    <div className="bg-gradient-to-r from-red-800/90 to-red-900/90 border-l-4 border-yellow-500 p-4">
      <div className="flex justify-between items-center text-yellow-200">
        <div className="flex items-center space-x-2">
          <Eye size={16} />
          <span>{views} lượt xem</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={16} />
          <span>{readingTime} phút đọc</span>
        </div>
      </div>
    </div>
  )
}
