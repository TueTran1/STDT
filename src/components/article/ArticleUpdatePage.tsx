import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArticleShell } from './ArticleShell'
import type { ContentType } from './ArticleShell'

interface ArticleUpdatePageProps {
  type: ContentType
}

/**
 * ArticleUpdatePage Component
 * 
 * PURPOSE: Update page for saved articles only
 * 
 * RULES:
 * - Only saved articles can be updated
 * - Only article owners can update
 * - Published articles are read-only
 * - Admins cannot access edit UI
 */
export const ArticleUpdatePage: React.FC<ArticleUpdatePageProps> = ({ type }) => {
  const navigate = useNavigate()
  
  // This would be integrated with useArticleUpdate hook
  // For now, showing the structure
  const handleSave = async (_data: any, _status: 'saved' | 'published') => {
        // Integration with useArticleUpdate would go here
  }

  const handleCancel = () => {
    navigate(`/${type}`)
  }

  return (
    <div className="article-update-page">
      <ArticleShell
        mode="edit"
        type={type}
        article={undefined} // Would be populated by useArticleUpdate
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default ArticleUpdatePage
