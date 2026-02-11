import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  updateDoc,
  runTransaction,
  addDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  AdminPermission
} from '../contexts/AdminAuthContext'
import { 
  AdminUserData,
  AdminServiceUser,
  UserFilters,
  UserList,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from '../types/admin'

// Error class for admin service operations
class AdminServiceError extends Error {
  public code: string
  public details?: Record<string, any>

  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AdminServiceError'
    this.code = code
    this.details = details
  }
}

// Error codes for admin service operations
const AdminServiceErrorCode = {
  SELF_MODIFICATION_FORBIDDEN: 'SELF_MODIFICATION_FORBIDDEN',
  ADMIN_DELETION_FORBIDDEN: 'ADMIN_DELETION_FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ROLE_ASSIGNMENT_INVALID: 'ROLE_ASSIGNMENT_INVALID',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_USER_DATA: 'INVALID_USER_DATA'
} as const

export type AdminServiceErrorCode = typeof AdminServiceErrorCode[keyof typeof AdminServiceErrorCode]

/**
 * Admin User Service
 * 
 * Provides comprehensive user management with strict safety rules:
 * - Admin users cannot delete themselves
 * Admin users cannot demote themselves
 * Admin users cannot delete other admin users
 * All operations are logged for audit purposes
 */
class AdminUserServiceClass {
  private readonly collections = {
    users: 'users',
    auditLogs: 'audit_logs',
    userSessions: 'user_sessions'
  }

  /**
   * Create a new user with role assignment
   */
  async createUser(adminUser: AdminServiceUser, userData: CreateUserRequest): Promise<string> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.CREATE_USERS)

      // Validate user data
      this.validateCreateUserData(userData)

      // Check for duplicate email
      await this.validateUniqueEmail(userData.email)

      // Create user in transaction
      const userId = await runTransaction(db, async (transaction) => {
        const userRef = doc(collection(db, this.collections.users))
        const userDoc = {
          uid: '', // Will be set by auth system
          email: userData.email.toLowerCase().trim(),
          displayName: userData.displayName.trim(),
          role: userData.role,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: null,
          createdBy: adminUser.uid,
          createdVia: 'admin_panel'
        }

        const userResult = await addDoc(collection(db, this.collections.users), userDoc)
        
        // Log user creation
        await this.logUserAction(adminUser, 'create_user', 'user', userResult.id, {
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role
        })

        return userResult.id
      })

      return userId
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to create user',
        'USER_CREATION_ERROR',
        { originalError: error, userData }
      )
    }
  }

  /**
   * Update user information
   */
  async updateUser(adminUser: AdminServiceUser, userId: string, updates: UpdateUserRequest): Promise<void> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.UPDATE_USERS)

      // Prevent self-modification of critical fields
      if (updates.role && adminUser.uid === userId) {
        throw new AdminServiceError(
          'Cannot modify your own role',
          'SELF_MODIFICATION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId }
        )
      }

      // Get current user data
      const currentUser = await this.getUserById(userId)
      
      // Prevent admin users from being demoted to non-admin
      if (currentUser.role === 'admin' && updates.role === 'editor') {
        throw new AdminServiceError(
          'Cannot demote admin user',
          'ADMIN_DEMOTION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId, currentRole: 'admin', newRole: 'editor' }
        )
      }

      // Update user
      const userRef = doc(db, this.collections.users, userId)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.uid
      })

      // Log user update
      await this.logUserAction(adminUser, 'update_user', 'user', userId, updates)
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to update user',
        'USER_UPDATE_ERROR',
        { originalError: error, userId, updates }
      )
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(adminUser: AdminServiceUser, userId: string): Promise<void> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.DEACTIVATE_USERS)

      // Prevent self-deactivation
      if (adminUser.uid === userId) {
        throw new AdminServiceError(
          'Cannot deactivate your own account',
          'SELF_MODIFICATION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId }
        )
      }

      // Get target user
      const targetUser = await this.getUserById(userId)
      
      // Prevent deactivation of admin users
      if (targetUser.role === 'admin') {
        throw new AdminServiceError(
          'Cannot deactivate admin user',
          'ADMIN_DEACTIVATION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId, targetRole: 'admin' }
        )
      }

      // Deactivate user
      const userRef = doc(db, this.collections.users, userId)
      await updateDoc(userRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: adminUser.uid,
        updatedAt: serverTimestamp()
      })

      // Log user deactivation
      await this.logUserAction(adminUser, 'deactivate_user', 'user', userId, {
        reason: 'Admin deactivation',
        targetRole: targetUser.role
      })

      // Invalidate user sessions
      await this.invalidateUserSessions(userId)
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to deactivate user',
        'USER_DEACTIVATION_ERROR',
        { originalError: error, userId }
      )
    }
  }

  /**
   * Delete user (hard delete)
   */
  async deleteUser(adminUser: AdminServiceUser, userId: string): Promise<void> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.DELETE_USERS)

      // Prevent self-deletion
      if (adminUser.uid === userId) {
        throw new AdminServiceError(
          'Cannot delete your own account',
          'SELF_MODIFICATION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId }
        )
      }

      // Get target user
      const targetUser = await this.getUserById(userId)
      
      // Prevent deletion of admin users
      if (targetUser.role === 'admin') {
        throw new AdminServiceError(
          'Cannot delete admin user',
          'ADMIN_DELETION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId, targetRole: 'admin' }
        )
      }

      // Handle user's content before deletion
      await this.handleUserContentDeletion(targetUser)

      // Delete user in transaction
      await runTransaction(db, async (transaction) => {
        // Delete user document
        const userRef = doc(db, this.collections.users, userId)
        transaction.delete(userRef)

        // Mark user sessions as invalid
        const sessionsQuery = query(
          collection(db, this.collections.userSessions),
          where('userId', '==', userId)
        )
        const sessionsSnapshot = await getDocs(sessionsQuery)
        
        sessionsSnapshot.docs.forEach(doc => {
          transaction.delete(doc.ref)
        })

        // Log user deletion
        await this.logUserAction(adminUser, 'delete_user', 'user', userId, {
          reason: 'Admin deletion',
          targetRole: targetUser.role,
          targetEmail: targetUser.email
        })
      })

    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to delete user',
        'USER_DELETION_ERROR',
        { originalError: error, userId }
      )
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(adminUser: AdminServiceUser, userId: string, role: UserRole): Promise<void> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.UPDATE_USERS)

      // Prevent self-role assignment
      if (adminUser.uid === userId) {
        throw new AdminServiceError(
          'Cannot modify your own role',
          'SELF_MODIFICATION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId, newRole: role }
        )
      }

      // Validate role assignment
      this.validateRoleAssignment(role)

      // Get current user
      const currentUser = await this.getUserById(userId)

      // Update user role
      const userRef = doc(db, this.collections.users, userId)
      await updateDoc(userRef, {
        role,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.uid,
        roleAssignedBy: adminUser.uid,
        roleAssignedAt: serverTimestamp()
      })

      // Log role assignment
      await this.logUserAction(adminUser, 'assign_role', 'user', userId, {
        oldRole: currentUser.role,
        newRole: role
      })

    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to assign role',
        'ROLE_ASSIGNMENT_ERROR',
        { originalError: error, userId, role }
      )
    }
  }

  /**
   * Remove user role (demote to no role)
   */
  async removeRole(adminUser: AdminServiceUser, userId: string): Promise<void> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.UPDATE_USERS)

      // Prevent self-role removal
      if (adminUser.uid === userId) {
        throw new AdminServiceError(
          'Cannot remove your own role',
          'SELF_MODIFICATION_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId }
        )
      }

      // Get current user
      const currentUser = await this.getUserById(userId)

      // Prevent admin users from losing admin role
      if (currentUser.role === 'admin') {
        throw new AdminServiceError(
          'Cannot remove admin role',
          'ADMIN_ROLE_REMOVAL_FORBIDDEN',
          { adminId: adminUser.uid, targetUserId: userId, currentRole: 'admin' }
        )
      }

      // Remove user role
      const userRef = doc(db, this.collections.users, userId)
      await updateDoc(userRef, {
        role: null,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.uid,
        roleRemovedBy: adminUser.uid,
        roleRemovedAt: serverTimestamp()
      })

      // Log role removal
      await this.logUserAction(adminUser, 'remove_role', 'user', userId, {
        oldRole: currentUser.role,
        newRole: null
      })

    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to remove role',
        'ROLE_REMOVAL_ERROR',
        { originalError: error, userId }
      )
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(adminUser: AdminServiceUser, userId: string): Promise<string> {
    try {
      // Validate admin permissions
      this.validatePermission(adminUser, AdminPermission.UPDATE_USERS)

      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword()

      // Update user with new password (would normally be done via auth system)
      const userRef = doc(db, this.collections.users, userId)
      await updateDoc(userRef, {
        passwordResetRequired: true,
        passwordResetAt: serverTimestamp(),
        passwordResetBy: adminUser.uid,
        updatedAt: serverTimestamp()
      })

      // Log password reset
      await this.logUserAction(adminUser, 'reset_password', 'user', userId, {
        reason: 'Admin password reset'
      })

      return tempPassword
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to reset password',
        'PASSWORD_RESET_ERROR',
        { originalError: error, userId }
      )
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AdminUserData> {
    try {
      const userRef = doc(db, this.collections.users, userId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        throw new AdminServiceError(
          'User not found',
          'USER_NOT_FOUND',
          { userId }
        )
      }

      return {
        ...userSnap.data() as AdminUserData
      }
    } catch (error) {
      throw new AdminServiceError(
        'Failed to fetch user',
        'USER_FETCH_ERROR',
        { originalError: error, userId }
      )
    }
  }

  /**
   * Search users
   */
  async searchUsers(adminUser: AdminServiceUser, searchQuery: string, filters: UserFilters = {}): Promise<UserList> {
    try {
      this.validatePermission(adminUser, AdminPermission.VIEW_USERS)

      const constraints: any[] = []

      // Add search filter
      if (searchQuery) {
        constraints.push(
          where('displayName', '>=', searchQuery.toLowerCase()),
          where('email', '>=', searchQuery.toLowerCase())
        )
      }

      // Add role filter
      if (filters.role) {
        constraints.push(where('role', '==', filters.role))
      }

      // Add status filter
      if (filters.status !== undefined) {
        constraints.push(where('isActive', '==', filters.status))
      }

      // Add ordering
      const sortField = filters.sortBy || 'createdAt'
      const sortDirection = filters.sortOrder || 'desc'
      constraints.push(orderBy(sortField, sortDirection))

      // Add pagination
      if (filters.limit) {
        constraints.push(limit(filters.limit))
      }
      if (filters.offset) {
        constraints.push(startAfter(filters.offset))
      }

      const usersQuery = query(collection(db, this.collections.users), ...constraints)
      const snapshot = await getDocs(usersQuery)

      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUserData[]

      return {
        users,
        totalCount: users.length,
        hasMore: filters.limit ? users.length === filters.limit : false,
        cursor: filters.offset
      }
    } catch (error) {
      throw new AdminServiceError(
        'Failed to search users',
        'USER_SEARCH_ERROR',
        { originalError: error, query: searchQuery, filters }
      )
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(adminUser: AdminServiceUser, role: UserRole): Promise<UserList> {
    return this.searchUsers(adminUser, '', { role })
  }

  /**
   * Get active users
   */
  async getActiveUsers(adminUser: AdminServiceUser): Promise<UserList> {
    return this.searchUsers(adminUser, '', { status: true })
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private validatePermission(adminUser: AdminServiceUser, permission: string): void {
    if (!adminUser.permissions.includes(permission as any)) {
      throw new AdminServiceError(
        'Insufficient permissions',
        'INSUFFICIENT_PERMISSIONS',
        { requiredPermission: permission, userPermissions: adminUser.permissions }
      )
    }
  }

  private validateSelfModification(adminUser: AdminServiceUser, targetUserId: string): void {
    if (adminUser.uid === targetUserId) {
      throw new AdminServiceError(
        'Self-modification not allowed',
        'SELF_MODIFICATION_FORBIDDEN',
        { adminId: adminUser.uid, targetUserId }
      )
    }
  }

  private validateAdminDeletion(adminUser: AdminServiceUser, targetUser: AdminUserData): void {
    if (targetUser.role === 'admin') {
      throw new AdminServiceError(
        'Cannot delete admin user',
        'ADMIN_DELETION_FORBIDDEN',
        { adminId: adminUser.uid, targetUserId: targetUser.uid, targetRole: targetUser.role }
      )
    }
  }

  private validateCreateUserData(userData: CreateUserRequest): void {
    if (!userData.email || !userData.email.trim()) {
      throw new AdminServiceError(
        'Email is required',
        'INVALID_USER_DATA',
        { field: 'email' }
      )
    }

    if (!userData.displayName || !userData.displayName.trim()) {
      throw new AdminServiceError(
        'Display name is required',
        'INVALID_USER_DATA',
        { field: 'displayName' }
      )
    }

    if (!userData.role || !['admin', 'editor'].includes(userData.role)) {
      throw new AdminServiceError(
        'Valid role is required (admin or editor)',
        'INVALID_USER_DATA',
        { field: 'role' }
      )
    }

    if (userData.email.length > 254) {
      throw new AdminServiceError(
        'Email is too long (max 254 characters)',
        'INVALID_USER_DATA',
        { field: 'email' }
      )
    }

    if (userData.displayName.length > 100) {
      throw new AdminServiceError(
        'Display name is too long (max 100 characters)',
        'INVALID_USER_DATA',
        { field: 'displayName' }
      )
    }
  }

  private async validateUniqueEmail(email: string): Promise<void> {
    const emailQuery = query(
      collection(db, this.collections.users),
      where('email', '==', email.toLowerCase().trim())
    )
    const snapshot = await getDocs(emailQuery)

    if (!snapshot.empty) {
      throw new AdminServiceError(
        'Email already exists',
        'DUPLICATE_EMAIL',
        { email }
      )
    }
  }

  private validateRoleAssignment(role: UserRole): void {
    if (!['admin', 'editor'].includes(role)) {
      throw new AdminServiceError(
        'Invalid role assignment',
        'ROLE_ASSIGNMENT_INVALID',
        { role }
      )
    }
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  private async logUserAction(
    adminUser: AdminServiceUser,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const auditEntry = {
        userId: adminUser.uid,
        userEmail: adminUser.email,
        action,
        resourceType,
        resourceId,
        details,
        timestamp: serverTimestamp(),
        ipAddress: undefined, // Would be extracted from request context
        userAgent: navigator.userAgent
      }

      await addDoc(collection(db, this.collections.auditLogs), auditEntry)
    } catch (error) {
      console.error('Failed to log user action:', error)
      // Don't throw error - user action should still succeed
    }
  }

  private async handleUserContentDeletion(user: AdminUserData): Promise<void> {
    // This would handle the user's content when they are deleted
    // For now, just log the action
    console.log(`Handling content deletion for user: ${user.email}`)
    
    // In a real implementation, this would:
    // 1. Find all content owned by the user
    // 2. Mark published articles as archived or reassign ownership
    // 3. Delete drafts and private content
    // 4. Update analytics to mark content as deleted
    // 5. Notify other editors if content is reassigned
  }

  private async invalidateUserSessions(userId: string): Promise<void> {
    // This would invalidate all active sessions for the user
    // In a real implementation, this would update session tokens in auth system
    console.log(`Invalidating sessions for user: ${userId}`)
  }
}

// Export singleton instance
export const adminUserService = new AdminUserServiceClass()
