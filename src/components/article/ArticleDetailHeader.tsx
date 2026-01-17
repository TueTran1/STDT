import React from 'react'

export interface ArticleDetailHeaderProps {
  icon: string
  label: string
  author?: {
    displayName?: string
  }
  createdAt: Date | string
  title: string
  featured?: boolean
}

/**
 * ArticleDetailHeader Component
 * 
 * PURPOSE: Header section for article detail pages
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with metadata
 * 
 * PROPS:
 * - icon: Section icon (emoji)
 * - label: Section label text
 * - author: Author information
 * - createdAt: Publication date
 * - title: Article title
 * - featured: Whether article is featured
 * 
 * USAGE:
 * <ArticleDetailHeader 
 *   icon="📚"
 *   label="KIẾN THỨC"
 *   author={article.author}
 *   createdAt={article.createdAt}
 *   title={article.title}
 *   featured={article.featured}
 * />
 */
export const ArticleDetailHeader: React.FC<ArticleDetailHeaderProps> = ({
  icon,
  label,
  author,
  createdAt,
  title,
  featured
}) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('vi-VN')
  }

  return (
    <div className="bg-gradient-to-r from-red-800/90 to-red-900/90 border-l-4 border-yellow-500 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-2xl">{icon}</span>
          <span className="text-xl font-bold text-yellow-300">{label}</span>
        </div>
        <div className="flex items-center space-x-6 text-yellow-200">
          <div className="flex items-center space-x-2">
            <span>👤</span>
            <span>{author?.displayName || 'Lữ đoàn83'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-yellow-300 mb-4">{title}</h1>
      {featured && (
        <div className="inline-block px-3 py-1 bg-yellow-500 text-red-900 rounded font-bold text-sm mb-4">
          ⭐ NỔI BẬT
        </div>
      )}
    </div>
  )
}
