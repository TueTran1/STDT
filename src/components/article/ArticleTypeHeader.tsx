import React from 'react'
import { Newspaper, BookOpen, Landmark } from 'lucide-react'
import type { ContentType } from './ArticleShell'

interface ArticleTypeHeaderProps {
  type: ContentType
  mode: 'read' | 'edit'
}

/**
 * ArticleTypeHeader Component
 * 
 * PURPOSE: Display article type indicator (News/Knowledge)
 * 
 * USAGE:
 * <ArticleTypeHeader type="news" mode="read" />
 */
export const ArticleTypeHeader: React.FC<ArticleTypeHeaderProps> = ({
  type,
  mode
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'news':
        return {
          icon: <Newspaper size={24} />,
          label: 'TIN TỨC',
          color: 'blue'
        }
      case 'knowledge':
        return {
          icon: <BookOpen size={24} />,
          label: 'KIẾN THỨC',
          color: 'green'
        }
      default:
        return {
          icon: <Landmark size={24} />,
          label: 'BÀI VIẾT',
          color: 'gray'
        }
    }
  }

  const config = getTypeConfig()

  return (
    <div className="article-type-header">
      <div className="article-type-label">
        {config.icon}
        <span>{config.label}</span>
      </div>
    </div>
  )
}

export default ArticleTypeHeader
