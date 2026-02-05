// Shared Article Service
// Central place for ALL article CRUD operations (News & Knowledge)
// No UI knowledge, No React imports

import { collection, getDocs, orderBy, query, where, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, QueryDocumentSnapshot, limit as limitFn, startAfter as startAfterFn } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { NewsArticle, KnowledgeArticle } from '../types/firestore'

// Generic article type for CRUD operations
export type Article = NewsArticle | KnowledgeArticle
export type ArticleType = 'news' | 'knowledge'

// Query helper types
export interface ArticleQueryOptions {
  limit?: number
  orderBy?: {
    field: string
    direction: 'asc' | 'desc'
  }
  where?: {
    field: string
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any'
    value: any
  }[]
  status?: 'saved' | 'published'
  category?: string
  featured?: boolean
  startAfter?: any // Firestore document cursor
  createdBy?: string // User ID for filtering saved articles
}

export interface PaginatedResult<T> {
  items: T[]
  hasMore: boolean
  lastVisible: any // Firestore document cursor for next page
}

/**
 * Get all articles of a specific type
 */
export const getArticles = async (
  articleType: ArticleType,
  options: ArticleQueryOptions = {}
): Promise<Article[]> => {
  try {
    const collectionRef = collection(db, articleType)
    
    // Build query with constraints
    const constraints = []
    
    // Add status filter if provided
    if (options.status) {
      constraints.push(where('status', '==', options.status))
    }
    
    // Add category filter if provided
    if (options.category) {
      constraints.push(where('category', '==', options.category))
    }
    
    // Add featured filter if provided
    if (options.featured !== undefined) {
      constraints.push(where('featured', '==', options.featured))
    }
    
    // Add createdBy filter for saved articles (CRITICAL: Users should only see their own saved articles)
    if (options.status === 'saved' && options.createdBy) {
      constraints.push(where('createdBy', '==', options.createdBy))
    }
    
    // Add custom where clauses
    if (options.where) {
      constraints.push(...options.where.map(w => where(w.field, w.operator, w.value)))
    }
    
    // Add ordering
    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction))
    } else {
      constraints.push(orderBy('createdAt', 'desc'))
    }
    
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
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Article
    })
  } catch (error) {
    return []
  }
}

/**
 * Get a single article by ID
 */
export const getArticleById = async (
  articleType: ArticleType,
  id: string
): Promise<Article | null> => {
  try {
    const docRef = doc(db, articleType, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data()
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Article
  } catch (error) {
    return null
  }
}

/**
 * Create a new article
 */
export const createArticle = async (
  articleType: ArticleType,
  articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Article> => {
  try {
    const collectionRef = collection(db, articleType)
    
    // Prepare article document with required fields
    const articleDoc = {
      ...articleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Add document to Firestore
    const docRef = await addDoc(collectionRef, articleDoc)
    
    // Return complete article document with generated ID
    return {
      ...articleData,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Article
  } catch (error) {
    throw new Error(`Failed to create ${articleType} article`)
  }
}

/**
 * Update an existing article
 */
export const updateArticle = async (
  articleType: ArticleType,
  id: string,
  updates: Partial<Article>
): Promise<Article> => {
  try {
    const docRef = doc(db, articleType, id)
    
    // Prepare update data with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    // Update the document
    await updateDoc(docRef, updateData)
    
    // Get the updated document to return
    const updatedArticle = await getArticleById(articleType, id)
    if (!updatedArticle) {
      throw new Error(`Failed to retrieve updated ${articleType} article`)
    }
    
    return updatedArticle
  } catch (error) {
    throw new Error(`Failed to update ${articleType} article`)
  }
}

/**
 * Delete an article
 */
export const deleteArticle = async (
  articleType: ArticleType,
  id: string
): Promise<void> => {
  try {
    const docRef = doc(db, articleType, id)
    await deleteDoc(docRef)
  } catch (error) {
    throw new Error(`Failed to delete ${articleType} article`)
  }
}

/**
 * Search articles by text query (basic implementation)
 * 
 * CRITICAL: Search is ALWAYS scoped by status first, then text search
 * No cross-status search is allowed
 */
export const searchArticles = async (
  articleType: ArticleType,
  searchText: string,
  options: ArticleQueryOptions = {}
): Promise<Article[]> => {
  try {
    // ENFORCEMENT: Status is the PRIMARY filter - never optional for search
    if (!options.status) {
      throw new Error('Search requires explicit status filter to prevent cross-status leakage')
    }
    
    // CRITICAL: When searching saved articles, createdBy is required to prevent users from seeing others' saved articles
    if (options.status === 'saved' && !options.createdBy) {
      throw new Error('Search for saved articles requires createdBy filter to prevent cross-user access')
    }
        
    // For now, we'll do a simple client-side search
    // In a production app, you might want to use Algolia or Firebase Extensions
    // IMPORTANT: getArticles already filters by status and createdBy at the Firestore level
    const allArticles = await getArticles(articleType, {
      ...options,
      limit: 100 // Get more articles for better search results
    })
    
    
    if (!searchText.trim()) {
      return allArticles
    }
    
    const searchLower = searchText.toLowerCase()
    
    // Text search is applied AFTER status filtering - never alters status scope
    // Additional safety: double-filter to ensure no cross-status leakage
    const filteredResults = allArticles.filter(article => {
      // CRITICAL: Verify status matches the requested status (defense-in-depth)
      if (article.status !== options.status) {
        return false
      }
      
      // CRITICAL: Verify createdBy matches for saved articles (defense-in-depth)
      if (options.status === 'saved' && article.createdBy !== options.createdBy) {
        return false
      }
      
      // Apply text search only to articles with correct status and owner
      const textMatches = (
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.excerpt?.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
      
      return textMatches
    })
    
    return filteredResults
  } catch (error) {
    return []
  }
}

/**
 * Helper function to validate article data before saving
 */
export const validateArticle = (
  articleData: Partial<Article>,
  articleType: ArticleType
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Common validations
  if (!articleData.title?.trim()) {
    errors.push('Tiêu đề là bắt buộc')
  }
  
  if (!articleData.slug?.trim()) {
    errors.push('Slug là bắt buộc')
  }
  
  if (!articleData.content?.trim()) {
    errors.push('Nội dung là bắt buộc')
  }
  
  if (!articleData.author?.uid || !articleData.author?.displayName) {
    errors.push('Thông tin tác giả là bắt buộc')
  }
  
  // News-specific validations
  if (articleType === 'news') {
    const newsArticle = articleData as NewsArticle
    if (!newsArticle.excerpt?.trim()) {
      errors.push('Tóm tắt là bắt buộc cho tin tức')
    }
  }
  
  // Knowledge-specific validations
  if (articleType === 'knowledge') {
    const knowledgeArticle = articleData as KnowledgeArticle
    if (!knowledgeArticle.summary?.trim()) {
      errors.push('Tóm tắt là bắt buộc cho kiến thức')
    }
    
    if (!knowledgeArticle.category || !['quan-su', 'chinh-tri', 'hau-can', 'ky-thuat'].includes(knowledgeArticle.category)) {
      errors.push('Danh mục kiến thức không hợp lệ')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get articles with cursor-based pagination
 */
export const getArticlesPaginated = async (
  articleType: ArticleType,
  options: ArticleQueryOptions = {}
): Promise<PaginatedResult<Article>> => {
  try {
    const collectionRef = collection(db, articleType)
    
    // Build query with constraints
    const constraints = []
    
    // Add status filter if provided
    if (options.status) {
      constraints.push(where('status', '==', options.status))
    }
    
    // Add category filter if provided
    if (options.category) {
      constraints.push(where('category', '==', options.category))
    }
    
    // Add featured filter if provided
    if (options.featured !== undefined) {
      constraints.push(where('featured', '==', options.featured))
    }
    
    // Add createdBy filter for saved articles (CRITICAL: Users should only see their own saved articles)
    if (options.status === 'saved' && options.createdBy) {
      constraints.push(where('createdBy', '==', options.createdBy))
    }
    
    // Add custom where clauses
    if (options.where) {
      constraints.push(...options.where.map(w => where(w.field, w.operator, w.value)))
    }
    
    // Add ordering (always by createdAt for pagination consistency)
    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction))
    } else {
      constraints.push(orderBy('createdAt', 'desc'))
    }
    
    // Add cursor for pagination
    if (options.startAfter) {
      constraints.push(startAfterFn(options.startAfter))
    }
    
    // Add limit if provided - fetch one extra to determine if there are more items
    const effectiveLimit = options.limit && options.limit > 0 ? options.limit + 1 : 9
    if (options.limit && options.limit > 0) {
      constraints.push(limitFn(effectiveLimit))
    }
    
    const articlesQuery = query(collectionRef, ...constraints)
    const querySnapshot = await getDocs(articlesQuery)
    
    const allItems = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Article
    })
    
    // Return only the requested limit, but use all items to determine hasMore
    const items = allItems.slice(0, options.limit || 9)
    
    // Check if there are more items by comparing fetched count to requested limit
    // If we fetched more than the limit, there are more items
    const hasMore = allItems.length > (options.limit || 9)
    
    // Get the last visible document for cursor
    const lastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
    
    return {
      items,
      hasMore,
      lastVisible
    }
  } catch (error) {
    return {
      items: [],
      hasMore: false,
      lastVisible: null
    }
  }
}
