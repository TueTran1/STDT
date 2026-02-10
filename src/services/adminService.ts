import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { AdminPermission } from '../contexts/AdminAuthContext'

// Admin user types
export interface AdminUserData {
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLogin?: Timestamp | null
}

// Audit log types
export interface AuditLogEntry {
  id: string
  userId: string
  userEmail: string
  action: string
  resourceType: string
  resourceId?: string
  details: Record<string, any>
  timestamp: Timestamp
  ipAddress?: string
  userAgent?: string
}

// Article management types
export interface AdminArticleData {
  id: string
  type: 'news' | 'knowledge'
  title: string
  slug: string
  status: 'published' | 'saved'
  author: {
    uid: string
    displayName: string
    email: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
  category?: string
  tags: string[]
}

// Pagination types
export interface AdminPaginationResult<T> {
  items: T[]
  hasMore: boolean
  cursor?: any
  totalCount?: number
}

// Service errors
export class AdminServiceError extends Error {
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

// Permission validation
interface AdminServiceUser {
  uid: string
  email: string
  displayName: string
  permissions: readonly AdminPermission[]
}

/**
 * Admin Service Class
 * 
 * Centralized admin operations with:
 * - Explicit permission validation
 * - Comprehensive audit logging
 * - Type safety
 * - Error handling
 */
class AdminService {
  private async validatePermission(
    user: AdminServiceUser,
    permission: AdminPermission,
    resource?: string
  ): Promise<void> {
    if (!user.permissions.includes(permission)) {
      throw new AdminServiceError(
        `Insufficient permissions for action: ${permission}`,
        'INSUFFICIENT_PERMISSIONS',
        { requiredPermission: permission, userPermissions: user.permissions, resource }
      )
    }
  }

  private async logAction(
    user: AdminServiceUser,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const auditEntry: any = {
        userId: user.uid,
        userEmail: user.email,
        action,
        resourceType,
        details: details || {},
        timestamp: serverTimestamp()
      }
      
      // Only include fields if they're defined (Firestore doesn't allow undefined)
      if (resourceId !== undefined) {
        auditEntry.resourceId = resourceId
      }
      
      // Add optional fields if available
      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        auditEntry.userAgent = navigator.userAgent
      }
      
      // ipAddress could be extracted from request context in the future

      await addDoc(collection(db, 'audit_logs'), auditEntry)
    } catch (error) {
      // Audit logging failure should not break the main operation
      console.error('Failed to log admin action:', error)
    }
  }

  // User Management Operations
  async getUsers(
    user: AdminServiceUser,
    options: {
      limit?: number
      cursor?: any
      search?: string
      role?: 'admin' | 'editor'
      status?: boolean
    } = {}
  ): Promise<AdminPaginationResult<AdminUserData>> {
    await this.validatePermission(user, AdminPermission.VIEW_USERS, 'users')

    try {
      const constraints: any[] = []

      // Add filters
      if (options.role) {
        constraints.push(where('role', '==', options.role))
      }
      if (options.status !== undefined) {
        constraints.push(where('isActive', '==', options.status))
      }

      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'))

      // Add pagination
      if (options.cursor) {
        constraints.push(startAfter(options.cursor))
      }
      if (options.limit) {
        constraints.push(limit(options.limit))
      }

      const usersQuery = query(collection(db, 'users'), ...constraints)
      const snapshot = await getDocs(usersQuery)

      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUserData[]

      // Apply client-side search if needed
      let filteredUsers = users
      if (options.search) {
        const searchLower = options.search.toLowerCase()
        filteredUsers = users.filter(user => 
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      }

      await this.logAction(user, 'view_users', 'users', undefined, {
        filters: options,
        resultCount: filteredUsers.length
      })

      return {
        items: filteredUsers,
        hasMore: snapshot.docs.length === (options.limit || 50),
        cursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : undefined
      }
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to fetch users',
        'FETCH_USERS_ERROR',
        { originalError: error }
      )
    }
  }

  async createUser(
    user: AdminServiceUser,
    userData: {
      email: string
      displayName: string
      role: 'admin' | 'editor'
      isActive: boolean
    }
  ): Promise<string> {
    await this.validatePermission(user, AdminPermission.CREATE_USERS, 'users')

    try {
      const userDoc = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null
      }

      const docRef = await addDoc(collection(db, 'users'), userDoc)
      
      await this.logAction(user, 'create_user', 'users', docRef.id, userData)

      return docRef.id
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to create user',
        'CREATE_USER_ERROR',
        { originalError: error, userData }
      )
    }
  }

  async updateUser(
    user: AdminServiceUser,
    userId: string,
    updates: Partial<Pick<AdminUserData, 'displayName' | 'role' | 'isActive'>>
  ): Promise<void> {
    await this.validatePermission(user, AdminPermission.UPDATE_USERS, 'users')

    try {
      const userRef = doc(db, 'users', userId)
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      await this.logAction(user, 'update_user', 'users', userId, updates)
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to update user',
        'UPDATE_USER_ERROR',
        { originalError: error, userId, updates }
      )
    }
  }

  async deactivateUser(
    user: AdminServiceUser,
    userId: string
  ): Promise<void> {
    await this.validatePermission(user, AdminPermission.DEACTIVATE_USERS, 'users')

    try {
      const userRef = doc(db, 'users', userId)
      
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      })

      await this.logAction(user, 'deactivate_user', 'users', userId)
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to deactivate user',
        'DEACTIVATE_USER_ERROR',
        { originalError: error, userId }
      )
    }
  }

  async deleteUser(
    user: AdminServiceUser,
    userId: string
  ): Promise<void> {
    await this.validatePermission(user, AdminPermission.DELETE_USERS, 'users')

    try {
      // Prevent self-deletion
      if (userId === user.uid) {
        throw new AdminServiceError(
          'Cannot delete your own account',
          'SELF_DETECTION_FORBIDDEN'
        )
      }

      await deleteDoc(doc(db, 'users', userId))

      await this.logAction(user, 'delete_user', 'users', userId)
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to delete user',
        'DELETE_USER_ERROR',
        { originalError: error, userId }
      )
    }
  }

  // Article Management Operations
  async getArticles(
    user: AdminServiceUser,
    options: {
      type?: 'news' | 'knowledge'
      status?: 'published' | 'saved'
      limit?: number
      cursor?: any
      search?: string
    } = {}
  ): Promise<AdminPaginationResult<AdminArticleData>> {
    await this.validatePermission(user, AdminPermission.VIEW_ARTICLES, 'articles')

    try {
      const collections = options.type ? [options.type] : ['news', 'knowledge']
      const allArticles: AdminArticleData[] = []

      for (const collectionName of collections) {
        const constraints: any[] = []

        // Add status filter
        if (options.status) {
          constraints.push(where('status', '==', options.status))
        }

        // Add ordering
        constraints.push(orderBy('createdAt', 'desc'))

        // Add pagination
        if (options.cursor) {
          constraints.push(startAfter(options.cursor))
        }
        if (options.limit) {
          constraints.push(limit(options.limit))
        }

        const articlesQuery = query(collection(db, collectionName), ...constraints)
        const snapshot = await getDocs(articlesQuery)

        const articles = snapshot.docs.map(doc => ({
          id: doc.id,
          type: collectionName as 'news' | 'knowledge',
          ...doc.data()
        })) as AdminArticleData[]

        allArticles.push(...articles)
      }

      // Apply client-side search if needed
      let filteredArticles = allArticles
      if (options.search) {
        const searchLower = options.search.toLowerCase()
        filteredArticles = allArticles.filter(article => 
          article.title.toLowerCase().includes(searchLower) ||
          article.author.displayName.toLowerCase().includes(searchLower)
        )
      }

      await this.logAction(user, 'view_articles', 'articles', undefined, {
        filters: options,
        resultCount: filteredArticles.length
      })

      return {
        items: filteredArticles,
        hasMore: false, // Simplified for now
        totalCount: filteredArticles.length
      }
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to fetch articles',
        'FETCH_ARTICLES_ERROR',
        { originalError: error }
      )
    }
  }

  async deleteArticle(
    user: AdminServiceUser,
    articleId: string,
    articleType: 'news' | 'knowledge'
  ): Promise<void> {
    await this.validatePermission(user, AdminPermission.DELETE_ARTICLES, 'articles')

    try {
      await deleteDoc(doc(db, articleType, articleId))

      await this.logAction(user, 'delete_article', 'articles', articleId, {
        articleType
      })
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to delete article',
        'DELETE_ARTICLE_ERROR',
        { originalError: error, articleId, articleType }
      )
    }
  }

  // Audit Log Operations
  async getAuditLogs(
    user: AdminServiceUser,
    options: {
      limit?: number
      cursor?: any
      userId?: string
      action?: string
      resourceType?: string
      startDate?: Timestamp
      endDate?: Timestamp
    } = {}
  ): Promise<AdminPaginationResult<AuditLogEntry>> {
    await this.validatePermission(user, AdminPermission.VIEW_AUDIT_LOG, 'audit_logs')

    try {
      const constraints: any[] = []

      // Add filters
      if (options.userId) {
        constraints.push(where('userId', '==', options.userId))
      }
      if (options.action) {
        constraints.push(where('action', '==', options.action))
      }
      if (options.resourceType) {
        constraints.push(where('resourceType', '==', options.resourceType))
      }
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', options.startDate))
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', options.endDate))
      }

      // Add ordering
      constraints.push(orderBy('timestamp', 'desc'))

      // Add pagination
      if (options.cursor) {
        constraints.push(startAfter(options.cursor))
      }
      if (options.limit) {
        constraints.push(limit(options.limit))
      }

      const logsQuery = query(collection(db, 'audit_logs'), ...constraints)
      const snapshot = await getDocs(logsQuery)

      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLogEntry[]

      return {
        items: logs,
        hasMore: snapshot.docs.length === (options.limit || 50),
        cursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : undefined
      }
    } catch (error) {
      if (error instanceof AdminServiceError) {
        throw error
      }
      throw new AdminServiceError(
        'Failed to fetch audit logs',
        'FETCH_AUDIT_LOGS_ERROR',
        { originalError: error }
      )
    }
  }
}

// Export singleton instance
export const adminService = new AdminService()

// Helper function to create service user from admin auth context
export const createServiceUser = (adminUser: {
  uid: string
  email: string
  displayName: string
  permissions: readonly AdminPermission[]
}): AdminServiceUser => adminUser
