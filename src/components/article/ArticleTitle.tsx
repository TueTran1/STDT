import React from 'react'

interface ArticleTitleProps {
  title: string
  mode: 'read' | 'edit'
  onChange?: (title: string) => void
}

/**
 * ArticleTitle Component
 * 
 * PURPOSE: Unified title display and editing
 * 
 * USAGE:
 * <ArticleTitle title="Article Title" mode="read" />
 * <ArticleTitle title="Article Title" mode="edit" onChange={handleChange} />
 */
export const ArticleTitle: React.FC<ArticleTitleProps> = ({
  title,
  mode,
  onChange
}) => {
  if (mode === 'edit') {
    return (
      <div className="article-title-editor">
        <input
          type="text"
          value={title}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Nhập tiêu đề bài viết..."
          className="title-input"
        />
      </div>
    )
  }

  return (
    <div className="article-title-display">
      <h1 className="article-title">{title}</h1>
    </div>
  )
}

export default ArticleTitle
