// Secure User Creation Service (Client-side)
// Calls Firebase Cloud Functions for secure user creation
// Prevents client-side Firebase Auth user creation

import { httpsCallable } from 'firebase/functions'
import { getFunctions } from 'firebase/functions'
import app from '../lib/firebase'

// Initialize Firebase Functions
const functions = getFunctions(app)

// Interface for user creation request
export interface CreateUserRequest {
  email: string
  displayName: string
  role: 'admin' | 'editor'
  isActive: boolean
}

// Interface for user creation response
export interface CreateUserResponse {
  success: boolean
  uid?: string
  email?: string
  temporaryPassword?: string
  message?: string
}

// Interface for password reset request
export interface ResetPasswordRequest {
  uid: string
  email: string
}

// Interface for password reset response
export interface ResetPasswordResponse {
  success: boolean
  temporaryPassword?: string
  message?: string
}

// Secure user creation function
export const createUserSecure = httpsCallable<CreateUserRequest, CreateUserResponse>(
  functions, 'createUserSecure'
)

// Password reset function (admin only)
export const resetUserPassword = httpsCallable<ResetPasswordRequest, ResetPasswordResponse>(
  functions, 'resetUserPassword'
)
