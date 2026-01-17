// User Mapper Service
// Maps between different user data formats (Firestore <-> UI)

import type { UserDocument } from '../types/firestore'

// UI User Type (defined locally to avoid circular dependencies)
export interface User {
  id: string
  username: string
  displayName: string
  email: string
  role: 'admin' | 'editor'
}

// Mapped User type for UI components
export interface MappedUser {
  id: string
  displayName: string
  email: string
  role: 'ADMIN' | 'EDITOR'
  isActive: boolean
  createdAt: string
  name: string
  status: 'ACTIVE' | 'LOCKED'
  createdDate: string
}

// Map Firestore UserDocument to UI User format
export const mapUserDocumentToUser = (userDoc: UserDocument): User => {
  return {
    id: userDoc.id,
    username: userDoc.displayName || userDoc.email || 'Unknown',
    displayName: userDoc.displayName || userDoc.email || 'Unknown',
    email: userDoc.email || 'N/A',
    role: userDoc.role
  }
}

// Map Firestore UserDocument to MappedUser format (for AdminDashboard)
export const mapUserDocumentToMappedUser = (userDoc: UserDocument): MappedUser => {
  return {
    id: userDoc.id,
    displayName: userDoc.displayName || userDoc.email || 'Unknown',
    email: userDoc.email || 'N/A',
    role: userDoc.role.toUpperCase() as 'ADMIN' | 'EDITOR',
    isActive: userDoc.isActive,
    createdAt: userDoc.createdAt.toLocaleDateString('vi-VN'),
    name: userDoc.displayName || userDoc.email || 'Unknown',
    status: userDoc.isActive ? 'ACTIVE' : 'LOCKED',
    createdDate: userDoc.createdAt.toLocaleDateString('vi-VN')
  }
}

// Map UI User to Firestore UserDocument format (partial)
export const mapUserToUserDocument = (user: Partial<User>): Partial<UserDocument> => {
  return {
    displayName: user.username,
    role: user.role
  }
}
