import React from 'react'
import { AlertTriangle, Save, X, ArrowLeft } from 'lucide-react'
import { useUnsavedChangesProtection } from '../../hooks/useUnsavedChangesProtection'
import './UnsavedChangesModal.css'

interface UnsavedChangesModalProps {
  isOpen: boolean
  hasUnsavedChanges: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
  pendingNavigation?: string
}

/**
 * UnsavedChangesModal Component
 * 
 * PURPOSE: Modal for handling unsaved changes during navigation
 * 
 * FEATURES:
 * - Clear warning about unsaved changes
 * - Save, Discard, Cancel options
 * - Navigation protection
 * - Military theme styling
 */
export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  hasUnsavedChanges,
  onSave,
  onDiscard,
  onCancel,
  pendingNavigation
}) => {
  const {
    showWarning,
    pendingNavigation,
    confirmNavigation,
    cancelNavigation
  } = useUnsavedChangesProtection(hasUnsavedChanges)

  const handleSave = () => {
    onSave()
    confirmNavigation()
  }

  const handleDiscard = () => {
    onDiscard()
    confirmNavigation()
  }

  const handleCancel = () => {
    onCancel()
    cancelNavigation()
  }

  if (!isOpen) return null

  return (
    <div className="unsaved-changes-modal-overlay">
      <div className="unsaved-changes-modal">
        <div className="modal-header">
          <AlertTriangle size={32} className="warning-icon" />
          <h3>Thay đổi chưa được lưu</h3>
          <button 
            onClick={handleCancel}
            className="close-button"
            title="Đóng"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="warning-message">
            <AlertTriangle size={24} />
            <div className="warning-text">
              <h4>Cảnh báo:</h4>
              <p>Bạn có những thay đổi chưa được lưu sẽ bị mất nếu bạn rời đi.</p>
            </div>
          </div>
          
          {pendingNavigation && (
            <div className="navigation-info">
              <ArrowLeft size={20} />
              <span>Bạn đang cố gắng chuyển đến: <strong>{pendingNavigation}</strong></span>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={handleSave}
            className="save-button"
            title="Lưu thay đổi"
          >
            <Save size={20} />
            <span>Lưu thay đổi</span>
          </button>
          
          <button 
            onClick={handleDiscard}
            className="discard-button"
            title="Bỏ qua thay đổi"
          >
            <X size={20} />
            <span>Bỏ qua thay đổi</span>
          </button>
          
          <button 
            onClick={handleCancel}
            className="cancel-button"
            title="Hủy thao tác"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesModal
