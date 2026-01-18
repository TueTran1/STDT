// Secure User Creation Service
// Uses Firebase Admin SDK for server-side user creation
// Prevents client-side user creation for security

import * as functions from 'firebase-functions'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
const auth = getAuth()
const db = getFirestore()

// Generate secure temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Interface for user creation request
interface CreateUserRequest {
  email: string
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
}

export const createUserSecure = functions.https.onCall(async (data: CreateUserRequest, context) => {
  // Validate input
  if (!data.email || !data.displayName || !data.role) {
    console.error('Missing required fields', { data })
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email format')
  }

  // Validate role
  if (!['admin', 'editor'].includes(data.role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role')
  }

  try {
    console.info('Creating user securely', { email: data.email, role: data.role })

    // Step 1: Create Firebase Auth user with temporary password
    const temporaryPassword = generateTemporaryPassword()
    
    const userRecord = await auth.createUser({
      email: data.email,
      password: temporaryPassword,
      displayName: data.displayName,
      emailVerified: false, // Force email verification later
      disabled: !data.isActive
    })

    console.info('Firebase Auth user created', { uid: userRecord.uid })

    // Step 2: Create Firestore profile with returned UID
    const userDoc = {
      uid: userRecord.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      isActive: data.isActive,
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
      createdBy: 'admin', // This should be the current admin's UID
      updatedBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection('users').doc(userRecord.uid).set(userDoc)
    
    console.info('Firestore profile created', { uid: userRecord.uid })

    // Step 3: Return success with temporary password
    return {
      success: true,
      uid: userRecord.uid,
      email: data.email,
      temporaryPassword: temporaryPassword,
      message: 'User created successfully. Temporary password provided.'
    }

  } catch (error: any) {
    console.error('User creation failed', { error: error.message, email: data.email })

    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Email already exists')
    } else if (error.code === 'auth/invalid-email') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address')
    } else if (error.code === 'auth/weak-password') {
      throw new functions.https.HttpsError('invalid-argument', 'Password is too weak')
    } else {
      throw new functions.https.HttpsError('internal', 'Failed to create user')
    }
  }
})

// Additional function to reset user password (admin only)
export const resetUserPassword = functions.https.onCall(async (data: { uid: string, email: string }, context) => {
  const { uid, email } = data

  if (!uid || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing UID or email')
  }

  try {
    // Generate new temporary password
    const newPassword = generateTemporaryPassword()
    
    // Update password in Firebase Auth
    await auth.updateUser(uid, {
      password: newPassword
    })

    console.info('Password reset successfully', { uid, email })

    return {
      success: true,
      temporaryPassword: newPassword,
      message: 'Password reset successfully'
    }

  } catch (error: any) {
    console.error('Password reset failed', { error: error.message, uid })
    
    throw new functions.https.HttpsError('internal', 'Failed to reset password')
  }
})
