import { db } from './firebase'
import type {
  Firestore,
  DocumentData,
  Query,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore'

export { db }
export type { Firestore, DocumentData, Query, DocumentReference, CollectionReference }

export const firestoreUtils = {
  addDocument: (collectionPath: string, data: DocumentData) => {
    return import('firebase/firestore').then(({ collection, addDoc }) => {
      const collectionRef = collection(db, collectionPath)
      return addDoc(collectionRef, data)
    })
  },

  getDocument: (docPath: string) => {
    return import('firebase/firestore').then(({ doc, getDoc }) => {
      const docRef = doc(db, docPath)
      return getDoc(docRef)
    })
  },

  getCollection: (collectionPath: string, constraints?: any[]) => {
    return import('firebase/firestore').then(({ collection, getDocs, query, where }) => {
      const collectionRef = collection(db, collectionPath)
      
      // Convert constraint objects to where() functions
      const whereConstraints = constraints?.map(constraint => 
        where(constraint.field, constraint.operator, constraint.value)
      ) || []
      
      const q = whereConstraints.length > 0 ? query(collectionRef, ...whereConstraints) : collectionRef
      return getDocs(q)
    })
  },

  updateDocument: (docPath: string, data: Partial<DocumentData>) => {
    return import('firebase/firestore').then(({ doc, updateDoc }) => {
      const docRef = doc(db, docPath)
      return updateDoc(docRef, data)
    })
  },

  deleteDocument: (docPath: string) => {
    return import('firebase/firestore').then(({ doc, deleteDoc }) => {
      const docRef = doc(db, docPath)
      return deleteDoc(docRef)
    })
  }
}
