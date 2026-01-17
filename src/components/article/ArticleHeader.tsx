import React from 'react'

export interface ArticleHeaderProps {
  category?: string
  priority?: 'urgent' | 'important'
}

/**
 * ArticleHeader Component
 * 
 * PURPOSE: Displays article category and priority badges
 * 
 * WHEN TO USE:
 * - News article headers
 * - Knowledge article headers
 * - Any article needing category/priority display
 * 
 * PROPS:
 * - category: Article category name
 * - priority: Priority level (urgent/important)
 * 
 * USAGE:
 * <ArticleHeader 
 *   category="THÔNG BÁO"
 *   priority="urgent"
 * />
 */
export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ 
  category, 
  priority 
}) => {
  return (
    <div className="news-header">
      <div className="news-category">
        <span className="category-badge">{category || 'THÔNG BÁO'}</span>
      </div>
      <div className="news-priority">
        {priority === 'urgent' && (
          <span className="priority-badge urgent">KHẨN CẤP</span>
        )}
        {priority === 'important' && (
          <span className="priority-badge important">QUAN TRỌNG</span>
        )}
      </div>
    </div>
  )
}
