import React from 'react'
import { MilitaryPageLayout } from '../layout'
import { ArticleTypeHeader } from './ArticleTypeHeader'
import { ArticleTitle } from './ArticleTitle'
import { ArticleMetaBar } from './ArticleMetaBar'
import { ArticleBody } from './ArticleBody'
import { ArticleSummary } from './ArticleSummary'
import { ArticleTags } from './ArticleTags'
import { ArticleActions } from './ArticleActions'
import { LoadingState, ErrorState } from '../ui'
import { useAuth } from '../../contexts/AuthContext'
import type { NewsArticle, KnowledgeArticle } from '../../types/firestore'
import './ArticleShell.css'

export type Article = NewsArticle | KnowledgeArticle
export type ArticleMode = 'read' | 'edit'
export type ContentType = 'news' | 'knowledge'

interface ArticleShellProps {
  article?: Article
  mode: ArticleMode
  type: ContentType
  loading?: boolean
  error?: string | null
  onCreate?: () => void
  onSave?: (data: Partial<Article>, status: 'saved' | 'published') => void
  onDelete?: () => void
  onCancel?: () => void
}

/**
 * ArticleShell Component
 * 
 * PURPOSE: Shared visual container for both read and edit modes
 * 
 * RESPONSIBILITIES:
 * - Render same visual structure for both modes
 * - Delegate to read-only or editable components based on mode
 * - Handle form state in edit mode
 * - Manage save/publish/delete actions
 * 
 * USAGE:
 * <ArticleShell
 *   article={articleData}
 *   mode="edit"
 *   type="news"
 *   onSave={handleSave}
 * />
 */
export const ArticleShell: React.FC<ArticleShellProps> = ({
  article,
  mode,
  type,
  loading = false,
  error = null,
  onCreate,
  onSave,
  onDelete,
  onCancel
}) => {
  const { user } = useAuth()

  // Handle form data in edit mode
  const [formData, setFormData] = React.useState<Partial<Article>>(
    article || {
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      featured: false,
      status: 'saved',
      category: type === 'news' ? 'general' : 'quan-su',
      author: {
        uid: user?.uid || '',
        displayName: user?.displayName || '',
        photoURL: ''
      }
    }
  )

  // Update form data when article changes (edit mode)
  React.useEffect(() => {
    if (article && mode === 'edit') {
      setFormData(article)
    }
  }, [article, mode])

  // Handle field changes in edit mode
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle save action
  const handleSave = (status: 'saved' | 'published') => {
    if (onSave) {
      onSave(formData, status)
    }
  }

  // Get page title based on mode and type
  const getPageTitle = () => {
    const typeLabel = type === 'news' ? 'TIN TỨC' : 'KIẾN THỨC'
    
    if (mode === 'edit') {
      return `Chỉnh sửa ${typeLabel}`
    }
    
    return typeLabel
  }

  // Loading state
  if (loading) {
    return (
      <MilitaryPageLayout 
        title={<h2>{getPageTitle()}</h2>}
        showTopIcons={false}
      >
        <LoadingState message="Đang tải..." />
      </MilitaryPageLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MilitaryPageLayout 
        title={<h2>Lỗi</h2>}
        showTopIcons={false}
      >
        <ErrorState 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </MilitaryPageLayout>
    )
  }

  return (
    <MilitaryPageLayout 
      title={<h2>{getPageTitle()}</h2>}
      showTopIcons={true}
      customTopIcons={
        mode === 'edit' ? (
          <div className="editor-top-actions">
            {onCancel && (
              <button 
                onClick={onCancel}
                className="button-secondary"
              >
                Hủy
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="article-shell">
        {/* Article Type Header */}
        <ArticleTypeHeader 
          type={type}
          mode={mode}
        />

        {/* Article Title */}
        <ArticleTitle 
          title={formData.title || ''}
          mode={mode}
          onChange={(title: string) => handleFieldChange('title', title)}
        />

        {/* Article Meta Bar */}
        <ArticleMetaBar 
          article={formData}
          mode={mode}
          type={type}
          onFieldChange={handleFieldChange}
        />

        {/* Article Body */}
        <ArticleBody 
          content={formData.content || ''}
          mode={mode}
          onChange={(content: string) => handleFieldChange('content', content)}
        />

        {/* Article Summary (Knowledge Only) */}
        {type === 'knowledge' && (
          <ArticleSummary 
            summary={(formData as any)?.summary || ''}
            mode={mode}
            onChange={(summary: string) => handleFieldChange('summary', summary)}
          />
        )}

        {/* Article Tags */}
        <ArticleTags 
          tags={formData.tags || []}
          mode={mode}
          onChange={(tags: string[]) => handleFieldChange('tags', tags)}
        />

        {/* Article Actions */}
        <ArticleActions 
          article={article}
          mode={mode}
          type={type}
          formData={formData}
          onCreate={onCreate}
          onSave={handleSave}
          onDelete={onDelete}
        />
      </div>
    </MilitaryPageLayout>
  )
}

export default ArticleShell
