/**
 * Admin System Type Definitions
 * 
 * Core types for the admin system with explicit permissions and roles
 */

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================

export const AdminPermission = {
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DEACTIVATE_USERS: 'deactivate_users',
  DELETE_USERS: 'delete_users',
  VIEW_ARTICLES: 'view_articles',
  DELETE_ARTICLES: 'delete_articles',
  VIEW_AUDIT_LOG: 'view_audit_log',
  MANAGE_SYSTEM: 'manage_system'
} as const

export type AdminPermission = typeof AdminPermission[keyof typeof AdminPermission]

// ============================================================================
// ADMIN ROLES
// ============================================================================

export type AdminRole = 'admin' | 'super_admin'

// Role to permission mapping
export const ROLE_PERMISSIONS = {
  admin: [
    AdminPermission.VIEW_USERS,
    AdminPermission.CREATE_USERS,
    AdminPermission.UPDATE_USERS,
    AdminPermission.DEACTIVATE_USERS,
    AdminPermission.DELETE_USERS,
    AdminPermission.VIEW_ARTICLES,
    AdminPermission.DELETE_ARTICLES,
    AdminPermission.VIEW_AUDIT_LOG
  ],
  super_admin: [
    AdminPermission.VIEW_USERS,
    AdminPermission.CREATE_USERS,
    AdminPermission.UPDATE_USERS,
    AdminPermission.DEACTIVATE_USERS,
    AdminPermission.DELETE_USERS,
    AdminPermission.VIEW_ARTICLES,
    AdminPermission.DELETE_ARTICLES,
    AdminPermission.VIEW_AUDIT_LOG,
    AdminPermission.MANAGE_SYSTEM
  ]
} as const

// ============================================================================
// ADMIN USER TYPES
// ============================================================================

export interface AdminUser {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  permissions: readonly AdminPermission[]
}

// ============================================================================
// ADMIN DATA TYPES
// ============================================================================

export interface AdminUserData {
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
  createdAt: import('firebase/firestore').Timestamp
  updatedAt: import('firebase/firestore').Timestamp
  lastLogin?: import('firebase/firestore').Timestamp | null
}

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
  createdAt: import('firebase/firestore').Timestamp
  updatedAt: import('firebase/firestore').Timestamp
  publishedAt?: import('firebase/firestore').Timestamp
  category?: string
  tags: string[]
}

export interface AuditLogEntry {
  id: string
  userId: string
  userEmail: string
  action: string
  resourceType: string
  resourceId?: string
  details: Record<string, any>
  timestamp: import('firebase/firestore').Timestamp
  ipAddress?: string
  userAgent?: string
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface AdminPaginationResult<T> {
  items: T[]
  hasMore: boolean
  cursor?: any
  totalCount?: number
}

export interface AdminPaginationOptions {
  limit?: number
  cursor?: any
  search?: string
  reset?: boolean
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface AdminServiceUser {
  uid: string
  email: string
  displayName: string
  permissions: readonly AdminPermission[]
}

export interface AdminServiceError extends Error {
  code: string
  details?: Record<string, any>
}

// ============================================================================
// QUERY OPTIONS TYPES
// ============================================================================

export interface AdminUserQueryOptions extends AdminPaginationOptions {
  role?: 'admin' | 'editor'
  status?: boolean
}

export interface AdminArticleQueryOptions extends AdminPaginationOptions {
  type?: 'news' | 'knowledge'
  status?: 'published' | 'saved'
}

export interface AdminAuditQueryOptions extends AdminPaginationOptions {
  userId?: string
  action?: string
  resourceType?: string
  startDate?: import('firebase/firestore').Timestamp
  endDate?: import('firebase/firestore').Timestamp
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface AdminUIState {
  loading: boolean
  error: string | null
  selectedItems: string[]
  filters: Record<string, any>
}

export interface AdminModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
  data?: any
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateUserForm {
  email: string
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
}

export interface UpdateUserForm {
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
}

export interface AdminFormErrors {
  [key: string]: string
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PermissionValidationResult {
  allowed: boolean
  reason?: string
}

// ============================================================================
// METADATA TYPES
// ============================================================================

export interface AdminSystemMetrics {
  totalUsers: number
  activeUsers: number
  totalArticles: number
  publishedArticles: number
  recentActivity: {
    userRegistrations: number
    articleCreations: number
    adminActions: number
  }
}

export interface AdminActionSummary {
  action: string
  count: number
  lastPerformed: import('firebase/firestore').Timestamp
}
