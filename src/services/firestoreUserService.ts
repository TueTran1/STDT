// Firestore User Service
// Central place for ALL Firestore user logic
// No UI knowledge, No React imports

import { collection, getDocs, orderBy, query, QueryDocumentSnapshot, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserDocument } from '../types/firestore'
import { FIRESTORE_PATHS } from '../types/firestore'
import { hashPassword } from '../utils/password'
import type { CreateUserInput } from '../types/user'

export const getUsers = async (): Promise<UserDocument[]> => {
  try {
    const usersQuery = query(
      collection(db, FIRESTORE_PATHS.USERS),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(usersQuery)
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Timestamp to Date
      } as UserDocument
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const findUserForLogin = async (identifier: string): Promise<UserDocument | null> => {
  try {
    // Query users by email or username, handle undefined values
    console.log('Searching for user with identifier:', identifier)
    const usersQuery = query(
      collection(db, FIRESTORE_PATHS.USERS),
      where('email', '==', identifier)
    )
    const querySnapshot = await getDocs(usersQuery)
    
    if (querySnapshot.empty) {
      console.log('No user found in Firestore')
      return null
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    console.log('User data from Firestore:', userData)
    
    // Only return fields that are actually populated, filter out undefined
    const result: UserDocument & { passwordHash?: string } = {
      uid: userData.uid || '',
      email: userData.email || '',
      displayName: userData.displayName || '',
      role: userData.role || 'editor',
      isActive: userData.isActive ?? true,
      lastLoginAt: userData.lastLoginAt,
      profile: userData.profile || {
        bio: '',
        location: '',
        website: '',
        socialLinks: {
          twitter: '',
          instagram: '',
          facebook: ''
        }
      },
      preferences: userData.preferences || {
        emailNotifications: true,
        pushNotifications: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh'
      },
      createdBy: userData.createdBy || '',
      updatedBy: userData.updatedBy || '',
      id: userDoc.id,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
      passwordHash: userData.passwordHash
    }
    
    console.log('Final user document for return:', result)
    return result as UserDocument
  } catch (error) {
    console.error('Error finding user for login:', error)
    return null
  }
}

export const getUserById = async (_id: string): Promise<UserDocument | null> => {
  // TODO: Implement Firestore get by ID
  throw new Error('Not implemented yet')
}

export const createUser = async (input: CreateUserInput): Promise<UserDocument> => {
  try {
    // Hash password before storing
    const passwordHash = await hashPassword(input.password)
    
    // Create user document with hashed password
    const userDoc: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      uid: '', // Will be set by Firestore document ID
      email: input.email,
      displayName: input.displayName,
      role: (input.role === 'admin' || input.role === 'editor') ? input.role : 'editor',
      isActive: input.isActive,
      profile: {
        bio: '',
        location: '',
        website: '',
        socialLinks: {
          twitter: '',
          instagram: '',
          facebook: ''
        }
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh'
      },
      createdBy: 'admin',
      updatedBy: 'admin'
    }

    // Add document to Firestore
    const docRef = await addDoc(collection(db, FIRESTORE_PATHS.USERS), {
      ...userDoc,
      passwordHash, // Store hashed password, never plain password
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Return complete user document with generated ID
    return {
      ...userDoc,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as UserDocument
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export const updateUser = async (_id: string, _payload: Partial<UserDocument>): Promise<UserDocument> => {
  // TODO: Implement Firestore update
  throw new Error('Not implemented yet')
}

export const deactivateUser = async (_id: string): Promise<void> => {
  // TODO: Implement Firestore deactivate
  throw new Error('Not implemented yet')
}
