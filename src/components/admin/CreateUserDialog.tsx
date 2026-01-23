import React, { useState } from 'react'
import { X } from 'lucide-react'
import { createUserClient, type CreateUserRequest, type CreateUserResponse } from '../../services/clientUserService'
import { useAuth } from '../../contexts/AuthContext'

// Define types locally to avoid import issues
interface CreateUserForm {
  displayName: string
  email: string
  role: 'admin' | 'editor'
  isActive: boolean
}

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, hasRole } = useAuth()
  const [formData, setFormData] = useState<CreateUserForm>({
    displayName: '',
    email: '',
    role: 'editor',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate admin permissions
    if (!user || !hasRole('admin')) {
      setError('Bạn không có quyền tạo người dùng mới.')
      setLoading(false)
      return
    }

    // Validate form fields
    if (!formData.displayName.trim()) {
      setError('Vui lòng nhập họ tên.')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email.')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ.')
      setLoading(false)
      return
    }

    try {
      // Call secure backend function for user creation
      const createUserRequest: CreateUserRequest = {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        isActive: formData.isActive
      }

      const response = await createUserClient(createUserRequest)

      if (response.success) {
        // User created successfully
        
        // Show success message with temporary password
        alert(
          `Người dùng đã được tạo thành công!\n\n` +
          `Email: ${response.email}\n` +
          `Mật khẩu tạm thởi: ${response.temporaryPassword}\n\n` +
          `Vui lòng lưu lại mật khẩu này và yêu cầu người dùng đổi mật khẩu khi đăng nhập lần đầu.`
        )

        onSuccess()
        onClose()
        
        // Reset form
        setFormData({
          displayName: '',
          email: '',
          role: 'editor',
          isActive: true
        })
      } else {
        setError(response.message || 'Failed to create user')
      }
    } catch (err: any) {
      // Handle client-side auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng. Vui lòng chọn email khác.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ.')
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Quá nhiều yêu cầu. Vui lòng thử lại sau.')
      } else {
        setError(err.message || 'Failed to create user')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateUserForm, value: string | boolean) => {
    setFormData((prev: CreateUserForm) => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-yellow-600"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '448px',
          width: '100%',
          margin: '0 16px',
          border: '2px solid #ffd700'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-800">Tạo người dùng mới</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-1">
              Họ tên
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border-2 border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
              placeholder="Nhập họ tên"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-1">
              Email
            </label>
            <input
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border-2 border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
              placeholder="nhập email"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-1">
              Vai trò
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'editor')}
              className="w-full px-3 py-2 border-2 border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="mr-2 w-4 h-4 text-red-600 border-yellow-600 rounded focus:ring-red-500"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-primary">
              Kích hoạt tài khoản
            </label>
          </div>

          {error && (
            <div className="text-primary text-sm bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-yellow-500 text-primary rounded-lg hover:bg-yellow-400 font-semibold transition-all"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="military-button px-6 py-3"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
