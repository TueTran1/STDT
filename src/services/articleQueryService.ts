// Article Query Service
// Centralized query execution service - NO state management
// Single source of truth for ALL Firestore article queries

import { collection, getDocs, orderBy, query, where, limit as limitFn, startAfter as startAfterFn, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Article } from '../components/ui'

export type ArticleType = 'news' | 'knowledge'
export type ViewMode = 'published' | 'saved'

export interface QueryParams {
  articleType: ArticleType
  viewMode: ViewMode
  category?: string | null
  searchQuery?: string | null
  cursor?: any // Firestore document cursor
  limit?: number
  userId?: string // Required for saved articles
}

export interface QueryResult {
  items: Article[]
  hasMore: boolean
  lastVisible: any // Firestore document cursor for next page
}

/**
 * Build Firestore query based on parameters
 * NO side effects, pure function
 */
export const buildQuery = (params: QueryParams) => {
  const { articleType, viewMode, category, cursor, limit = 9, userId } = params
  
  const collectionRef = collection(db, articleType)
  const constraints = []

  // Status filter - ALWAYS applied
  constraints.push(where('status', '==', viewMode))

  // User filter for saved articles - SECURITY CRITICAL
  if (viewMode === 'saved' && userId) {
    constraints.push(where('createdBy', '==', userId))
  }

  // Category filter - server-side only
  if (category) {
    constraints.push(where('category', '==', category))
  }

  // Ordering - ALWAYS by createdAt for consistency
  constraints.push(orderBy('createdAt', 'desc'))

  // Cursor for pagination
  if (cursor) {
    constraints.push(startAfterFn(cursor))
  }

  // Limit - fetch one extra to determine hasMore
  constraints.push(limitFn(limit + 1))

  return query(collectionRef, ...constraints)
}

/**
 * Execute query and return paginated results
 * NO state management, pure data transformation
 */
export const executeQuery = async (params: QueryParams): Promise<QueryResult> => {
  try {
    // Validate required parameters
    if (params.viewMode === 'saved' && !params.userId) {
      throw new Error('User ID required for saved articles')
    }

    const articlesQuery = buildQuery(params)
    const querySnapshot = await getDocs(articlesQuery)

    // Convert documents to Article type
    const allItems = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Article
    })

    // Apply search filtering client-side if needed
    const filteredItems = params.searchQuery 
      ? filterBySearchQuery(allItems, params.searchQuery)
      : allItems

    // Return only the requested limit, but use all items to determine hasMore
    const items = filteredItems.slice(0, params.limit || 9)

    // Check if there are more items
    const hasMore = filteredItems.length > (params.limit || 9)

    // Get the last visible document from the original query (not filtered)
    const lastVisible = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[Math.min(params.limit || 9 - 1, querySnapshot.docs.length - 1)]
      : null

    return {
      items,
      hasMore,
      lastVisible
    }
  } catch (error) {
    console.error('Query execution failed:', error)
    return {
      items: [],
      hasMore: false,
      lastVisible: null
    }
  }
}

// Apply search filtering client-side if needed
const filterBySearchQuery = (articles: Article[], searchQuery?: string | null): Article[] => {
  if (!searchQuery?.trim()) return articles

  const searchLower = searchQuery.toLowerCase()
  
  return articles.filter(article => {
    return (
      article.title?.toLowerCase().includes(searchLower) ||
      article.content?.toLowerCase().includes(searchLower) ||
      (article as any).excerpt?.toLowerCase().includes(searchLower) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  })
}

/**
 * Get initial page data
 */
export const getInitialPage = async (params: Omit<QueryParams, 'cursor'>): Promise<QueryResult> => {
  return executeQuery({ ...params, cursor: null })
}

/**
 * Get next page data
 */
export const getNextPage = async (params: QueryParams): Promise<QueryResult> => {
  return executeQuery(params)
}
