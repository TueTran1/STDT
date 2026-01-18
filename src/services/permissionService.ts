/**
 * PERMISSION SERVICE
 * 
 * Centralized permission enforcement for all content operations
 * This is the ONLY place where permission logic should be implemented
 * 
 * LAYERS OF ENFORCEMENT:
 * 1. UI Layer: Hides/shows buttons based on permissions
 * 2. Service Layer: Validates operations before execution
 * 3. Firestore Rules: Database-level enforcement (final gatekeeper)
 */

import type { NewsArticle, KnowledgeArticle } from '../types/firestore'
import type { ServiceUser } from './contentService'

export type Article = NewsArticle | KnowledgeArticle
export type PermissionAction = 'create' | 'read' | 'update' | 'publish' | 'delete'

export interface PermissionResult {
  allowed: boolean
  reason: string
  action?: PermissionAction
  resource?: string
}

export interface ServicePermission {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canPublish: boolean
  isOwner: boolean
}

/**
 * SERVICE LAYER PERMISSION VALIDATION
 * 
 * This is called BEFORE any database operation
 * If this fails, the operation is blocked at the service level
 */
export class PermissionService {
  
  /**
   * Validate create operation
   */
  static validateCreate(user: ServiceUser): PermissionResult {
    if (!user) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        action: 'create',
        resource: 'article'
      }
    }

    if (user.role === 'editor') {
      return {
        allowed: true,
        reason: 'Editor can create articles',
        action: 'create',
        resource: 'article'
      }
    }

    return {
      allowed: false,
      reason: 'Only editors can create articles',
      action: 'create',
      resource: 'article'
    }
  }

  /**
   * Validate read operation
   */
  static validateRead(user: ServiceUser, article?: Article): PermissionResult {
    if (!user) {
      // Public can read published articles
      if (article?.status === 'published') {
        return {
          allowed: true,
          reason: 'Public access to published article',
          action: 'read',
          resource: 'article'
        }
      }
      return {
        allowed: false,
        reason: 'Authentication required',
        action: 'read',
        resource: 'article'
      }
    }

    if (user.role === 'admin') {
      return {
        allowed: true,
        reason: 'Admin can read any article',
        action: 'read',
        resource: 'article'
      }
    }

    if (user.role === 'editor') {
      const isOwner = this.checkOwnership(article, user.id)
      const isPublished = article?.status === 'published'

      if (isOwner || isPublished) {
        return {
          allowed: true,
          reason: isOwner ? 'Editor reading own article' : 'Editor reading published article',
          action: 'read',
          resource: 'article'
        }
      }
    }

    return {
      allowed: false,
      reason: 'Permission denied to read article',
      action: 'read',
      resource: 'article'
    }
  }

  /**
   * Validate update operation
   */
  static validateUpdate(user: ServiceUser, article: Article): PermissionResult {
    if (!user) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        action: 'update',
        resource: 'article'
      }
    }

    if (user.role === 'admin') {
      return {
        allowed: false,
        reason: 'Admins cannot update articles',
        action: 'update',
        resource: 'article'
      }
    }

    if (user.role === 'editor') {
      const isOwner = this.checkOwnership(article, user.id)
      
      if (isOwner) {
        return {
          allowed: true,
          reason: 'Editor can update own article',
          action: 'update',
          resource: 'article'
        }
      }
      
      return {
        allowed: false,
        reason: 'Editor can only update own articles',
        action: 'update',
        resource: 'article'
      }
    }

    return {
      allowed: false,
      reason: 'Invalid role for update operation',
      action: 'update',
      resource: 'article'
    }
  }

  /**
   * Validate publish operation
   */
  static validatePublish(user: ServiceUser, article: Article): PermissionResult {
    if (!user) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        action: 'publish',
        resource: 'article'
      }
    }

    if (user.role === 'admin') {
      return {
        allowed: false,
        reason: 'Admins cannot publish articles',
        action: 'publish',
        resource: 'article'
      }
    }

    if (user.role === 'editor') {
      const isOwner = this.checkOwnership(article, user.id)
      
      if (isOwner) {
        return {
          allowed: true,
          reason: 'Editor can publish own article',
          action: 'publish',
          resource: 'article'
        }
      }
      
      return {
        allowed: false,
        reason: 'Editor can only publish own articles',
        action: 'publish',
        resource: 'article'
      }
    }

    return {
      allowed: false,
      reason: 'Invalid role for publish operation',
      action: 'publish',
      resource: 'article'
    }
  }

  /**
   * Validate delete operation
   */
  static validateDelete(user: ServiceUser, article?: Article): PermissionResult {
    if (!user) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        action: 'delete',
        resource: 'article'
      }
    }

    if (user.role === 'admin') {
      return {
        allowed: true,
        reason: 'Admin can delete any article',
        action: 'delete',
        resource: 'article'
      }
    }

    if (user.role === 'editor') {
      return {
        allowed: false,
        reason: 'Editors cannot delete articles',
        action: 'delete',
        resource: 'article'
      }
    }

    return {
      allowed: false,
      reason: 'Invalid role for delete operation',
      action: 'delete',
      resource: 'article'
    }
  }

  /**
   * Get service permissions for UI layer
   */
  static getServicePermissions(user: ServiceUser, article?: Article): ServicePermission {
    const create = this.validateCreate(user)
    const read = this.validateRead(user, article)
    const update = article ? this.validateUpdate(user, article) : { allowed: false }
    const delete_ = this.validateDelete(user, article)
    const publish = article ? this.validatePublish(user, article) : { allowed: false }

    return {
      canCreate: create.allowed,
      canUpdate: update.allowed,
      canDelete: delete_.allowed,
      canPublish: publish.allowed,
      isOwner: article ? this.checkOwnership(article, user.id) : false
    }
  }

  /**
   * Check article ownership
   */
  private static checkOwnership(article?: Article, userId?: string): boolean {
    if (!article || !userId) return false

    // Primary ownership check
    if (article.createdBy === userId) {
      return true
    }

    // Secondary ownership check
    if (article.author?.uid === userId) {
      return true
    }

    return false
  }

  /**
   * Validate route access
   */
  static validateRouteAccess(route: string, user?: ServiceUser): { allowed: boolean; redirectTo?: string } {
    if (!user) {
      // Public routes
      const publicRoutes = ['/', '/login', '/news', '/knowledge', '/news/', '/knowledge/']
      if (publicRoutes.some(path => route.startsWith(path))) {
        return { allowed: true }
      }
      return { allowed: false, redirectTo: '/login' }
    }

    // FORBIDDEN ROUTES FOR ADMINS
    if (user.role === 'admin') {
      const forbiddenForAdmin = [
        '/news/create',
        '/news/new', 
        '/knowledge/create',
        '/knowledge/new',
        '/news/edit',
        '/knowledge/edit'
      ]
      
      if (forbiddenForAdmin.some(path => route.startsWith(path))) {
        return { allowed: false, redirectTo: '/access-denied' }
      }
    }

    // FORBIDDEN ROUTES FOR EDITORS
    if (user.role === 'editor') {
      const forbiddenForEditor = ['/admin']
      
      if (forbiddenForEditor.some(path => route.startsWith(path))) {
        return { allowed: false, redirectTo: '/access-denied' }
      }
    }

    return { allowed: true }
  }
}
