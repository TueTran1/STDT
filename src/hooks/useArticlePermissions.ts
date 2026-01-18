import { useAuth } from '../contexts/AuthContext'
import type { NewsArticle, KnowledgeArticle } from '../types/firestore'

export type Article = NewsArticle | KnowledgeArticle
export type PermissionAction = 'create' | 'read' | 'update' | 'publish' | 'delete'

export interface ArticlePermissions {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canPublish: boolean
  canDelete: boolean
  isOwner: boolean
  reason?: string
}

/**
 * CENTRALIZED PERMISSION SYSTEM
 * 
 * This is the SINGLE source of truth for all article permissions.
 * No scattered role checks allowed anywhere else in the codebase.
 * 
 * NON-NEGOTIABLE RULES:
 * - Editors: Create, Update (own only), Publish (own only), Read (own + published)
 * - Admins: Delete (any), Read (any)
 * - No role overlap, no implicit permissions
 */
export const useArticlePermissions = (article?: Article): ArticlePermissions => {
  const { user, hasRole } = useAuth()

  // Base authentication check
  if (!user) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canPublish: false,
      canDelete: false,
      isOwner: false,
      reason: 'Not authenticated'
    }
  }

  // Check ownership for existing articles
  const isOwner = article ? checkArticleOwnership(article, user.uid) : false

  // ROLE-BASED PERMISSION MATRIX
  const isEditor = hasRole('editor') && !hasRole('admin')
  const isAdmin = hasRole('admin')

  // EDITOR PERMISSIONS
  if (isEditor) {
    return {
      canCreate: true,
      canRead: isOwner || (article?.status === 'published'),
      canUpdate: isOwner,
      canPublish: isOwner,
      canDelete: false,
      isOwner,
      reason: isOwner ? 'Editor - Owner' : 'Editor - Not owner'
    }
  }

  // ADMIN PERMISSIONS
  if (isAdmin) {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canPublish: false,
      canDelete: true,
      isOwner: false,
      reason: 'Admin - Delete only'
    }
  }

  // FALLBACK - No valid role
  return {
    canCreate: false,
    canRead: article?.status === 'published',
    canUpdate: false,
    canPublish: false,
    canDelete: false,
    isOwner: false,
    reason: 'No valid role'
  }
}

/**
 * Check if user owns the article
 */
const checkArticleOwnership = (article: Article, userId: string): boolean => {
  // Check createdBy field (primary ownership)
  if (article.createdBy === userId) {
    return true
  }

  // Check author.uid field (secondary ownership)
  if (article.author?.uid === userId) {
    return true
  }

  return false
}

/**
 * Permission validation for specific actions
 */
export const validateArticleAction = (
  action: PermissionAction,
  article?: Article,
  user?: { uid: string; role: 'admin' | 'editor' }
): { allowed: boolean; reason: string } => {
  if (!user) {
    return { allowed: false, reason: 'User not authenticated' }
  }

  const isEditor = user.role === 'editor'
  const isAdmin = user.role === 'admin'
  const isOwner = article ? checkArticleOwnership(article, user.uid) : false

  switch (action) {
    case 'create':
      if (isEditor && !isAdmin) {
        return { allowed: true, reason: 'Editor can create articles' }
      }
      return { allowed: false, reason: 'Only editors can create articles' }

    case 'read':
      if (isAdmin) {
        return { allowed: true, reason: 'Admin can read any article' }
      }
      if (isEditor && (isOwner || article?.status === 'published')) {
        return { allowed: true, reason: 'Editor can read own or published articles' }
      }
      if (article?.status === 'published') {
        return { allowed: true, reason: 'Public can read published articles' }
      }
      return { allowed: false, reason: 'Permission denied to read article' }

    case 'update':
      if (isEditor && !isAdmin && isOwner) {
        return { allowed: true, reason: 'Editor can update own articles' }
      }
      return { allowed: false, reason: 'Only editors can update own articles' }

    case 'publish':
      if (isEditor && !isAdmin && isOwner) {
        return { allowed: true, reason: 'Editor can publish own articles' }
      }
      return { allowed: false, reason: 'Only editors can publish own articles' }

    case 'delete':
      if (isAdmin) {
        return { allowed: true, reason: 'Admin can delete any article' }
      }
      return { allowed: false, reason: 'Only admins can delete articles' }

    default:
      return { allowed: false, reason: 'Unknown action' }
  }
}

/**
 * Route permission checker
 */
export const canAccessRoute = (
  route: string,
  user?: { uid: string; role: 'admin' | 'editor' }
): { allowed: boolean; redirectTo?: string } => {
  if (!user) {
    return { allowed: false, redirectTo: '/login' }
  }

  const isEditor = user.role === 'editor'
  const isAdmin = user.role === 'admin'

  // FORBIDDEN ROUTES FOR ADMINS
  if (isAdmin) {
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
  if (isEditor) {
    const forbiddenForEditor = [
      '/admin'
    ]
    
    if (forbiddenForEditor.some(path => route.startsWith(path))) {
      return { allowed: false, redirectTo: '/access-denied' }
    }
  }

  // ALLOWED ROUTES
  if (isEditor) {
    const allowedForEditor = [
      '/news',
      '/knowledge',
      '/news/create',
      '/news/new',
      '/knowledge/create',
      '/knowledge/new',
      '/news/',
      '/knowledge/'
    ]
    
    if (allowedForEditor.some(path => route.startsWith(path))) {
      return { allowed: true }
    }
  }

  if (isAdmin) {
    const allowedForAdmin = [
      '/news',
      '/knowledge',
      '/admin',
      '/news/',
      '/knowledge/'
    ]
    
    if (allowedForAdmin.some(path => route.startsWith(path))) {
      return { allowed: true }
    }
  }

  return { allowed: true }
}
