import React from 'react'

interface ArticleBodyProps {
  content: string
  mode: 'read' | 'edit'
  onChange?: (content: string) => void
}

/**
 * ArticleBody Component
 * 
 * PURPOSE: Content container with read/edit mode switching
 * 
 * USAGE:
 * <ArticleBody content="Article content" mode="read" />
 * <ArticleBody content="Article content" mode="edit" onChange={handleChange} />
 */
export const ArticleBody: React.FC<ArticleBodyProps> = ({
  content,
  mode,
  onChange
}) => {
  if (mode === 'edit') {
    return (
      <div className="article-body-editor">
        <label>Nội dung</label>
        <textarea
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Nhập nội dung bài viết..."
          className="content-textarea"
          rows={20}
        />
        <small>Hỗ trợ HTML. Ví dụ: &lt;p&gt;Nội dung&lt;/p&gt;</small>
      </div>
    )
  }

  const processedContent = content?.replace(/\n/g, '<br />') || 'Nội dung đang cập nhật...'

  return (
    <div className="article-body-display">
      <div className="article-content-panel">
        <div 
          className="article-text"
          dangerouslySetInnerHTML={{ 
            __html: processedContent
          }} 
        />
      </div>
    </div>
  )
}

export default ArticleBody
