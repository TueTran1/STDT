import React, { useState } from 'react'
import { X } from 'lucide-react'
import { createUserSecure, type CreateUserRequest, type CreateUserResponse } from '../../services/secureUserService'
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

      const result = await createUserSecure(createUserRequest)
      const response = result.data as CreateUserResponse

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
            
      // Handle Cloud Function errors
      if (err.code === 'unavailable' || err.code === 'deadline-exceeded') {
        setError('Lỗi mạng. Vui lòng thử lại sau.')
      } else if (err.code === 'permission-denied') {
        setError('Bạn không có quyền thực hiện thao tác này.')
      } else if (err.code === 'already-exists') {
        setError('Email này đã được sử dụng. Vui lòng chọn email khác.')
      } else if (err.code === 'invalid-argument') {
        setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-yellow-600">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ tên
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Nhập họ tên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="nhập email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'editor')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Kích hoạt tài khoản
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
