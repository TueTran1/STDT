import React from 'react'
import { Save, Newspaper, BookOpen, Plus } from 'lucide-react'
import './ArticleListingControls.css'

interface ArticleListingControlsProps {
  mode: 'published' | 'saved'
  onToggleMode: () => void
  showSavedButton: boolean
  showCreateButton: boolean
  onCreateNew: () => void
  type: 'news' | 'knowledge'
  loading?: boolean
}

/**
 * ArticleListingControls Component
 * 
 * PURPOSE: Top control bar for article listing pages
 * 
 * FEATURES:
 * - Saved/Published toggle button (editor only)
 * - Create New button (editor only)
 * - Mode indicator
 * - Loading state handling
 */
export const ArticleListingControls: React.FC<ArticleListingControlsProps> = ({
  mode,
  onToggleMode,
  showSavedButton,
  showCreateButton,
  onCreateNew,
  type,
  loading = false
}) => {
  const getTypeLabel = () => {
    return type === 'news' ? 'TIN TỨC' : 'KIẾN THỨC'
  }

  const getModeLabel = () => {
    return mode === 'saved' ? 'ĐÃ LƯU' : 'ĐÃ CÔNG BỐ'
  }

  const getModeIcon = () => {
    return mode === 'saved' ? <Save size={16} /> : <Newspaper size={16} />
  }

  return (
    <div className="article-listing-controls">
      <div className="controls-left">
        <h2 className="page-title">
          {type === 'news' ? <Newspaper size={24} /> : <BookOpen size={24} />}
          {getTypeLabel()}
        </h2>
        
        <div className="mode-indicator">
          {getModeIcon()}
          <span>{getModeLabel()}</span>
        </div>
      </div>

      <div className="controls-right">
        {/* Saved/Published Toggle Button - Editor Only */}
        {showSavedButton && (
          <button
            onClick={onToggleMode}
            disabled={loading}
            className={`toggle-button ${mode === 'saved' ? 'active' : ''}`}
            title={`Chuyển sang ${mode === 'saved' ? 'đã công bố' : 'đã lưu'}`}
          >
            <Save size={16} />
            <span>Đã lưu</span>
          </button>
        )}

        {/* Create New Button - Editor Only */}
        {showCreateButton && (
          <button
            onClick={onCreateNew}
            disabled={loading}
            className="create-button"
            title={`Tạo ${getTypeLabel().toLowerCase()} mới`}
          >
            <Plus size={16} />
            <span>Tạo mới</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ArticleListingControls
