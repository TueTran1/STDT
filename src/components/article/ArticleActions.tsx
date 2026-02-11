import React from 'react'
import { Save, Plus, Trash2, Eye } from 'lucide-react'
import { useArticlePermissions } from '../../hooks/useArticlePermissions'
import type { Article, ContentType, ArticleMode } from './ArticleShell'

interface ArticleActionsProps {
  article?: Article
  mode: ArticleMode
  type: ContentType
  formData: Partial<Article>
  onCreate?: () => void
  onSave?: (status: 'saved' | 'published') => void
  onDelete?: () => void
}

/**
 * ArticleActions Component
 * 
 * PURPOSE: Role-based action buttons for articles
 * 
 * USAGE:
 * <ArticleActions 
 *   article={article} 
 *   mode="edit" 
 *   type="news" 
 *   onSave={handleSave} 
 * />
 */
export const ArticleActions: React.FC<ArticleActionsProps> = ({
  article,
  mode,
  formData,
  onCreate,
  onSave,
  onDelete
}) => {
  const { canCreate, canDelete } = useArticlePermissions(article)

  const handleSaveDraft = () => {
    onSave?.('saved')
  }

  const handlePublish = () => {
    onSave?.('published')
  }

  const handlePreview = () => {
    // Preview functionality would go here
  }

  // Editor actions in edit mode
  if (mode === 'edit' && canCreate) {
    return (
      <div className="article-actions-editor">
        <div className="editor-field checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={() => {
                // This would be handled by parent component
              }}
            />
            Nổi bật
          </label>
        </div>

        <div className="editor-actions">
          <button 
            onClick={handleSaveDraft}
            className="button-secondary"
            disabled={!formData.title?.trim() || !formData.content?.trim()}
          >
            <Save size={16} />
            Lưu nháp
          </button>
          
          <button 
            onClick={handlePublish}
            className="button-primary"
            disabled={!formData.title?.trim() || !formData.content?.trim()}
          >
            <Save size={16} />
            Công bố
          </button>

          <button 
            onClick={handlePreview}
            className="button-tertiary"
            disabled={!formData.title?.trim() || !formData.content?.trim()}
          >
            <Eye size={16} />
            Xem trước
          </button>
        </div>
      </div>
    )
  }

  // Admin delete action in read mode
  if (mode === 'read' && canDelete && article) {
    return (
      <div className="article-actions-admin">
        <button 
          onClick={onDelete}
          className="button-danger"
          title="Xóa bài viết"
        >
          <Trash2 size={16} />
          Xóa bài viết
        </button>
      </div>
    )
  }

  // Create new button for listing pages
  if (mode === 'read' && canCreate && onCreate) {
    return (
      <div className="article-actions-create">
        <button 
          onClick={onCreate}
          className="button-primary"
          title="Tạo bài viết mới"
        >
          <Plus size={16} />
          Tạo mới
        </button>
      </div>
    )
  }

  return null
}

export default ArticleActions
