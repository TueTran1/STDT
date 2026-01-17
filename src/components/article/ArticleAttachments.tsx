import React from 'react'

export interface Attachment {
  type: 'pdf' | 'image' | 'document'
  name: string
}

export interface ArticleAttachmentsProps {
  attachments?: Attachment[]
  maxAttachments?: number
}

/**
 * ArticleAttachments Component
 * 
 * PURPOSE: Displays article attachments with icons and overflow counter
 * 
 * WHEN TO USE:
 * - News article attachments
 * - Knowledge article attachments
 * - Any article with file attachments
 * 
 * PROPS:
 * - attachments: Array of attachment objects
 * - maxAttachments: Maximum attachments to display (default: 3)
 * 
 * USAGE:
 * <ArticleAttachments 
 *   attachments={attachmentsArray}
 *   maxAttachments={3}
 * />
 */
export const ArticleAttachments: React.FC<ArticleAttachmentsProps> = ({ 
  attachments = [], 
  maxAttachments = 3 
}) => {
  if (!attachments || attachments.length === 0) {
    return null
  }

  const displayAttachments = attachments.slice(0, maxAttachments)
  const remainingCount = attachments.length - maxAttachments

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄'
      case 'image': return '🖼️'
      case 'document': return '📝'
      default: return '📎'
    }
  }

  return (
    <div className="news-attachments">
      <div className="attachments-label">Tệp đính kèm:</div>
      <div className="attachments-grid">
        {displayAttachments.map((attachment: Attachment, index: number) => (
          <div key={index} className="attachment-item">
            <div className="attachment-icon">
              {getAttachmentIcon(attachment.type)}
            </div>
            <div className="attachment-name">{attachment.name}</div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="attachment-more">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}
