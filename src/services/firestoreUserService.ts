// Firestore User Service
// Central place for ALL Firestore user logic
// No UI knowledge, No React imports

import { collection, getDocs, orderBy, query, QueryDocumentSnapshot, where, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
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
    // Query users by email first, then by displayName (username)
    console.log('Searching for user with identifier:', identifier)
    
    // Try email first
    let usersQuery = query(
      collection(db, FIRESTORE_PATHS.USERS),
      where('email', '==', identifier)
    )
    let querySnapshot = await getDocs(usersQuery)
    
    // If not found by email, try by displayName (username)
    if (querySnapshot.empty) {
      usersQuery = query(
        collection(db, FIRESTORE_PATHS.USERS),
        where('displayName', '==', identifier)
      )
      querySnapshot = await getDocs(usersQuery)
    }
    
    if (querySnapshot.empty) {
      console.log('No user found in Firestore')
      return null
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    console.log('User data from Firestore:', userData)
    
    // Return actual Firestore data without fallbacks
    return {
      id: userDoc.id,
      uid: userData.uid,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      isActive: userData.isActive,
      lastLoginAt: userData.lastLoginAt,
      passwordHash: userData.passwordHash,
      profile: userData.profile,
      preferences: userData.preferences,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      createdBy: userData.createdBy,
      updatedBy: userData.updatedBy
    }
  } catch (error) {
    console.error('Error finding user for login:', error)
    return null
  }
}

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  try {
    const docRef = doc(db, FIRESTORE_PATHS.USERS, id)
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
    } as UserDocument
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export const createUser = async (input: CreateUserInput): Promise<UserDocument> => {
  try {
    // Hash password before storing
    const passwordHash = await hashPassword(input.password)
    
    // Create user document with required fields only
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

export const updateUser = async (id: string, updates: Partial<UserDocument>): Promise<UserDocument> => {
  try {
    const docRef = doc(db, FIRESTORE_PATHS.USERS, id)
    
    // Prepare update data with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    // Update the document
    await updateDoc(docRef, updateData)
    
    // Get the updated document to return
    const updatedDoc = await getUserById(id)
    if (!updatedDoc) {
      throw new Error('Failed to retrieve updated user document')
    }
    
    return updatedDoc
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}

export const deactivateUser = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, FIRESTORE_PATHS.USERS, id)
    
    // Update user to set isActive to false
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    throw new Error('Failed to deactivate user')
  }
}

// Create user profile for Firebase Auth user
export const createUserProfile = async (uid: string, data: Partial<UserDocument>): Promise<UserDocument> => {
  try {
    const docRef = doc(db, FIRESTORE_PATHS.USERS, uid)
    
    // Create user profile document
    const profileData = {
      uid,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(docRef, profileData)
    
    // Return the created document
    return await getUserById(uid) as UserDocument
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw new Error('Failed to create user profile')
  }
}

// Get user profile by Firebase Auth UID
export const getUserProfile = async (uid: string): Promise<UserDocument | null> => {
  try {
    const usersQuery = query(
      collection(db, FIRESTORE_PATHS.USERS),
      where('uid', '==', uid)
    )
    const querySnapshot = await getDocs(usersQuery)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const userDoc = querySnapshot.docs[0]
    const data = userDoc.data()
    
    return {
      ...data,
      id: userDoc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as UserDocument
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile by Firebase Auth UID
export const updateUserProfile = async (uid: string, updates: Partial<UserDocument>): Promise<UserDocument> => {
  try {
    const usersQuery = query(
      collection(db, FIRESTORE_PATHS.USERS),
      where('uid', '==', uid)
    )
    const querySnapshot = await getDocs(usersQuery)
    
    if (querySnapshot.empty) {
      throw new Error('User profile not found')
    }
    
    const userDoc = querySnapshot.docs[0]
    const docRef = doc(db, FIRESTORE_PATHS.USERS, userDoc.id)
    
    // Prepare update data with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    // Update the document
    await updateDoc(docRef, updateData)
    
    // Get the updated document to return
    const updatedDoc = await getUserById(userDoc.id)
    if (!updatedDoc) {
      throw new Error('Failed to retrieve updated user profile')
    }
    
    return updatedDoc
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update user profile')
  }
}
