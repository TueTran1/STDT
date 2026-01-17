// UI-Friendly User Type
// Type used ONLY by UI (AdminDashboard, tables, dialogs)
// No Firebase imports, No Timestamp, Flat structure

export interface User {
  id: string
  username: string
  displayName: string
  email: string
  role: 'admin' | 'editor'
}

// User Creation Input Type
// For creating new users with password
export interface CreateUserInput {
  displayName: string
  email: string
  password: string
  role: 'admin' | 'editor' | 'user'
  isActive: boolean
}

// Login Input Type
// For user authentication with flexible identifier
export interface LoginInput {
  identifier: string // email or username
  password: string
}
