import { useState } from 'react'
import { firestoreUtils } from '../lib/firestore'

interface UseCrudOperationsResult<T> {
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  update: (id: string, data: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  loading: boolean
  error: string | null
}

export const useCrudOperations = <T extends Record<string, any>>(
  collectionName: string
): UseCrudOperationsResult<T> => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true)
      setError(null)
      
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await firestoreUtils.addDocument(collectionName, docData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      }
      
      await firestoreUtils.updateDocument(`${collectionName}/${id}`, updateData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await firestoreUtils.deleteDocument(`${collectionName}/${id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    update,
    delete: deleteItem,
    loading,
    error
  }
}
