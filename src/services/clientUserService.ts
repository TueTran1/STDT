// Firebase Free Plan User Creation Service
// Uses secondary Firebase Auth to prevent admin logout

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { secondaryAuth } from '../lib/secondaryFirebase'

export interface CreateUserRequest {
  email: string
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
}

export interface CreateUserResponse {
  success: boolean
  uid?: string
  email?: string
  temporaryPassword?: string
  message?: string
}

// Free Plan user creation using secondary auth (no admin logout)
export const createUserClient = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  // Validate input
  if (!data.email || !data.displayName || !data.role) {
    return { success: false, message: 'Missing required fields' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { success: false, message: 'Invalid email format' }
  }

  // Validate role
  if (!['admin', 'editor'].includes(data.role)) {
    return { success: false, message: 'Role must be either "admin" or "editor"' }
  }

  try {
    const temporaryPassword = generateTemporaryPassword()
    console.log('Creating user with secondary auth:', { email: data.email, role: data.role })
    
    // Step 1: Create Firebase Auth user using secondary auth (doesn't affect main admin session)
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      data.email, 
      temporaryPassword
    )
    
    // Step 2: Update the new user's profile
    await updateProfile(userCredential.user, {
      displayName: data.displayName
    })

    // Step 3: Create Firestore profile for the new user
    const userDoc = {
      uid: userCredential.user.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      isActive: data.isActive !== undefined ? data.isActive : true,
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
      createdBy: 'admin', // This should be updated to actual admin UID
      updatedBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
    
    console.log('User created successfully:', { uid: userCredential.user.uid, email: data.email })
    
    return {
      success: true,
      uid: userCredential.user.uid,
      email: data.email,
      temporaryPassword: temporaryPassword,
      message: 'User created successfully'
    }

  } catch (error: any) {
    console.error('User creation error:', error)
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      return { 
        success: false, 
        message: 'Email already exists in Firebase Authentication' 
      }
    }
    
    if (error.code === 'auth/invalid-email') {
      return { success: false, message: 'Invalid email address' }
    }
    
    if (error.code === 'auth/weak-password') {
      return { success: false, message: 'Password is too weak' }
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      return { success: false, message: 'Email/password accounts are not enabled' }
    }
    
    if (error.code === 'auth/too-many-requests') {
      return { success: false, message: 'Too many attempts. Please try again later.' }
    }
    
    return { success: false, message: error.message || 'Failed to create user' }
  }
}

// Generate temporary password function
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
