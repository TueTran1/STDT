import React from 'react'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useContentPermission } from '../hooks/useContentPermissions'
import type { ContentDocument } from '../hooks/useContentPermissions'
import './ContentActions.css'

interface ContentActionsProps {
  document?: ContentDocument
  onCreate?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

/**
 * ContentActions Component
 * 
 * Renders action buttons (Create, Edit, Delete) based on user permissions
 * Uses useContentPermission hook to determine what actions are available
 */
export const ContentActions: React.FC<ContentActionsProps> = ({
  document,
  onCreate,
  onEdit,
  onDelete,
  className = ''
}) => {
  const { canCreate, canUpdate, canDelete, isOwner } = useContentPermission(document)

  return (
    <div className={`content-actions ${className}`}>
      {/* Create Button - shown for editors only */}
      {canCreate && onCreate && (
        <button
          onClick={onCreate}
          className="content-action-button create"
          title="Create new content"
        >
          <Plus size={16} />
          <span>Tạo mới</span>
        </button>
      )}

      {/* Edit Button - shown for document owners only */}
      {canUpdate && onEdit && (
        <button
          onClick={onEdit}
          className="content-action-button edit"
          title="Edit content"
        >
          <Edit size={16} />
          <span>Chỉnh sửa</span>
        </button>
      )}

      {/* Delete Button - shown for admins only */}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          className="content-action-button delete"
          title="Delete content"
        >
          <Trash2 size={16} />
          <span>Xóa</span>
        </button>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="permission-debug">
          <small>
            Permissions: Create={canCreate ? '✓' : '✗'} | 
            Update={canUpdate ? '✓' : '✗'} | 
            Delete={canDelete ? '✓' : '✗'} | 
            Owner={isOwner ? '✓' : '✗'}
          </small>
        </div>
      )}
    </div>
  )
}

export default ContentActions
