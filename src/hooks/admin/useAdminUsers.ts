import { useState, useCallback, useEffect, useRef } from 'react'
import { useAdminAuth, AdminPermission } from '../../contexts/AdminAuthContext'
import { adminService, createServiceUser, AdminUserData, AdminPaginationResult, AdminServiceError } from '../../services/adminService'

interface UseAdminUsersOptions {
  initialLimit?: number
  autoLoad?: boolean
}

interface UseAdminUsersReturn {
  // Data state
  users: AdminUserData[]
  loading: boolean
  error: string | null
  hasMore: boolean
  cursor?: any
  
  // Actions
  loadUsers: (options?: {
    limit?: number
    search?: string
    role?: 'admin' | 'editor'
    status?: boolean
    reset?: boolean
  }) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  
  // CRUD operations
  createUser: (userData: {
    email: string
    displayName: string
    role: 'admin' | 'editor'
    isActive: boolean
  }) => Promise<void>
  updateUser: (userId: string, updates: Partial<Pick<AdminUserData, 'displayName' | 'role' | 'isActive'>>) => Promise<void>
  deactivateUser: (userId: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  
  // State management
  clearError: () => void
}

/**
 * Admin users management hook
 * 
 * Provides complete user management functionality with:
 * - Permission validation
 * - Error handling
 * - Loading states
 * - Pagination
 * - Audit logging (handled by service)
 */
export const useAdminUsers = (options: UseAdminUsersOptions = {}): UseAdminUsersReturn => {
  const { adminUser, hasPermission } = useAdminAuth()
  const [users, setUsers] = useState<AdminUserData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<any>(undefined)
  const [currentOptions, setCurrentOptions] = useState<Record<string, any>>({})
  
  // Track if initial load has happened to prevent infinite loops
  const hasLoadedInitially = useRef(false)

  // Permission validation
  const validatePermission = useCallback((permission: AdminPermission): void => {
    if (!hasPermission(permission)) {
      throw new AdminServiceError(
        `Insufficient permissions for user management`,
        'INSUFFICIENT_PERMISSIONS',
        { requiredPermission: permission }
      )
    }
  }, [hasPermission])

  // Error handler
  const handleError = useCallback((error: any) => {
    if (error instanceof AdminServiceError) {
      setError(error.message)
    } else {
      setError('An unexpected error occurred')
    }
    console.error('Admin users operation error:', error)
  }, [])

  // Load users function
  const loadUsers = useCallback(async (loadOptions: {
    limit?: number
    search?: string
    role?: 'admin' | 'editor'
    status?: boolean
    reset?: boolean
  } = {}) => {
    if (!adminUser) return

    try {
      validatePermission(AdminPermission.VIEW_USERS)
      
      setLoading(true)
      setError(null)

      const serviceUser = createServiceUser(adminUser)
      const limit = loadOptions.limit || options.initialLimit || 20
      
      const result: AdminPaginationResult<AdminUserData> = await adminService.getUsers(serviceUser, {
        limit,
        search: loadOptions.search,
        role: loadOptions.role,
        status: loadOptions.status,
        cursor: loadOptions.reset ? undefined : cursor
      })

      if (loadOptions.reset) {
        setUsers(result.items)
      } else {
        setUsers(prev => loadOptions.reset ? result.items : [...prev, ...result.items])
      }
      
      setHasMore(result.hasMore)
      setCursor(result.cursor)
      setCurrentOptions(loadOptions)

    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [adminUser, validatePermission, handleError, cursor, options.initialLimit])

  // Load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    
    await loadUsers({
      ...currentOptions,
      reset: false
    })
  }, [hasMore, loading, currentOptions, loadUsers])

  // Refresh function
  const refresh = useCallback(async () => {
    await loadUsers({
      ...currentOptions,
      reset: true
    })
  }, [currentOptions, loadUsers])

  // Create user function
  const createUser = useCallback(async (userData: {
    email: string
    displayName: string
    role: 'admin' | 'editor'
    isActive: boolean
  }) => {
    if (!adminUser) return

    try {
      validatePermission(AdminPermission.CREATE_USERS)
      
      setLoading(true)
      setError(null)

      const serviceUser = createServiceUser(adminUser)
      await adminService.createUser(serviceUser, userData)
      
      // Refresh the users list
      await refresh()

    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [adminUser, validatePermission, handleError, refresh])

  // Update user function
  const updateUser = useCallback(async (userId: string, updates: Partial<Pick<AdminUserData, 'displayName' | 'role' | 'isActive'>>) => {
    if (!adminUser) return

    try {
      validatePermission(AdminPermission.UPDATE_USERS)
      
      setLoading(true)
      setError(null)

      const serviceUser = createServiceUser(adminUser)
      await adminService.updateUser(serviceUser, userId, updates)
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, ...updates } : user
      ))

    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [adminUser, validatePermission, handleError])

  // Deactivate user function
  const deactivateUser = useCallback(async (userId: string) => {
    if (!adminUser) return

    try {
      validatePermission(AdminPermission.DEACTIVATE_USERS)
      
      setLoading(true)
      setError(null)

      const serviceUser = createServiceUser(adminUser)
      await adminService.deactivateUser(serviceUser, userId)
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, isActive: false } : user
      ))

    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [adminUser, validatePermission, handleError])

  // Delete user function
  const deleteUser = useCallback(async (userId: string) => {
    if (!adminUser) return

    try {
      validatePermission(AdminPermission.DELETE_USERS)
      
      setLoading(true)
      setError(null)

      const serviceUser = createServiceUser(adminUser)
      await adminService.deleteUser(serviceUser, userId)
      
      // Remove user from local state
      setUsers(prev => prev.filter(user => user.uid !== userId))

    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [adminUser, validatePermission, handleError])

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (options.autoLoad !== false && adminUser && !hasLoadedInitially.current) {
      hasLoadedInitially.current = true
      loadUsers({ reset: true })
    }
  }, [adminUser, options.autoLoad]) // Remove loadUsers to prevent infinite loop

  return {
    // Data state
    users,
    loading,
    error,
    hasMore,
    cursor,
    
    // Actions
    loadUsers,
    loadMore,
    refresh,
    
    // CRUD operations
    createUser,
    updateUser,
    deactivateUser,
    deleteUser,
    
    // State management
    clearError
  }
}
