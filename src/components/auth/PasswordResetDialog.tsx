import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../lib/firebase'

interface PasswordResetDialogProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  isOpen,
  onClose,
  email
}) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResetPassword = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.')
    } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
        setError('Không tìm thấy người dùng với email này.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ.')
      } else {
        setError('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-yellow-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-800">Đặt lại mật khẩu</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700">
            Gửi email đặt lại mật khẩu cho: <span className="font-semibold">{email}</span>
          </p>
        </div>

        {message && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            disabled={loading}
          >
            Đóng
          </button>
          <button
            onClick={handleResetPassword}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi email đặt lại'}
          </button>
        </div>
      </div>
    </div>
  )
}
