import { useState, useEffect } from 'react'
import { firestoreUtils } from '../lib/firestore'
import type { NewsDocument, KnowledgeDocument, TraditionDocument, NotificationDocument, UserDocument } from '../types/firestore'

interface UseAdminDataResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<void>
  update: (id: string, data: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

// News CRUD
export const useNewsAdmin = (): UseAdminDataResult<NewsDocument> => {
  const [data, setData] = useState<NewsDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const snapshot = await firestoreUtils.getCollection('news')
      const news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsDocument[]
      
      setData(news)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const create = async (newsData: Omit<NewsDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      const docData = {
        ...newsData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // Replace with actual user ID
        updatedBy: 'current-user'
      }
      await firestoreUtils.addDocument('news', docData)
      await fetchNews()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create news')
    }
  }

  const update = async (id: string, newsData: Partial<NewsDocument>) => {
    try {
      const updateData = {
        ...newsData,
        updatedAt: new Date(),
        updatedBy: 'current-user'
      }
      await firestoreUtils.updateDocument(`news/${id}`, updateData)
      await fetchNews()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update news')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await firestoreUtils.deleteDocument(`news/${id}`)
      await fetchNews()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete news')
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return { data, loading, error, create, update, delete: deleteItem, refetch: fetchNews }
}

// Knowledge CRUD
export const useKnowledgeAdmin = (): UseAdminDataResult<KnowledgeDocument> => {
  const [data, setData] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKnowledge = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const snapshot = await firestoreUtils.getCollection('knowledge')
      const knowledge = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KnowledgeDocument[]
      
      setData(knowledge)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge')
    } finally {
      setLoading(false)
    }
  }

  const create = async (knowledgeData: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      const docData = {
        ...knowledgeData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        updatedBy: 'current-user'
      }
      await firestoreUtils.addDocument('knowledge', docData)
      await fetchKnowledge()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create knowledge')
    }
  }

  const update = async (id: string, knowledgeData: Partial<KnowledgeDocument>) => {
    try {
      const updateData = {
        ...knowledgeData,
        updatedAt: new Date(),
        updatedBy: 'current-user'
      }
      await firestoreUtils.updateDocument(`knowledge/${id}`, updateData)
      await fetchKnowledge()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update knowledge')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await firestoreUtils.deleteDocument(`knowledge/${id}`)
      await fetchKnowledge()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete knowledge')
    }
  }

  useEffect(() => {
    fetchKnowledge()
  }, [])

  return { data, loading, error, create, update, delete: deleteItem, refetch: fetchKnowledge }
}

// Traditions CRUD
export const useTraditionsAdmin = (): UseAdminDataResult<TraditionDocument> => {
  const [data, setData] = useState<TraditionDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTraditions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const snapshot = await firestoreUtils.getCollection('traditions')
      const traditions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TraditionDocument[]
      
      setData(traditions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load traditions')
    } finally {
      setLoading(false)
    }
  }

  const create = async (traditionData: Omit<TraditionDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      const docData = {
        ...traditionData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        updatedBy: 'current-user'
      }
      await firestoreUtils.addDocument('traditions', docData)
      await fetchTraditions()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create tradition')
    }
  }

  const update = async (id: string, traditionData: Partial<TraditionDocument>) => {
    try {
      const updateData = {
        ...traditionData,
        updatedAt: new Date(),
        updatedBy: 'current-user'
      }
      await firestoreUtils.updateDocument(`traditions/${id}`, updateData)
      await fetchTraditions()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update tradition')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await firestoreUtils.deleteDocument(`traditions/${id}`)
      await fetchTraditions()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete tradition')
    }
  }

  useEffect(() => {
    fetchTraditions()
  }, [])

  return { data, loading, error, create, update, delete: deleteItem, refetch: fetchTraditions }
}

// Notifications CRUD
export const useNotificationsAdmin = (): UseAdminDataResult<NotificationDocument> => {
  const [data, setData] = useState<NotificationDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const snapshot = await firestoreUtils.getCollection('notifications')
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationDocument[]
      
      setData(notifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const create = async (notificationData: Omit<NotificationDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      const docData = {
        ...notificationData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        updatedBy: 'current-user'
      }
      await firestoreUtils.addDocument('notifications', docData)
      await fetchNotifications()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create notification')
    }
  }

  const update = async (id: string, notificationData: Partial<NotificationDocument>) => {
    try {
      const updateData = {
        ...notificationData,
        updatedAt: new Date(),
        updatedBy: 'current-user'
      }
      await firestoreUtils.updateDocument(`notifications/${id}`, updateData)
      await fetchNotifications()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update notification')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await firestoreUtils.deleteDocument(`notifications/${id}`)
      await fetchNotifications()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return { data, loading, error, create, update, delete: deleteItem, refetch: fetchNotifications }
}

// Users Management
export const useUsersAdmin = () => {
  const [data, setData] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const snapshot = await firestoreUtils.getCollection('users')
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserDocument[]
      
      setData(users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (uid: string, role: 'editor' | 'admin') => {
    try {
      await firestoreUtils.updateDocument(`users/${uid}`, { role })
      await fetchUsers()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update user role')
    }
  }

  const toggleActive = async (uid: string, isActive: boolean) => {
    try {
      await firestoreUtils.updateDocument(`users/${uid}`, { isActive })
      await fetchUsers()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { 
    data, 
    loading, 
    error, 
    updateRole, 
    toggleActive, 
    refetch: fetchUsers 
  }
}
