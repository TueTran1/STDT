import React, { useState } from 'react'
import { X } from 'lucide-react'
import { 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { createUser } from '../../services/firestoreUserService'
import { useAuth } from '../../contexts/AuthContext'

// Define types locally to avoid import issues
interface CreateUserInput {
  displayName: string
  email: string
  password: string
  role: 'admin' | 'editor' // Only real Firestore roles
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
  const [formData, setFormData] = useState<CreateUserInput>({
    displayName: '',
    email: '',
    password: '',
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

    if (!formData.password || formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
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
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      
      const firebaseUser = userCredential.user
      
      // Step 2: Update Firebase Auth profile with display name
      await updateProfile(firebaseUser, {
        displayName: formData.displayName
      })
      
      // Step 3: Create user profile in Firestore with role assignment
      await createUser({
        email: formData.email,
        password: formData.password, // Will be hashed in the service
        displayName: formData.displayName,
        role: formData.role, // Role assigned through Firestore write
        isActive: formData.isActive
      })
      
      // Step 4: Sign out the newly created user (admin stays signed in)
      // Note: createUserWithEmailAndPassword signs in the new user, 
      // so we need to handle this carefully in a real admin flow
      // For now, we'll let the admin know the user was created successfully
      
      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        displayName: '',
        email: '',
        password: '',
        role: 'editor',
        isActive: true
      })
    } catch (err) {
      console.error('User creation error:', err)
      
      // Handle specific Firebase Auth errors
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          setError('Email này đã được sử dụng. Vui lòng chọn email khác.')
        } else if (err.message.includes('auth/weak-password')) {
          setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.')
        } else if (err.message.includes('auth/invalid-email')) {
          setError('Email không hợp lệ.')
        } else {
          setError(err.message || 'Failed to create user')
        }
      } else {
        setError('Failed to create user')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateUserInput, value: string | boolean) => {
    setFormData((prev: CreateUserInput) => ({
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
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Nhập mật khẩu"
              minLength={6}
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
