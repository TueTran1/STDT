import React, { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { deleteArticle, type ContentType, type Article } from '../../services/contentService'
import { PermissionService } from '../../services/permissionService'
import './AdminDeleteControls.css'

interface AdminDeleteControlsProps {
  article: Article
  type: ContentType
  onDelete?: () => void
  compact?: boolean
}

/**
 * AdminDeleteControls Component
 * 
 * PURPOSE: Admin-only delete controls for articles
 * 
 * FEATURES:
 * - Only visible to admins
 * - Confirmation modal with article details
 * - Serious, deliberate UX
 * - Irreversible deletion warning
 */
export const AdminDeleteControls: React.FC<AdminDeleteControlsProps> = ({
  article,
  type,
  onDelete,
  compact = false
}) => {
  const { user } = useAuth()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only show for admins
  if (!user || user.role !== 'admin') {
    return null
  }

  // Permission validation
  const serviceUser = {
    id: user.uid,
    username: user.displayName || user.email || 'unknown',
    role: 'admin' as const
  }

  const deletePermission = PermissionService.validateDelete(serviceUser, article)
  if (!deletePermission.allowed) {
    return null
  }

  const handleDeleteClick = () => {
    setShowConfirmModal(true)
    setError(null)
  }

  const handleConfirmDelete = async () => {
    if (!article.id) return

    try {
      setIsDeleting(true)
      setError(null)

      await deleteArticle(type, article.id, user.uid, 'admin')
      
      setShowConfirmModal(false)
      setIsDeleting(false)
      onDelete?.()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article')
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmModal(false)
    setError(null)
  }

  // Compact version (for cards)
  if (compact) {
    return (
      <div className="admin-delete-controls-compact">
        <button
          onClick={handleDeleteClick}
          className="delete-button-compact"
          title="Xóa bài viết này"
          disabled={isDeleting}
        >
          <Trash2 size={16} />
        </button>

        {showConfirmModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <div className="modal-header">
                <AlertTriangle size={24} className="warning-icon" />
                <h3>Xác nhận xóa bài viết</h3>
                <button 
                  onClick={handleCancelDelete}
                  className="close-button"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="article-info">
                  <h4>{article.title}</h4>
                  <p className="article-meta">
                    {article.author?.displayName} • {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                {error && (
                  <div className="error-message">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="warning-message">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>CẢNH BÁO QUAN TRỌNG:</strong>
                    <p>Hành động này sẽ xóa vĩnh viễn bài viết "{article.title}".</p>
                    <p>Bài viết đã xóa không thể khôi phục.</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={handleCancelDelete}
                  className="cancel-button"
                  disabled={isDeleting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="confirm-delete-button"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full version (for article detail page)
  return (
    <div className="admin-delete-controls-full">
      <button
        onClick={handleDeleteClick}
        className="delete-button-full"
        title="Xóa bài viết này"
      >
        <Trash2 size={18} />
        <span>Xóa bài viết</span>
      </button>

      {showConfirmModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <AlertTriangle size={32} className="warning-icon" />
              <h3>XÁC NHẬN XÓA BÀI VIẾT</h3>
              <button 
                onClick={handleCancelDelete}
                className="close-button"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="article-info">
                <h2>{article.title}</h2>
                <div className="article-details">
                  <p><strong>Tác giả:</strong> {article.author?.displayName}</p>
                  <p><strong>Loại:</strong> {type === 'news' ? 'Tin tức' : 'Kiến thức'}</p>
                  <p><strong>Trạng thái:</strong> {article.status === 'published' ? 'Đã công bố' : 'Đã lưu'}</p>
                  <p><strong>Ngày tạo:</strong> {new Date(article.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              
              {error && (
                <div className="error-message">
                  <AlertTriangle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="warning-section">
                <div className="warning-icon-large">
                  <AlertTriangle size={48} />
                </div>
                <div className="warning-text">
                  <h4>HÀNH ĐỘNG KHÔNG THỂ KHÔI PHỤC</h4>
                  <ul>
                    <li>Bài viết "<strong>{article.title}</strong>" sẽ bị xóa vĩnh viễn</li>
                    <li>Tất cả dữ liệu, bình luận, và thống kê sẽ mất</li>
                    <li>Không có cách nào để khôi phục bài viết đã xóa</li>
                    <li>Hành động này sẽ được ghi nhận trong hệ thống</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={handleCancelDelete}
                className="cancel-button-large"
                disabled={isDeleting}
              >
                <X size={20} />
                <span>Hủy</span>
              </button>
              <button
                onClick={handleConfirmDelete}
                className="confirm-delete-button-large"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    <span>Xóa vĩnh viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDeleteControls
