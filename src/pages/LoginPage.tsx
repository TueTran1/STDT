import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HomeButton } from '../components/ui'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectPath') || 
        (user.role === 'admin' ? '/admin' : '/profile')
      sessionStorage.removeItem('redirectPath')
      navigate(redirectPath)
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await login(username, password)
      
      // Handle redirect using the response data
      const redirectPath = sessionStorage.getItem('redirectPath') || 
        (response.user.role === 'admin' ? '/admin' : '/profile')
      sessionStorage.removeItem('redirectPath')
      navigate(redirectPath)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="bronze-drum-pattern"></div>
      
      <div className="login-container">
        <h2 className="login-title">ĐĂNG NHẬP HỆ THỐNG</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              required
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="login-footer">
          <HomeButton variant="text" />
        </div>
      </div>
    </div>
  )
}
