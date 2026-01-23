import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Users, X } from 'lucide-react'
import { RequireAdmin } from '../components/auth'
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
import { CreateUserDialog } from '../components/admin/CreateUserDialog'

// ========================================
//   TYPE DEFINITIONS
// ========================================

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

type UserDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

type ViewUserDialogProps = {
  isOpen: boolean
  onClose: () => void
  user: MappedUser
}

type ConfirmActionDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  cancelText: string
}

type ChangeRoleDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newRole: 'ADMIN' | 'EDITOR') => void
  currentRole: 'ADMIN' | 'EDITOR' 
  userName: string
}

// ========================================
//   UTILITY FUNCTIONS
// ========================================

// Strict user mapping function - no fallbacks, requires valid Firestore data
const mapUserDocumentToMappedUser = (user: any): MappedUser => {
  // Validate required fields
  if (!user.id) {
    throw new Error('User document missing required field: id')
  }
  
  if (!user.displayName && !user.uid) {
    throw new Error('User document missing required field: displayName or uid')
  }
  
  if (!user.email) {
    throw new Error('User document missing required field: email')
  }
  
  if (!user.role) {
    throw new Error('User document missing required field: role')
  }
  
  // Validate role is one of expected values
  if (user.role !== 'admin' && user.role !== 'editor') {
    throw new Error(`Invalid user role: ${user.role}. Expected 'admin' or 'editor'`)
  }
  
  // Validate dates
  if (!user.createdAt) {
    throw new Error('User document missing required field: createdAt')
  }
  
  const createdAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
  if (isNaN(createdAt.getTime())) {
    throw new Error('User document has invalid createdAt date')
  }
  
  // Return mapped user with no fallbacks
  return {
    id: user.id,
    displayName: user.displayName || user.uid, // Use uid as fallback for displayName only
    email: user.email,
    role: (user.role === 'admin' ? 'ADMIN' : 'EDITOR') as 'ADMIN' | 'EDITOR',
    isActive: user.isActive ?? true, // Default to active if not specified
    createdAt: createdAt.toLocaleDateString(),
    name: user.displayName || user.uid, // Use uid as fallback for name only
    status: (user.isActive ? 'ACTIVE' : 'LOCKED') as 'ACTIVE' | 'LOCKED',
    createdDate: createdAt.toLocaleDateString()
  }
}

// ========================================
//   DIALOG COMPONENTS
// ========================================

// User Dialog - Base dialog component
const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="content-panel max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
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
const ViewUserDialog: React.FC<ViewUserDialogProps> = ({ isOpen, onClose, user }) => (
  <UserDialog isOpen={isOpen} onClose={onClose} title="Thông tin người dùng">
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-primary mb-1">Họ tên</label>
        <p className="text-primary font-semibold">{user.name}</p>
      </div>
      <div>
        <label className="block text-sm font-bold text-primary mb-1">Email</label>
        <p className="text-primary font-semibold">{user.email}</p>
      </div>
      <div>
        <label className="block text-sm font-bold text-primary mb-1">Vai trò</label>
        <RoleBadge role={user.role} />
      </div>
      <div>
        <label className="block text-sm font-bold text-primary mb-1">Trạng thái</label>
        <StatusBadge status={user.status} />
      </div>
      <div>
        <label className="block text-sm font-bold text-primary mb-1">Ngày tạo</label>
        <p className="text-primary font-semibold">{user.createdDate}</p>
      </div>
    </div>
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-yellow-500 text-primary rounded-lg hover:bg-yellow-400 font-semibold transition-all"
      >
        Đóng
      </button>
    </div>
  </UserDialog>
)

// Confirm Action Dialog
const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText 
}) => (
  <UserDialog isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-secondary mb-6">{message}</p>
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-yellow-500 text-primary rounded-lg hover:bg-yellow-400 font-semibold transition-all"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        className="military-button px-6 py-3"
      >
        {confirmText}
      </button>
    </div>
  </UserDialog>
)

// Change Role Dialog
const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentRole, 
  userName 
}) => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EDITOR'>(currentRole)

  const handleConfirm = () => {
    onConfirm(selectedRole)
    onClose()
  }

  return (
    <UserDialog isOpen={isOpen} onClose={onClose} title="Thay đổi vai trò">
      <p className="text-secondary mb-4">
        Chọn vai trò mới cho: <span className="font-bold text-primary">{userName}</span>
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
          className="px-4 py-2 bg-yellow-500 text-primary rounded-lg hover:bg-yellow-400 font-semibold transition-all"
        >
          Hủy
        </button>
        <button
          onClick={handleConfirm}
          className="military-button px-6 py-3"
        >
          Cập nhật
        </button>
      </div>
    </UserDialog>
  )
}

// ========================================
//   BADGE COMPONENTS
// ========================================

const RoleBadge: React.FC<{ role: 'ADMIN' | 'EDITOR' }> = ({ role }) => {
  const styles = {
    ADMIN: 'bg-red-100 text-primary border-red-200',
    EDITOR: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[role]}`}>
      {role === 'ADMIN' ? 'Quản trị viên' : 'Biên tập viên'}
    </span>
  )
}

const StatusBadge: React.FC<{ status: 'ACTIVE' | 'LOCKED' }> = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    LOCKED: 'bg-red-100 text-primary border-red-200'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
    </span>
  )
}

// ========================================
//   MAIN DASHBOARD COMPONENT
// ========================================

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  
  // State management
  const [users, setUsers] = useState<MappedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<MappedUser | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  
  // Action states
  const [pendingAction, setPendingAction] = useState<{
    type: 'toggle' | 'role' | 'delete'
    userId: string
    newRole?: 'ADMIN' | 'EDITOR'
  } | null>(null)

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await getUsers()
      const mappedUsers = usersData.map(mapUserDocumentToMappedUser)
      setUsers(mappedUsers)
    } catch (error) {
      setError('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: MappedUser) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleToggleUserStatus = (userId: string) => {
    setPendingAction({ type: 'toggle', userId })
    setConfirmDialogOpen(true)
  }

  const handleChangeRole = (user: MappedUser) => {
    setSelectedUser(user)
    setRoleDialogOpen(true)
  }

  const handleRoleChange = (newRole: 'ADMIN' | 'EDITOR') => {
    if (selectedUser) {
      setPendingAction({ type: 'role', userId: selectedUser.id, newRole })
      setConfirmDialogOpen(true)
    }
  }

  const handleDeleteUser = (userId: string) => {
    setPendingAction({ type: 'delete', userId })
    setConfirmDialogOpen(true)
  }

  const executeAction = async () => {
    if (!pendingAction) return

    try {
      // Here you would implement the actual actions
      // For now, we'll just reload the users list
      await loadUsers()
    } catch (error) {
      setError('Không thể thực hiện hành động')
    } finally {
      setPendingAction(null)
      setConfirmDialogOpen(false)
    }
  }

  // Calculate metrics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.isActive).length
  const adminUsers = users.filter(u => u.role === 'ADMIN').length
  const editorUsers = users.filter(u => u.role === 'EDITOR').length

  // Chart data
  const roleData = [
    { name: 'Admin', count: adminUsers },
    { name: 'Editor', count: editorUsers }
  ]

  const statusData = [
    { name: 'Hoạt động', count: activeUsers },
    { name: 'Đã khóa', count: totalUsers - activeUsers }
  ]

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen" style={{backgroundColor: 'var(--beige-background)'}}>
          <div className="content-panel text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-secondary">Đang tải dữ liệu...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  if (error) {
    return (
      <RequireAdmin>
        <div className="min-h-screen" style={{backgroundColor: 'var(--beige-background)'}}>
          <div className="content-panel text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-secondary mb-4">{error}</p>
            <button
              onClick={loadUsers}
              className="military-button px-6 py-3"
            >
              Thử lại
            </button>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen" style={{backgroundColor: 'var(--beige-background)'}}>
        {/* Header */}
        <div className="content-panel mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Bảng điều khiển quản trị</h1>
              <p className="text-secondary">Chào mừng, {user?.displayName}</p>
            </div>
            <button
              onClick={() => setCreateUserDialogOpen(true)}
              className="military-button hover:bg-red-800 flex items-center space-x-2 px-6 py-3"
            >
              <Users size={20} />
              <span>Thêm người dùng</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-container">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="metric-card">
              <div className="metric-number">{totalUsers}</div>
              <div className="metric-label">Tổng số người dùng</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">{activeUsers}</div>
              <div className="metric-label">Người dùng hoạt động</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">{adminUsers}</div>
              <div className="metric-label">Quản trị viên</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">{editorUsers}</div>
              <div className="metric-label">Biên tập viên</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="content-panel">
              <h3 className="text-xl font-bold text-primary mb-4">Phân phối vai trò</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={roleData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d32f2f" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="content-panel">
              <h3 className="text-xl font-bold text-primary mb-4">Trạng thái người dùng</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffd700" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Users Table */}
          <div className="content-panel">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary">Danh sách người dùng</h3>
              <button
                onClick={loadUsers}
                className="px-4 py-2 text-sm bg-yellow-500 text-red-900 rounded-lg hover:bg-yellow-400 font-semibold transition-all"
              >
                Làm mới
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-yellow-600">
                    <th className="px-6 py-3 text-left text-sm font-bold text-primary uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-primary uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-primary uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-primary uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-primary uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={`border-b border-yellow-300 ${index % 2 === 0 ? 'bg-red-50' : 'bg-white'} hover:bg-yellow-50 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-primary">{user.name}</div>
                          <div className="text-sm text-secondary">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {user.createdDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 font-semibold"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleChangeRole(user)}
                            className="text-yellow-600 hover:text-yellow-900 font-semibold"
                          >
                            Vai trò
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className="text-orange-600 hover:text-orange-900 font-semibold"
                          >
                            {user.isActive ? 'Khóa' : 'Mở'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {selectedUser && (
          <ViewUserDialog
            isOpen={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            user={selectedUser}
          />
        )}

        <ConfirmActionDialog
          isOpen={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={executeAction}
          title="Xác nhận hành động"
          message={
            pendingAction?.type === 'toggle'
              ? 'Bạn có chắc muốn thay đổi trạng thái của người dùng này?'
              : pendingAction?.type === 'role'
              ? 'Bạn có chắc muốn thay đổi vai trò của người dùng này?'
              : 'Bạn có chắc muốn xóa người dùng này?'
          }
          confirmText="Xác nhận"
          cancelText="Hủy"
        />

        {selectedUser && (
          <ChangeRoleDialog
            isOpen={roleDialogOpen}
            onClose={() => setRoleDialogOpen(false)}
            onConfirm={handleRoleChange}
            currentRole={selectedUser.role}
            userName={selectedUser.name}
          />
        )}

        <CreateUserDialog
          isOpen={createUserDialogOpen}
          onClose={() => setCreateUserDialogOpen(false)}
          onSuccess={loadUsers}
        />
      </div>
    </RequireAdmin>
  )
}

export default AdminDashboard
