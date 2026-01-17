import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BarChart3, Users, CheckCircle, X } from 'lucide-react'
import { ButtonGroup } from '../components/ui'
import { cssClasses, patterns } from '../styles/cssClasses'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Import the actual getUsers function
import { getUsers } from '../services/firestoreUserService'

// Mock mapping function for now
const mapUserDocumentToMappedUser = (user: any) => ({
  id: user.id || '1',
  displayName: user.displayName || 'Test User',
  email: user.email || 'test@example.com',
  role: 'EDITOR' as const,
  isActive: true,
  createdAt: new Date().toLocaleDateString(),
  name: user.displayName || 'Test User',
  status: 'ACTIVE' as const,
  createdDate: new Date().toLocaleDateString()
})

// Mock MappedUser type
type MappedUser = {
  id: string
  displayName: string
  email: string
  role: 'ADMIN' | 'EDITOR'
  isActive: boolean
  createdAt: string
  name: string
  status: 'ACTIVE' | 'LOCKED'
  createdDate: string
}

import { CreateUserDialog } from '../components/admin/CreateUserDialog'

// ========================================
//   DIALOG COMPONENTS
// ======================================== */

// User Dialog - Base dialog component
const UserDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-yellow-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// View User Dialog
const ViewUserDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  user: MappedUser
}> = ({ isOpen, onClose, user }) => (
  <UserDialog isOpen={isOpen} onClose={onClose} title="Thông tin người dùng">
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
        <p className="text-gray-900">{user.name}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p className="text-gray-900">{user.email}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
        <RoleBadge role={user.role} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <StatusBadge status={user.status} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
        <p className="text-gray-900">{user.createdDate}</p>
      </div>
    </div>
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
      >
        Đóng
      </button>
    </div>
  </UserDialog>
)

// Confirm Action Dialog
const ConfirmActionDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  cancelText: string
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => (
  <UserDialog isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-gray-700 mb-6">{message}</p>
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        {confirmText}
      </button>
    </div>
  </UserDialog>
)

// Change Role Dialog
const ChangeRoleDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: (newRole: 'ADMIN' | 'EDITOR') => void
  currentRole: 'ADMIN' | 'EDITOR' 
  userName: string
}> = ({ isOpen, onClose, onConfirm, currentRole, userName }) => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EDITOR'>(currentRole)

  const handleConfirm = () => {
    onConfirm(selectedRole)
    onClose()
  }

  return (
    <UserDialog isOpen={isOpen} onClose={onClose} title="Thay đổi vai trò">
      <p className="text-gray-700 mb-4">
        Chọn vai trò mới cho: <span className="font-semibold">{userName}</span>
      </p>
      <div className="space-y-2">
        {(['ADMIN', 'EDITOR'] as const).map(role => (
          <label key={role} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="role"
              value={role}
              checked={selectedRole === role}
              onChange={(e) => setSelectedRole(e.target.value as 'ADMIN' | 'EDITOR' )}
              className="text-red-600"
            />
            <RoleBadge role={role} />
          </label>
        ))}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Hủy
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Cập nhật
        </button>
      </div>
    </UserDialog>
  )
}

// Dashboard Card - Base container for all dashboard elements
const DashboardCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${cssClasses.contentPanel} ${className}`}>
    {children}
  </div>
)

// Dashboard Metric - Individual metric display
const DashboardMetric: React.FC<{
  value: string | number
  label: string
  sublabel?: string
}> = ({ value, label, sublabel }) => (
  <DashboardCard>
    <div className={cssClasses.metricNumber}>{value}</div>
    <div className={cssClasses.metricLabel}>{label}</div>
    {sublabel && <div className={cssClasses.metricSublabel}>{sublabel}</div>}
  </DashboardCard>
)

// Dashboard Section - Section container with title
const DashboardSection: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <DashboardCard>
    <h3 className={cssClasses.text2xl + ' ' + cssClasses.fontBold + ' ' + cssClasses.textPrimary + ' ' + cssClasses.mb6}>
      {title}
    </h3>
    {children}
  </DashboardCard>
)

// Dashboard Status Row - Status indicator with icon
const DashboardStatusRow: React.FC<{
  label: string
  value: string
  icon?: React.ReactNode
}> = ({ label, value, icon }) => (
  <div className={cssClasses.statusRow}>
    <span className={cssClasses.textSecondary + ' ' + cssClasses.fontMedium}>{label}:</span>
    <span className={cssClasses.statusSuccess}>
      {icon && <span className="mr-2">{icon}</span>}
      {value}
    </span>
  </div>
)

// Dashboard Chart Card - Chart container with title
const DashboardChartCard: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <DashboardCard>
    <h3 className={cssClasses.text2xl + ' ' + cssClasses.fontBold + ' ' + cssClasses.textPrimary + ' ' + cssClasses.mb6}>
      {title}
    </h3>
    {children}
  </DashboardCard>
)

// ========================================
//   TABLE PRIMITIVES
// ========================================

// Dashboard Table - Main table container
const DashboardTable: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`${cssClasses.bgWhite95 + ' ' + cssClasses.border2 + ' ' + cssClasses.borderYellow600 + ' ' + cssClasses.roundedLg + ' ' + cssClasses.overflowXAuto} ${className}`}>
    <table className={cssClasses.wFull + ' ' + cssClasses.borderCollapse}>
      {children}
    </table>
  </div>
)

// Dashboard Table Header - Table header cell
const DashboardTableHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <th className={`${cssClasses.px6 + ' ' + cssClasses.py4 + ' ' + cssClasses.textLeft + ' ' + cssClasses.fontSemibold + ' ' + cssClasses.textSecondary + ' ' + cssClasses.borderB + ' ' + cssClasses.borderGray200 + ' ' + cssClasses.bgGray50} ${className}`}>
    {children}
  </th>
)

// Dashboard Table Row - Table row
const DashboardTableRow: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <tr className={`${cssClasses.borderB + ' ' + cssClasses.borderGray200} ${className}`}>
    {children}
  </tr>
)

// Dashboard Table Cell - Table data cell
const DashboardTableCell: React.FC<{
  children: React.ReactNode
  className?: string
  colSpan?: number
}> = ({ children, className = '', colSpan }) => (
  <td 
    colSpan={colSpan}
    className={`${cssClasses.px6 + ' ' + cssClasses.py4 + ' ' + cssClasses.textLeft + ' ' + cssClasses.textSecondary} ${className}`}
  >
    {children}
  </td>
)

// Dashboard Table Empty State - Empty table state
const DashboardTableEmptyState: React.FC<{
  colSpan: number
  message: string
}> = ({ colSpan, message }) => (
  <DashboardTableRow>
    <DashboardTableCell 
      colSpan={colSpan}
      className={cssClasses.textCenter + ' ' + cssClasses.py8}
    >
      <span className={cssClasses.textMuted}>{message}</span>
    </DashboardTableCell>
  </DashboardTableRow>
)

// ========================================
//   BADGE & ACTION COMPONENTS
// ======================================== */

// Role Badge - Displays user role with appropriate styling
const RoleBadge: React.FC<{ role: 'ADMIN' | 'EDITOR' }> = ({ role }) => {
  const getRoleStyles = () => {
    switch (role) {
      case 'ADMIN':
        return cssClasses.bgYellow500 + ' ' + cssClasses.textPrimary + ' ' + cssClasses.border2 + ' ' + cssClasses.borderYellow600 + ' ' + cssClasses.fontBold
      case 'EDITOR':
        return cssClasses.bgGray50 + ' ' + cssClasses.textSecondary + ' ' + cssClasses.border2 + ' ' + cssClasses.borderGray300
      default:
        return cssClasses.bgGray50 + ' ' + cssClasses.textMuted + ' ' + cssClasses.border2 + ' ' + cssClasses.borderGray200
    }
  }

  return (
    <span className={`${getRoleStyles()} ${cssClasses.textXs + ' ' + cssClasses.uppercase + ' ' + cssClasses.px3 + ' ' + cssClasses.py1 + ' ' + cssClasses.roundedFull}`}>
      {role}
    </span>
  )
}

// Status Badge - Displays user status with appropriate styling
const StatusBadge: React.FC<{ status: 'ACTIVE' | 'LOCKED' }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'ACTIVE':
        return cssClasses.bgGreen100 + ' ' + cssClasses.textGreen700 + ' ' + cssClasses.border2 + ' ' + cssClasses.borderGreen300 + ' ' + cssClasses.fontSemibold
      case 'LOCKED':
      default:
        return cssClasses.bgRed100 + ' ' + cssClasses.textRed700 + ' ' + cssClasses.border2 + ' ' + cssClasses.borderRed300 + ' ' + cssClasses.fontSemibold
    }
  }

  return (
    <span className={`${getStatusStyles()} ${cssClasses.textXs + ' ' + cssClasses.uppercase + ' ' + cssClasses.px3 + ' ' + cssClasses.py1 + ' ' + cssClasses.roundedFull}`}>
      {status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
    </span>
  )
}

// Action Button Group - Displays action buttons for user management
const ActionButtonGroup: React.FC<{ status: 'ACTIVE' | 'LOCKED' }> = ({ status }) => {
  const ActionButton: React.FC<{ children: string }> = ({ children }) => (
    <button
      disabled
      className={`${cssClasses.px3 + ' ' + cssClasses.py1 + ' ' + cssClasses.textXs + ' ' + cssClasses.border2 + ' ' + cssClasses.borderGray300 + ' ' + cssClasses.roundedLg + ' ' + cssClasses.textMuted + ' ' + cssClasses.bgGray50} opacity-50 cursor-not-allowed`}
    >
      {children}
    </button>
  )

  return (
    <div className={cssClasses.flex + ' ' + cssClasses.itemsCenter + ' ' + cssClasses.spaceX2}>
      <ActionButton>Xem</ActionButton>
      <ActionButton>
        {status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
      </ActionButton>
    </div>
  )
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState<string>('overview')

  const menuItems = [
    { id: 'overview', label: 'TỔNG QUAN', icon: <BarChart3 size={20} /> },
    { id: 'users', label: 'NGƯỜI DÙNG', icon: <Users size={20} /> }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />
      case 'users':
        return <UserManagement />
      default:
        return <OverviewSection />
    }
  }

  return (
    <div className={cssClasses.minHScreen + ' ' + cssClasses.bgRed900 + ' ' + cssClasses.textGoldLight + ' ' + cssClasses.flex}>
      {/* Bronze Drum Pattern Background */}
      <div className="bronze-drum-pattern"></div>
      
      {/* Sidebar */}
      <div className={cssClasses.adminSidebar}>
        <div className={cssClasses.adminHeader}>
          <h1 className={cssClasses.adminTitle}>QUẢN TRỊ HỆ THỐNG</h1>
          <div className={cssClasses.adminIdentity}>
            <div className={patterns.flexCenter()}>
              <div className={cssClasses.adminAvatar}>
                <span className={cssClasses.adminAvatarText}>A</span>
              </div>
              <div>
                <div className={cssClasses.adminName}>Admin</div>
                <div className={cssClasses.adminEmail}>{user?.displayName || user?.email || 'Quản trị viên'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Horizontal */}
        <ButtonGroup
          options={menuItems}
          selectedValue={activeSection}
          onSelect={setActiveSection}
          orientation="vertical"
          variant="military"
          className="tab-navigation-vertical"
        />

        <div className={cssClasses.mt8 + ' ' + cssClasses.pt6 + ' ' + cssClasses.borderT + ' ' + cssClasses.borderYellow700}>
          <button
            onClick={() => navigate('/')}
            className={cssClasses.wFull + ' ' + cssClasses.textLeft + ' ' + cssClasses.px4 + ' ' + cssClasses.py3 + ' ' + cssClasses.textGoldLight + ' ' + cssClasses.hoverBgRed800 + ' ' + cssClasses.border2 + ' ' + cssClasses.borderTransparent + ' ' + cssClasses.roundedLg + ' ' + cssClasses.transitionAll + ' ' + cssClasses.duration200 + ' ' + cssClasses.mb3}
          >
            <span className="flex-shrink-0">←</span>
            <span className={cssClasses.fontMedium}>Về trang chủ</span>
          </button>
          <button
            onClick={handleLogout}
            className={cssClasses.wFull + ' ' + cssClasses.textLeft + ' ' + cssClasses.px4 + ' ' + cssClasses.py2 + ' ' + cssClasses.textRed400 + ' ' + cssClasses.hoverBgRed800 + ' ' + cssClasses.border2 + ' ' + cssClasses.borderTransparent + ' ' + cssClasses.roundedLg + ' ' + cssClasses.transitionAll + ' ' + cssClasses.duration200}
          >
            <span className="flex-shrink-0">→</span>
            <span className={cssClasses.fontMedium}>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cssClasses.flex1}>
        <div className={cssClasses.mainContainer}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

// Overview Section
const OverviewSection: React.FC = () => {
  // Placeholder data for user activity over last 7 days
  const userActivityData = [
    { day: 'T2', users: 0 },
    { day: 'T3', users: 0 },
    { day: 'T4', users: 0 },
    { day: 'T5', users: 0 },
    { day: 'T6', users: 0 },
    { day: 'T7', users: 0 },
    { day: 'CN', users: 0 }
  ]

  return (
    <div>
      <h2 className={cssClasses.text2xl + ' ' + cssClasses.fontBold + ' ' + cssClasses.textPrimary + ' ' + cssClasses.mb6}>
        TỔNG QUAN HỆ THỐNG
      </h2>
      
      {/* Metrics Row */}
      <div className={cssClasses.grid + ' ' + cssClasses.gridCols1 + ' ' + cssClasses.gridCols2 + ' ' + cssClasses.gridCols4 + ' ' + cssClasses.gap6 + ' ' + cssClasses.mb8}>
        <DashboardMetric
          value="0"
          label="Tổng người dùng"
          sublabel="Đã đăng ký"
        />
        <DashboardMetric
          value="0"
          label="Người dùng hoạt động"
          sublabel="Trong 7 ngày"
        />
        <DashboardMetric
          value="0"
          label="Người dùng mới"
          sublabel="Trong 7 ngày"
        />
        <DashboardMetric
          value="0"
          label="Người dùng không hoạt động"
          sublabel="Trong 7 ngày"
        />
      </div>

      {/* User Activity Chart */}
      <DashboardChartCard title="HOẠT ĐỘNG NGƯỜI DÙNG (7 NGÀY)">
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userActivityData}>
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #ffd700',
                  borderRadius: '8px',
                  color: '#d32f2f'
                }}
                labelStyle={{ color: '#d32f2f', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="users" 
                fill="#ffd700"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className={cssClasses.textMuted + ' ' + cssClasses.textCenter + ' ' + cssClasses.mt4}>
          Chưa có dữ liệu hoạt động người dùng
        </p>
      </DashboardChartCard>

      {/* System Activity Section */}
      <DashboardSection title="HOẠT ĐỘNG HỆ THỐNG">
        <div className={cssClasses.bgGray50 + ' ' + cssClasses.roundedLg + ' ' + cssClasses.p8 + ' ' + cssClasses.textCenter + ' ' + cssClasses.border + ' ' + cssClasses.borderGray300}>
          <p className={cssClasses.textSecondary + ' ' + cssClasses.mb3}>Chưa có dữ liệu thống kê</p>
          <p className={cssClasses.textMuted + ' ' + cssClasses.mb3}>Hệ thống đã sẵn sàng hoạt động</p>
          <p className={cssClasses.textMuted}>Bắt đầu thêm nội dung để xem thống kê</p>
        </div>
      </DashboardSection>

      {/* System Status Section */}
      <DashboardSection title="TRẠNG THÁI HỆ THỐNG">
        <div className={cssClasses.spaceY4}>
          <DashboardStatusRow
            label="Kết nối Firebase"
            value="HOẠT ĐỘNG"
            icon={<CheckCircle size={16} />}
          />
          <DashboardStatusRow
            label="Xác thực"
            value="ĐÃ KÍCH HOẠT"
            icon={<CheckCircle size={16} />}
          />
          <DashboardStatusRow
            label="Vai trò Admin"
            value="ĐÃ XÁC MINH"
            icon={<CheckCircle size={16} />}
          />
        </div>
      </DashboardSection>
    </div>
  )
}

// User Management Section
const UserManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<MappedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        console.log('Starting to fetch users...')
        const fetchedUsers = await getUsers()
        console.log('Fetched users from Firestore:', fetchedUsers)
        const mappedUsers = fetchedUsers.map(mapUserDocumentToMappedUser)
        console.log('Mapped users:', mappedUsers)
        setUsers(mappedUsers)
      } catch (error) {
        console.error('Error loading users:', error)
        setError(error instanceof Error ? error.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleCreateUserSuccess = () => {
    // Refresh user list after successful creation
    const loadUsers = async () => {
      setLoading(true)
      try {
        const fetchedUsers = await getUsers()
        const mappedUsers = fetchedUsers.map(mapUserDocumentToMappedUser)
        setUsers(mappedUsers)
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }

  // Simplified table without actions, dialogs, or action handlers for this step
  return (
    <div>
      <h2 className={cssClasses.text2xl + ' ' + cssClasses.fontBold + ' ' + cssClasses.textPrimary + ' ' + cssClasses.mb6}>
        DANH SÁCH NGƯỜI DÙNG
      </h2>
      
      <p className={cssClasses.textMuted + ' ' + cssClasses.mb6}>
        Quản lý tài khoản trong hệ thống
      </p>

      <div className="mb-4">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thêm người dùng
        </button>
      </div>

      <DashboardTable>
        <thead>
          <tr>
            <DashboardTableHeader>Họ tên</DashboardTableHeader>
            <DashboardTableHeader>Email</DashboardTableHeader>
            <DashboardTableHeader>Vai trò</DashboardTableHeader>
            <DashboardTableHeader>Trạng thái</DashboardTableHeader>
            <DashboardTableHeader>Ngày tạo</DashboardTableHeader>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <DashboardTableRow>
              <DashboardTableCell colSpan={5} className={cssClasses.textCenter + ' ' + cssClasses.py8}>
                <span className={cssClasses.textMuted}>Đang tải dữ liệu...</span>
              </DashboardTableCell>
            </DashboardTableRow>
          ) : error ? (
            <DashboardTableRow>
              <DashboardTableCell colSpan={5} className={cssClasses.textCenter + ' ' + cssClasses.py8}>
                <span className="text-red-600">Lỗi: {error}</span>
              </DashboardTableCell>
            </DashboardTableRow>
          ) : users.length === 0 ? (
            <DashboardTableEmptyState 
              colSpan={5} 
              message="Chưa có người dùng trong hệ thống"
            />
          ) : (
            users.map((user) => (
              <DashboardTableRow key={user.id}>
                <DashboardTableCell>{user.displayName}</DashboardTableCell>
                <DashboardTableCell>{user.email}</DashboardTableCell>
                <DashboardTableCell>
                  <RoleBadge role={user.role} />
                </DashboardTableCell>
                <DashboardTableCell>
                  <StatusBadge status={user.isActive ? 'ACTIVE' : 'LOCKED'} />
                </DashboardTableCell>
                <DashboardTableCell>{user.createdAt}</DashboardTableCell>
                <DashboardTableCell>
                  {/* Actions column empty for this step */}
                </DashboardTableCell>
              </DashboardTableRow>
            ))
          )}
        </tbody>
      </DashboardTable>

      {/* Create User Dialog */}
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateUserSuccess}
      />
    </div>
  )
}
