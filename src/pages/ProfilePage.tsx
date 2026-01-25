import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HomeButton } from '../components/ui'
import { Bell, LogOut } from 'lucide-react'
import logoBrigade from '../assets/logo-brigade.png'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <div className="bronze-drum-pattern"></div>
      
      {/* Top Icons */}
      <div className="top-icons">
        <div></div>
        <HomeButton variant="icon" />
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Header Emblem */}
        <div className="header-emblem">
          <img src={logoBrigade} alt="Lữ Đoàn 83" width="120" height="120" />
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center border-4 border-yellow-500">
              <span className="text-3xl font-bold text-red-900">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-dark mb-2">
              {user?.displayName?.toUpperCase() || 'ĐỒNG CHÍ'}
            </h3>
            <p className="text-lg text-secondary mb-4">
              Quyền: {user?.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên'}
            </p>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">ID người dùng:</span>
              <span className="detail-value">{user?.uid}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tên đăng nhập:</span>
              <span className="detail-value">{user?.displayName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vai trò:</span>
              <span className="detail-value">{user?.role}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              onClick={handleLogout}
              className="military-button"
            >
              <div className="icon-large">
                <LogOut size={32} />
              </div>
              <div>ĐĂNG XUẤT</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
