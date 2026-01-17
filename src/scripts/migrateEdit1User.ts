// Simple migration for the specific user edit1@83.com
// Run this once to create the Firebase Auth user

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { findUserForLogin } from '../services/firestoreUserService'

async function migrateEdit1User() {
  const email = 'edit1@83.com'
  const password = 'password123' // You need to provide the actual password
  const displayName = 'Nguyễn Văn B'
  
  try {
    console.log('Starting migration for user:', email)
    
    // Check if user exists in Firestore
    const userDoc = await findUserForLogin(email)
    if (!userDoc) {
      console.log('❌ User not found in Firestore')
      return
    }
    
    console.log('✅ Found user in Firestore:', userDoc.displayName)
    
    // Create Firebase Auth user
    console.log('🔐 Creating Firebase Auth user...')
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    // Update display name
    await updateProfile(firebaseUser, { displayName })
    
    // Update Firestore document with Firebase UID
    const userRef = doc(db, 'users', userDoc.id)
    await updateDoc(userRef, {
      uid: firebaseUser.uid,
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ Migration successful!')
    console.log('Firebase UID:', firebaseUser.uid)
    console.log('Email:', firebaseUser.email)
    console.log('Display Name:', firebaseUser.displayName)
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    
    if (error?.message?.includes('auth/email-already-in-use')) {
      console.log('ℹ️  Firebase Auth user already exists. Just need to update Firestore UID.')
      // You can manually update the UID in Firestore
    }
  }
}

// Export for manual execution
export { migrateEdit1User }

// To run this migration:
// 1. Import this function in your component
// 2. Call migrateEdit1User() with the correct password
// 3. After migration, delete this file
