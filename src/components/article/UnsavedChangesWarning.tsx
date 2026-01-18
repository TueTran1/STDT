import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import './UnsavedChangesWarning.css'

interface UnsavedChangesWarningProps {
  hasUnsavedChanges: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

/**
 * UnsavedChangesWarning Component
 * 
 * PURPOSE: Warn users about unsaved changes before navigation
 * 
 * FEATURES:
 * - Clear warning message
 * - Save, Discard, Cancel options
 * - Modal overlay
 */
export const UnsavedChangesWarning: React.FC<UnsavedChangesWarningProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  onCancel
}) => {
  if (!hasUnsavedChanges) return null

  return (
    <div className="unsaved-changes-overlay">
      <div className="unsaved-changes-modal">
        <div className="modal-header">
          <AlertTriangle size={24} className="warning-icon" />
          <h3>Thay đổi chưa được lưu</h3>
          <button 
            onClick={onCancel}
            className="close-button"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <p>
            Bạn có những thay đổi chưa được lưu. Bạn muốn làm gì?
          </p>
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={onSave}
            className="save-button"
          >
            Lưu thay đổi
          </button>
          <button 
            onClick={onDiscard}
            className="discard-button"
          >
            Bỏ qua thay đổi
          </button>
          <button 
            onClick={onCancel}
            className="cancel-button"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesWarning
