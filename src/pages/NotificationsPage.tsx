import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useFirestore'
import { HomeButton, RefreshButton } from '../components/ui'
import { 
  AlertTriangle, 
  Zap, 
  Bell, 
  FileText, 
  Clipboard, 
  Settings, 
  Newspaper, 
  Landmark, 
  BookOpen, 
  Clock, 
  Pin, 
  Send, 
  Package, 
  Hourglass,
  Mail,
  BellRing,
  Smartphone
} from 'lucide-react'
import logoBrigade from '../assets/logo-brigade.png'

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: notifications, loading, error, refetch } = useNotifications()

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle size={16} />
      case 'high': return <Zap size={16} />
      case 'medium': return <Bell size={16} />
      case 'low': return <FileText size={16} />
      default: return <Clipboard size={16} />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Settings size={16} />
      case 'news': return <Newspaper size={16} />
      case 'tradition': return <Landmark size={16} />
      case 'knowledge': return <BookOpen size={16} />
      case 'reminder': return <Clock size={16} />
      default: return <Pin size={16} />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <Package size={16} />
      case 'delivered': return <Mail size={16} />
      case 'sent': return <Send size={16} />
      case 'pending': return <Hourglass size={16} />
      default: return <Clipboard size={16} />
    }
  }

  return (
    <div className="notifications-page">
      <div className="bronze-drum-pattern"></div>
      
      {/* Top Icons */}
      <div className="top-icons">
        <HomeButton variant="icon" />
         
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Header Emblem */}
        <div className="header-emblem">
          <img src={logoBrigade} alt="Lữ Đoàn 83" width="120" height="120" />
        </div>

        {/* Page Title */}
        <div className="page-title">
          <h2>TRUNG TÂM THÔNG BÁO</h2>
          <p>Nhận thông tin quan trọng từ Lữ đoàn</p>
        </div>

        {/* Content */}
        <div className="notifications-content">
          {loading ? (
            <div className="loading-state">
              <div className="military-spinner"></div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="icon-large">
                <AlertTriangle size={32} />
              </div>
              <h3>LỖI TẢI DỮ LIỆU</h3>
              <p>{error}</p>
              <RefreshButton onClick={refetch} variant="large" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="icon-large">
                <Bell size={32} />
              </div>
              <h3>CHƯA CÓ THÔNG BÁO</h3>
              <p>Không có thông báo nào. Hãy quay lại sau để xem các thông báo mới nhất từ Lữ đoàn.</p>
            </div>
          ) : (
            <div className="notifications-grid">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="notification-card clickable"
                  onClick={() => {
                    // Handle notification click - could mark as read or navigate to related content
                    if (notification.data?.actionUrl) {
                      navigate(notification.data.actionUrl)
                    }
                  }}
                >
                  {/* Card Header */}
                  <div className="notification-header">
                    <div className="notification-title">
                      <h3>{notification.title}</h3>
                      <div className="notification-badges">
                        <span className={`priority-badge priority-${notification.priority}`}>
                          {getPriorityIcon(notification.priority)} {notification.priority.toUpperCase()}
                        </span>
                        <span className={`type-badge type-${notification.type}`}>
                          {getTypeIcon(notification.type)} {notification.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="status-indicator">
                      {getStatusIcon(notification.status)}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="notification-message">
                    <p>{notification.message}</p>
                  </div>

                  {/* Additional Data */}
                  {notification.data && (
                    <div className="notification-data">
                      {notification.data.entityId && (
                        <div className="data-item">
                          <span className="data-label">Mã:</span>
                          <span className="data-value">{notification.data.entityId}</span>
                        </div>
                      )}
                      {notification.data.actionUrl && (
                        <button className="action-button">
                          XEM CHI TIẾT →
                        </button>
                      )}
                      {notification.data.metadata && (
                        <div className="metadata">
                          {Object.entries(notification.data.metadata).map(([key, value]) => (
                            <div key={key} className="metadata-item">
                              <span className="metadata-label">{key}:</span>
                              <span className="metadata-value">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="notification-footer">
                    <div className="channels">
                      <span className="channel-label">Kênh:</span>
                      {notification.channels?.inApp && <span className="channel"><Smartphone size={14} /></span>}
                      {notification.channels?.email && <span className="channel"><Mail size={14} /></span>}
                      {notification.channels?.push && <span className="channel"><BellRing size={14} /></span>}
                      {(!notification.channels || (!notification.channels.inApp && !notification.channels.email && !notification.channels.push)) && (
                        <span className="channel"><Bell size={14} /></span>
                      )}
                    </div>
                    <div className="timestamp">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('vi-VN') : 'Vừa mới'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
