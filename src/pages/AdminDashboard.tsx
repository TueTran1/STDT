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

type DashboardMetricProps = {
  value: string | number
  label: string
  sublabel?: string
}

type DashboardCardProps = {
  children: React.ReactNode
  className?: string
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
const ViewUserDialog: React.FC<ViewUserDialogProps> = ({ isOpen, onClose, user }) => (
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

// ========================================
//   BADGE COMPONENTS
// ========================================

const RoleBadge: React.FC<{ role: 'ADMIN' | 'EDITOR' }> = ({ role }) => {
  const styles = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    EDITOR: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[role]}`}>
      {role === 'ADMIN' ? 'Quản trị viên' : 'Biên tập viên'}
    </span>
  )
}

const StatusBadge: React.FC<{ status: 'ACTIVE' | 'LOCKED' }> = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    LOCKED: 'bg-red-100 text-red-800 border-red-200'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
    </span>
  )
}

// ========================================
//   DASHBOARD COMPONENTS
// ========================================

// Dashboard Card - Base container for all dashboard elements
const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
    {children}
  </div>
)

// Dashboard Metric - Individual metric display
const DashboardMetric: React.FC<DashboardMetricProps> = ({ value, label, sublabel }) => (
  <DashboardCard>
    <div className="text-3xl font-bold text-red-800 mb-2">{value}</div>
    <div className="text-sm font-medium text-gray-600">{label}</div>
    {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
  </DashboardCard>
)

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  if (error) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-red-800">Bảng điều khiển quản trị</h1>
                <p className="text-gray-600 mt-1">Chào mừng, {user?.displayName}</p>
              </div>
              <button
                onClick={() => setCreateUserDialogOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Users size={20} />
                <span>Thêm người dùng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardMetric value={totalUsers} label="Tổng số người dùng" />
            <DashboardMetric value={activeUsers} label="Người dùng hoạt động" />
            <DashboardMetric value={adminUsers} label="Quản trị viên" />
            <DashboardMetric value={editorUsers} label="Biên tập viên" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân phối vai trò</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={roleData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </DashboardCard>

            <DashboardCard>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái người dùng</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </DashboardCard>
          </div>

          {/* Users Table */}
          <DashboardCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách người dùng</h3>
              <button
                onClick={loadUsers}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Làm mới
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleChangeRole(user)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Vai trò
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            {user.isActive ? 'Khóa' : 'Mở'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
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
          </DashboardCard>
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
