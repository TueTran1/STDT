import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArticleShell } from './ArticleShell'
import { useArticleEditor } from '../../hooks/useArticleEditor'
import type { ContentType } from './ArticleShell'

/**
 * ArticleEditorPage Component
 * 
 * PURPOSE: Unified create/edit page for articles
 * 
 * FEATURES:
 * - Same visual structure as ArticlePage
 * - Real-time editing experience
 * - Save and Publish actions
 * - Unsaved changes detection
 */
export const ArticleEditorPage: React.FC = () => {
  const { id, type } = useParams<{ id?: string; type: string }>()
  const navigate = useNavigate()
  
  // Determine mode and content type
  const mode = id ? 'update' : 'create'
  const contentType = type as ContentType
  
  // Use the centralized editor hook
  const {
    state,
    saveDraft,
    publishArticle,
    canNavigateAway,
    isSaving,
    hasError,
    hasUnsavedChanges
  } = useArticleEditor(contentType, mode)

  // Handle navigation away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!canNavigateAway()) {
        e.preventDefault()
        e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời đi?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [canNavigateAway])

  // Handle cancel action
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?')) {
        navigate(`/${contentType}`)
      }
    } else {
      navigate(`/${contentType}`)
    }
  }

  // Handle save action
  const handleSave = async (_data: any, status: 'saved' | 'published') => {
    if (status === 'saved') {
      await saveDraft()
    } else {
      await publishArticle()
    }
  }

  // Loading state
  if (isSaving) {
    return (
      <ArticleShell
        mode="edit"
        type={contentType}
        loading={true}
        article={undefined}
        onCancel={handleCancel}
      />
    )
  }

  // Error state
  if (hasError) {
    return (
      <ArticleShell
        mode="edit"
        type={contentType}
        error={state.error || undefined}
        article={undefined}
        onCancel={handleCancel}
      />
    )
  }

  // Main editor interface
  return (
    <ArticleShell
      mode="edit"
      type={contentType}
      article={undefined} // Create mode - no existing article
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}

export default ArticleEditorPage
