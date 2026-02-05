// Unified Content Service
// Single source of truth for all content operations
// Centralized permission logic and Firestore operations

import { collection, getDocs, orderBy, query, where, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, QueryDocumentSnapshot, limit as limitFn, QueryConstraint } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { NewsArticle, KnowledgeArticle } from '../types/firestore'

// Content types
export type ContentType = 'news' | 'knowledge'
export type ContentStatus = 'saved' | 'published'
export type Article = NewsArticle | KnowledgeArticle

// User interface for service layer
export interface ServiceUser {
  id: string
  username: string
  role: 'admin' | 'editor'
}

// Internal interfaces for service operations
interface CreateArticleData {
  title: string
  slug: string
  content: string
  excerpt?: string
  summary?: string
  tags: string[]
  featured: boolean
  status: ContentStatus
  author: {
    uid: string
    displayName: string
    photoURL?: string
  }
  // News-specific fields
  category?: string
  readingTime?: number
  viewCount?: number
  metadata?: {
    seoTitle?: string
    seoDescription?: string
    keywords?: string[]
  }
  // Knowledge-specific fields
  estimatedTime?: number
  engagement?: {
    views: number
    likes: number
    shares: number
    bookmarks: number
  }
  type?: string
  subcategory?: string
  media?: {
    images: string[]
    videos: string[]
    documents?: string[]
  }
  prerequisites?: string[]
  relatedKnowledge?: string[]
  review?: {
    isReviewed: boolean
    reviewedBy?: string
    reviewedAt?: Date
    rating?: number
    feedback?: string
  }
}

/**
 * Create a new article
 * 
 * @param type - Content type ('news' or 'knowledge')
 * @param data - Article data
 * @param userId - Current user ID for ownership
 * @returns Created article with Firestore timestamps
 */
export const createArticle = async (
  type: ContentType,
  data: CreateArticleData,
  userId: string
): Promise<Article> => {
  try {
    
    if (!data.author || data.author.uid !== userId) {
            throw new Error(`Author UID must match current user ID for permission validation`)
    }
    
    
    const collectionRef = collection(db, type)
    
    // Prepare article document with Firestore timestamps and required fields
    const articleDoc = {
      ...data,
      createdBy: userId, // Required by Firestore rules
      updatedBy: userId, // Required by Firestore rules
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    
    // Add document to Firestore
    const docRef = await addDoc(collectionRef, articleDoc)
    
    // Return complete article document with generated ID and proper timestamps
    return {
      ...data,
      id: docRef.id,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Article
  } catch (error) {
    // Provide more specific error message for permission issues
    if (error instanceof Error && error.message.includes('permission-denied')) {
      throw new Error(`Missing or insufficient permissions: ${error.message}. Please ensure you're logged in as an editor and your account is active.`)
    }
    throw new Error(`Failed to create ${type} article: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Update an existing article
 * 
 * @param type - Content type ('news' or 'knowledge')
 * @param id - Article ID
 * @param data - Updated article data
 * @param userId - Current user ID for ownership check
 * @param userRole - Current user role for permission check
 * @returns Updated article
 */
export const updateArticle = async (
  type: ContentType,
  id: string,
  data: Partial<CreateArticleData>,
  userId: string,
  userRole: 'admin' | 'editor'
): Promise<Article> => {
  try {
    const docRef = doc(db, type, id)
    
    // First, get the existing document to check ownership
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error(`Article not found`)
    }
    
    // Permission check: Editors can only update their own articles
    if (userRole === 'editor') {
      const existingData = docSnap.data() as Article
      if (existingData.createdBy !== userId) {
        throw new Error(`Permission denied: You can only update your own articles`)
      }
    }
    
    // Admins can update any article (if needed for moderation)
    // If you want to restrict admins from updating, add:
    // if (userRole === 'admin') {
    //   throw new Error(`Admins are not allowed to update articles`)
    // }
    
    // Prepare update data with timestamp
    const updateData = {
      ...data,
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }
    
    // Update the document
    await updateDoc(docRef, updateData)
    
    // Get the updated document to return
    const updatedDoc = await getDoc(docRef)
    if (!updatedDoc.exists()) {
      throw new Error(`Failed to retrieve updated article`)
    }
    
    const updatedData = updatedDoc.data()
    return {
      ...updatedData,
      id: updatedDoc.id,
      createdAt: updatedData.createdAt && typeof updatedData.createdAt === 'object' && 'toDate' in updatedData.createdAt 
        ? (updatedData.createdAt as any).toDate() 
        : (updatedData.createdAt instanceof Date ? updatedData.createdAt : new Date()),
      updatedAt: updatedData.updatedAt && typeof updatedData.updatedAt === 'object' && 'toDate' in updatedData.updatedAt 
        ? (updatedData.updatedAt as any).toDate() 
        : (updatedData.updatedAt instanceof Date ? updatedData.updatedAt : new Date())
    } as Article
  } catch (error) {
    throw new Error(`Failed to update ${type} article: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete an article
 * 
 * @param type - Content type ('news' or 'knowledge')
 * @param id - Article ID
 * @param userId - Current user ID for ownership check
 * @param userRole - Current user role for permission check
 */
export const deleteArticle = async (
  type: ContentType,
  id: string,
  _userId: string,
  userRole: 'admin' | 'editor'
): Promise<void> => {
  try {
    const docRef = doc(db, type, id)
    
    // First, get the existing document to check ownership
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error(`Article not found`)
    }
    
    // Permission check: Editors cannot delete, Admins can delete any article
    if (userRole === 'editor') {
      throw new Error(`Permission denied: Editors are not allowed to delete articles`)
    }
    
    // Admins can delete any article (ownership check bypassed)
    if (userRole === 'admin') {
      // Admin delete bypasses ownership check
    }
    
    // Delete the document
    await deleteDoc(docRef)
  } catch (error) {
    throw new Error(`Failed to delete ${type} article: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get published articles (public access)
 * 
 * @param type - Content type ('news' or 'knowledge')
 * @param options - Query options
 * @returns Array of published articles
 */
export const getPublishedArticles = async (
  type: ContentType,
  options: {
    limit?: number
    category?: string
    featured?: boolean
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  } = {}
): Promise<Article[]> => {
  try {
    const collectionRef = collection(db, type)
    
    // Build query constraints
    const constraints: QueryConstraint[] = [
      where('status', '==', 'published') // Only published articles
    ]
    
    // Add category filter if provided
    if (options.category) {
      constraints.push(where('category', '==', options.category))
    }
    
    // Add featured filter if provided
    if (options.featured !== undefined) {
      constraints.push(where('featured', '==', options.featured))
    }
    
    // Add ordering
    const orderByField = options.orderBy || 'createdAt'
    const orderDirection = options.orderDirection || 'desc'
    constraints.push(orderBy(orderByField, orderDirection))
    
    // Add limit if provided
    if (options.limit && options.limit > 0) {
      constraints.push(limitFn(options.limit))
    }
    
    const articlesQuery = query(collectionRef, ...constraints)
    const querySnapshot = await getDocs(articlesQuery)
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt 
          ? (data.createdAt as any).toDate() 
          : (data.createdAt instanceof Date ? data.createdAt : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt 
          ? (data.updatedAt as any).toDate() 
          : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
      } as Article
    })
  } catch (error) {
    return []
  }
}

/**
 * Get saved articles for a specific user (private access)
 * 
 * @param type - Content type ('news' or 'knowledge')
 * @param userId - User ID to fetch articles for
 * @param options - Query options
 * @returns Array of user's saved articles
 */
export const getSavedArticles = async (
  type: ContentType,
  userId: string,
  options: {
    limit?: number
    category?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  } = {}
): Promise<Article[]> => {
  try {
    const collectionRef = collection(db, type)
    
    // Try primary query first (createdBy field)
    try {
      // Build query constraints for saved articles
      const constraints: QueryConstraint[] = [
        where('status', '==', 'saved'), // Only saved articles
        where('createdBy', '==', userId) // Only user's own articles (Firebase Auth UID)
      ]
      
      // Add category filter if provided
      if (options.category) {
        constraints.push(where('category', '==', options.category))
      }
      
      // Add ordering
      const orderByField = options.orderBy || 'createdAt'
      const orderDirection = options.orderDirection || 'desc'
      constraints.push(orderBy(orderByField, orderDirection))
      
      // Add limit if provided
      if (options.limit && options.limit > 0) {
        constraints.push(limitFn(options.limit))
      }
      
      const articlesQuery = query(collectionRef, ...constraints)
      const querySnapshot = await getDocs(articlesQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt 
            ? (data.createdAt as any).toDate() 
            : (data.createdAt instanceof Date ? data.createdAt : new Date()),
          updatedAt: data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt 
            ? (data.updatedAt as any).toDate() 
            : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
        } as Article
      })
    } catch (primaryError) {
      // If primary query fails due to permissions, try secondary query (author.uid field)
      
      const constraints: QueryConstraint[] = [
        where('status', '==', 'saved'), // Only saved articles
        where('author.uid', '==', userId) // Check author.uid field as fallback
      ]
      
      // Add category filter if provided
      if (options.category) {
        constraints.push(where('category', '==', options.category))
      }
      
      // Add ordering
      const orderByField = options.orderBy || 'createdAt'
      const orderDirection = options.orderDirection || 'desc'
      constraints.push(orderBy(orderByField, orderDirection))
      
      // Add limit if provided
      if (options.limit && options.limit > 0) {
        constraints.push(limitFn(options.limit))
      }
      
      try {
        const articlesQuery = query(collectionRef, ...constraints)
        const querySnapshot = await getDocs(articlesQuery)
        
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt 
              ? (data.createdAt as any).toDate() 
              : (data.createdAt instanceof Date ? data.createdAt : new Date()),
            updatedAt: data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt 
              ? (data.updatedAt as any).toDate() 
              : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
          } as Article
        })
      } catch (fallbackError) {
        throw fallbackError
      }
    }
  } catch (error) {
    // Surface auth errors clearly to UI - do not catch silently
    
    // Re-throw permission errors for UI handling
    if (error instanceof Error && error.message.includes('permission-denied')) {
      throw new Error(`Missing or insufficient permissions. This may be due to article ownership mismatch. Please ensure the article's createdBy and author.uid fields match your user ID (${userId}).`)
    }
    
    // Re-throw auth errors for UI handling
    if (error instanceof Error && error.message.includes('auth/')) {
      throw new Error(`Authentication error: ${error.message}`)
    }
    
    // Re-throw other errors for UI handling
    throw new Error(`Failed to fetch saved articles: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get a single article by ID (with permission check)
 * 
 * @param type - Content type ('news' or 'knowledge')
 * @param id - Article ID
 * @param userId - Current user ID for ownership check
 * @param userRole - Current user role for permission check
 * @returns Article or null if not found
 */
export const getArticleById = async (
  type: ContentType,
  id: string,
  userId?: string,
  userRole?: 'admin' | 'editor'
): Promise<Article | null> => {
  try {
    const docRef = doc(db, type, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data() as Article
    
    // Permission check for non-published articles
    if (data.status !== 'published' && userId && userRole) {
      // Only allow access to own saved/draft articles
      if (data.createdBy !== userId && userRole !== 'admin') {
        throw new Error(`Permission denied: You can only access your own unpublished articles`)
      }
    }
    
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt 
        ? (data.createdAt as any).toDate() 
        : (data.createdAt instanceof Date ? data.createdAt : new Date()),
      updatedAt: data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt 
        ? (data.updatedAt as any).toDate() 
        : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
    } as Article
  } catch (error) {
    throw error
  }
}

/**
 * Helper function to check if user can access an article
 * 
 * @param article - Article to check
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @returns Permission status
 */
export const checkArticleAccess = (
  article: Article,
  userId: string,
  userRole: 'admin' | 'editor'
): { canRead: boolean; canUpdate: boolean; canDelete: boolean } => {
  // Published articles are public
  if (article.status === 'published') {
    return {
      canRead: true,
      canUpdate: userRole === 'editor' && article.createdBy === userId,
      canDelete: userRole === 'admin'
    }
  }
  
  // Unpublished articles have restricted access
  const isOwner = article.createdBy === userId
  const isAdmin = userRole === 'admin'
  
  return {
    canRead: isOwner || isAdmin,
    canUpdate: (userRole === 'editor' && isOwner) || isAdmin,
    canDelete: isAdmin // Only admins can delete
  }
}
