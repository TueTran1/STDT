import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { KnowledgeDocument, NewsDocument, TraditionDocument } from '../types/firestore'

// Generic hook for fetching Firestore documents
export const useFirestore = <T extends { id: string }>(
  collectionName: string,
  constraints?: any[]
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const collectionRef = collection(db, collectionName)
      
      // Apply constraints if provided
      const q = constraints && constraints.length > 0 
        ? query(collectionRef, ...constraints)
        : collectionRef
        
      const querySnapshot = await getDocs(q)
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]
      
      setData(documents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [collectionName, JSON.stringify(constraints)])

  return { data, loading, error, refetch: fetchData }
}

// Specific hook for knowledge articles
export const useKnowledge = (section?: string) => {
  const constraints = [where('status', '==', 'published'), orderBy('createdAt', 'desc')]

  const result = useFirestore<KnowledgeDocument>('knowledge', constraints)
  
  // Apply client-side filtering for section if provided
  const filteredData = section 
    ? result.data.filter(item => item.category === section)
    : result.data

  return { ...result, data: filteredData }
}

// Specific hook for news articles
export const useNews = () => {
  const constraints = [where('status', '==', 'published')]

  return useFirestore<NewsDocument>('news', constraints)
}

// Specific hook for traditions
export const useTraditions = () => {
  const constraints = [where('status', '==', 'published'), orderBy('createdAt', 'desc')]

  return useFirestore<TraditionDocument>('traditions', constraints)
}

// Specific hook for notifications
export const useNotifications = (userId?: string) => {
  const constraints = userId 
    ? [where('recipientUid', '==', userId), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')]

  return useFirestore<any>('notifications', constraints)
}

// Hook for single document by ID
export const useDocument = <T extends { id: string }>(
  collectionName: string,
  docId: string
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Note: This would need to be implemented with getDoc()
        // For now, returning empty state
        setData(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document')
      } finally {
        setLoading(false)
      }
    }

    if (docId) {
      fetchDocument()
    }
  }, [collectionName, docId])

  return { data, loading, error }
}
