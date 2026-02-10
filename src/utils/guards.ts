import React from 'react'
import { 
  assertNonNull, 
  assertPermission, 
  assertNotSelfModification, 
  assertNotAdminDeletion,
  assertValidEmail,
  assertValidRole,
  assertValidId,
  assertUserActive,
  assertResourceExists
} from './assertions'
import { AdminPermission } from '../types/admin'

/**
 * Defensive Guards for Admin System
 * 
 * Provides validation and protection functions for common admin operations
 */

/**
 * Guard function to check if user can perform action on target
 */
export function canPerformAction(
  userPermissions: string[],
  requiredPermission: string,
  currentUserId: string,
  targetUserId?: string,
  targetUserRole?: string
): { allowed: boolean; reason?: string } {
  try {
    // Check basic permission
    assertPermission(userPermissions, requiredPermission)
    
    // Check self-modification prevention
    if (targetUserId) {
      assertNotSelfModification(currentUserId, targetUserId)
    }
    
    // Check admin deletion prevention
    if (targetUserRole === 'admin' && requiredPermission === AdminPermission.DELETE_USERS) {
      assertNotAdminDeletion(targetUserRole)
    }
    
    return { allowed: true }
  } catch (error) {
    return { 
      allowed: false, 
      reason: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Guard function to validate user data
 */
export function validateUserData(userData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    assertNonNull(userData, 'User data is required')
    assertValidEmail(userData.email, 'Invalid email format')
    assertValidRole(userData.role, ['admin', 'editor'], 'Invalid user role')
    assertValidId(userData.uid, 'Invalid user ID')
    assertUserActive(userData, 'User account is not active')
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Guard function to validate article data
 */
export function validateArticleData(articleData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    assertNonNull(articleData, 'Article data is required')
    assertValidId(articleData.id, 'Invalid article ID')
    
    if (!articleData.title || typeof articleData.title !== 'string') {
      errors.push('Article title is required and must be a string')
    }
    
    if (!articleData.content || typeof articleData.content !== 'string') {
      errors.push('Article content is required and must be a string')
    }
    
    if (!articleData.authorId || typeof articleData.authorId !== 'string') {
      errors.push('Article author ID is required and must be a string')
    }
    
    const validStatuses = ['published', 'saved', 'draft', 'under_review', 'archived']
    if (!validStatuses.includes(articleData.status)) {
      errors.push(`Invalid article status. Must be one of: ${validStatuses.join(', ')}`)
    }
    
    const validTypes = ['news', 'knowledge', 'traditions', 'regulations']
    if (!validTypes.includes(articleData.type)) {
      errors.push(`Invalid article type. Must be one of: ${validTypes.join(', ')}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Guard function to validate pagination parameters
 */
export function validatePagination(params: {
  page?: number
  limit?: number
  maxLimit?: number
}): { valid: boolean; errors: string[]; sanitized: { page: number; limit: number } } {
  const errors: string[] = []
  let page = 1
  let limit = 25
  const maxLimit = params.maxLimit || 100
  
  try {
    if (params.page !== undefined) {
      if (typeof params.page !== 'number' || params.page < 1) {
        errors.push('Page must be a positive number')
      } else {
        page = params.page
      }
    }
    
    if (params.limit !== undefined) {
      if (typeof params.limit !== 'number' || params.limit < 1 || params.limit > maxLimit) {
        errors.push(`Limit must be between 1 and ${maxLimit}`)
      } else {
        limit = params.limit
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { 
    valid: errors.length === 0, 
    errors, 
    sanitized: { page, limit } 
  }
}

/**
 * Guard function to validate search parameters
 */
export function validateSearchParams(params: {
  query?: string
  filters?: Record<string, any>
}): { valid: boolean; errors: string[]; sanitized: { query: string; filters: Record<string, any> } } {
  const errors: string[] = []
  let query = ''
  let filters = {}
  
  try {
    if (params.query !== undefined) {
      if (typeof params.query !== 'string') {
        errors.push('Search query must be a string')
      } else if (params.query.length > 1000) {
        errors.push('Search query is too long (max 1000 characters)')
      } else {
        query = params.query.trim()
      }
    }
    
    if (params.filters !== undefined) {
      if (typeof params.filters !== 'object' || params.filters === null) {
        errors.push('Filters must be an object')
      } else {
        filters = params.filters
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { 
    valid: errors.length === 0, 
    errors, 
    sanitized: { query, filters } 
  }
}

/**
 * Guard function to validate file upload
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  maxFiles?: number
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'application/pdf']
  
  try {
    if (!file) {
      errors.push('File is required')
      return { valid: false, errors }
    }
    
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit (${maxSize / 1024 / 1024}MB)`)
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Guard function to validate bulk operations
 */
export function validateBulkOperation<T>(
  items: T[],
  operation: string,
  options: {
    maxItems?: number
    requiredPermission?: string
    userPermissions?: string[]
  } = {}
): { valid: boolean; errors: string[]; sanitized: T[] } {
  const errors: string[] = []
  const maxItems = options.maxItems || 100
  
  try {
    if (!Array.isArray(items)) {
      errors.push('Items must be an array')
      return { valid: false, errors, sanitized: [] }
    }
    
    if (items.length === 0) {
      errors.push('No items provided for bulk operation')
      return { valid: false, errors, sanitized: [] }
    }
    
    if (items.length > maxItems) {
      errors.push(`Too many items for bulk operation. Maximum: ${maxItems}`)
    }
    
    if (options.requiredPermission && options.userPermissions) {
      assertPermission(options.userPermissions, options.requiredPermission)
    }
    
    // Validate each item
    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Item at index ${index} is invalid`)
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { 
    valid: errors.length === 0, 
    errors, 
    sanitized: items.slice(0, maxItems) 
  }
}

/**
 * Guard function to validate date range
 */
export function validateDateRange(startDate: any, endDate: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      errors.push('Start date is required and must be a valid Date')
    }
    
    if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      errors.push('End date is required and must be a valid Date')
    }
    
    if (startDate && endDate && startDate >= endDate) {
      errors.push('Start date must be before end date')
    }
    
    if (startDate && startDate > new Date()) {
      errors.push('Start date cannot be in the future')
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Guard function to validate sort parameters
 */
export function validateSortParams(params: {
  sortBy?: string
  sortOrder?: string
  allowedSortFields?: string[]
}): { valid: boolean; errors: string[]; sanitized: { sortBy: string; sortOrder: 'asc' | 'desc' } } {
  const errors: string[] = []
  let sortBy = 'createdAt'
  let sortOrder: 'asc' | 'desc' = 'desc'
  
  try {
    if (params.sortBy) {
      if (typeof params.sortBy !== 'string') {
        errors.push('Sort field must be a string')
      } else if (params.allowedSortFields && !params.allowedSortFields.includes(params.sortBy)) {
        errors.push(`Invalid sort field. Allowed fields: ${params.allowedSortFields.join(', ')}`)
      } else {
        sortBy = params.sortBy
      }
    }
    
    if (params.sortOrder) {
      if (!['asc', 'desc'].includes(params.sortOrder)) {
        errors.push('Sort order must be either "asc" or "desc"')
      } else {
        sortOrder = params.sortOrder as 'asc' | 'desc'
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { 
    valid: errors.length === 0, 
    errors, 
    sanitized: { sortBy, sortOrder } 
  }
}

/**
 * Guard function to validate API response
 */
export function validateApiResponse(response: any, expectedFields?: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    if (!response || typeof response !== 'object') {
      errors.push('Response must be an object')
      return { valid: false, errors }
    }
    
    if (expectedFields) {
      expectedFields.forEach(field => {
        if (!(field in response)) {
          errors.push(`Missing required field: ${field}`)
        }
      })
    }
    
    // Check for error response
    if (response.error) {
      errors.push(`API Error: ${response.error}`)
    }
    
    // Check for error status
    if (response.status && response.status >= 400) {
      errors.push(`API Error Status: ${response.status}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Guard function to validate user session
 */
export function validateUserSession(session: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    assertNonNull(session, 'Session is required')
    assertValidId(session.uid, 'Invalid session user ID')
    assertUserActive({ isActive: true }, 'User session is not active')
    
    if (!session.email || typeof session.email !== 'string') {
      errors.push('Session email is required and must be a string')
    }
    
    if (!session.role || typeof session.role !== 'string') {
      errors.push('Session role is required and must be a string')
    }
    
    if (!Array.isArray(session.permissions)) {
      errors.push('Session permissions must be an array')
    }
    
    // Check session expiration
    if (session.expiresAt && session.expiresAt < new Date()) {
      errors.push('Session has expired')
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Guard function to validate configuration
 */
export function validateConfig(config: any, requiredKeys: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    assertNonNull(config, 'Configuration is required')
    
    requiredKeys.forEach(key => {
      if (!(key in config)) {
        errors.push(`Missing required configuration key: ${key}`)
      }
    })
    
    // Validate specific config values
    if (config.maxFileSize && (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0)) {
      errors.push('maxFileSize must be a positive number')
    }
    
    if (config.sessionTimeout && (typeof config.sessionTimeout !== 'number' || config.sessionTimeout <= 0)) {
      errors.push('sessionTimeout must be a positive number')
    }
    
    if (config.allowedOrigins && (!Array.isArray(config.allowedOrigins) || !config.allowedOrigins.every((origin: any) => typeof origin === 'string'))) {
      errors.push('allowedOrigins must be an array of strings')
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Higher-order function to wrap async functions with guards
 */
export function withGuard<T extends any[], R>(
  guardFn: (...args: T) => { valid: boolean; errors: string[] },
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const validation = guardFn(...args)
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    return fn(...args)
  }
}

/**
 * Higher-order function to wrap React components with permission guards
 */
export function withPermissionGuard<P extends object>(
  requiredPermission: string,
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function PermissionGuardedComponent(props: P) {
    // This would typically use the AdminAuthContext
    // For now, it's a placeholder that would be implemented with actual permission checking
    return React.createElement(Component, props)
  }
}

/**
 * Guard function to validate environment variables
 */
export function validateEnvironmentVariables(requiredVars: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`)
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    }
  }
  
  return { valid: errors.length === 0, errors }
}
