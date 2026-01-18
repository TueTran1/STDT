// Migration script to align Firestore users with Firebase Auth UIDs
// ONE-TIME script - DO NOT run automatically in production
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getDocs, collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

// Create Firebase Auth user and write UID to Firestore
async function migrateUserToFirebaseAuth(email: string, password: string, displayName: string) {
  try {
    console.log(`Creating Firebase Auth user for: ${email}`)
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    // Update display name in Firebase Auth
    if (displayName && firebaseUser) {
      await updateProfile(firebaseUser, { displayName })
    }
    
    console.log(`✅ Successfully created Firebase Auth user: ${firebaseUser.uid}`)
    return firebaseUser.uid
  } catch (error) {
    console.error(`❌ Failed to create Firebase Auth user for ${email}:`, error)
    return null
  }
}

// Audit Firestore users and identify migration candidates
async function auditFirestoreUsers() {
  try {
    console.log('🔍 Auditing Firestore users for Firebase UID alignment...')
    
    // Get all users from Firestore
    const usersQuery = query(collection(db, 'users'))
    const querySnapshot = await getDocs(usersQuery)
    
    let totalUsers = 0
    let usersWithUid = 0
    let usersWithoutUid = 0
    let usersMissingRequired = 0
    
    console.log('\n📊 User Audit Results:')
    console.log('=' .repeat(50))
    
    for (const doc of querySnapshot.docs) {
      const userData = doc.data()
      totalUsers++
      
      // Check required fields
      const hasUid = userData.uid && userData.uid !== ''
      const hasRole = userData.role && (userData.role === 'admin' || userData.role === 'editor')
      const hasDisplayName = userData.displayName && userData.displayName.trim() !== ''
      const hasActive = typeof userData.isActive === 'boolean'
      
      if (hasUid) {
        usersWithUid++
        console.log(`✅ ${userData.email} - UID: ${userData.uid}, Role: ${userData.role}, Active: ${userData.isActive}`)
      } else {
        usersWithoutUid++
        const status = hasRole && hasDisplayName && hasActive ? 'READY' : 'INCOMPLETE'
        console.log(`⚠️  ${userData.email} - MISSING UID - Status: ${status}`)
        console.log(`   Role: ${userData.role || 'MISSING'}, DisplayName: ${hasDisplayName ? 'YES' : 'MISSING'}, Active: ${hasActive ? 'YES' : 'MISSING'}`)
        
        if (!hasRole || !hasDisplayName || !hasActive) {
          usersMissingRequired++
        }
      }
    }
    
    console.log('\n📈 Summary:')
    console.log(`Total users: ${totalUsers}`)
    console.log(`Users with Firebase UID: ${usersWithUid}`)
    console.log(`Users without Firebase UID: ${usersWithoutUid}`)
    console.log(`Users missing required fields: ${usersMissingRequired}`)
    
    return {
      totalUsers,
      usersWithUid,
      usersWithoutUid,
      usersMissingRequired
    }
    
  } catch (error) {
    console.error('❌ Audit failed:', error)
    throw error
  }
}

// Manual migration for specific user (idempotent)
async function migrateSpecificUser(email: string, password: string) {
  try {
    console.log(`🔄 Starting migration for: ${email}`)
    
    // Find user in Firestore
    const usersQuery = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(usersQuery)
    
    if (querySnapshot.empty) {
      console.log(`❌ User with email ${email} not found in Firestore`)
      return false
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    // Check if already migrated
    if (userData.uid && userData.uid !== '') {
      console.log(`⏭️  User ${email} already has Firebase UID: ${userData.uid}`)
      return true // Idempotent success
    }
    
    // Validate required fields
    if (!userData.role || !userData.displayName || typeof userData.isActive !== 'boolean') {
      console.log(`❌ User ${email} missing required fields. Please fix before migration:`)
      console.log(`   Role: ${userData.role || 'MISSING'}`)
      console.log(`   DisplayName: ${userData.displayName || 'MISSING'}`)
      console.log(`   Active: ${userData.isActive}`)
      return false
    }
    
    // Create Firebase Auth user
    const firebaseUid = await migrateUserToFirebaseAuth(email, password, userData.displayName)
    
    if (firebaseUid) {
      // Update Firestore document with Firebase UID
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: firebaseUid,
        updatedAt: serverTimestamp()
      })
      
      console.log(`✅ Successfully migrated ${email} to Firebase Auth`)
      console.log(`   Firestore ID: ${userDoc.id}`)
      console.log(`   Firebase UID: ${firebaseUid}`)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${email}:`, error)
    return false
  }
}

// Batch migration for users without UIDs (requires manual password provision)
async function migrateUsersWithoutUids(userCredentials: Array<{email: string, password: string}>) {
  try {
    console.log('🔄 Starting batch migration for users without UIDs...')
    
    let successCount = 0
    let failureCount = 0
    
    for (const credential of userCredentials) {
      const success = await migrateSpecificUser(credential.email, credential.password)
      if (success) {
        successCount++
      } else {
        failureCount++
      }
    }
    
    console.log('\n📊 Batch Migration Results:')
    console.log(`Success: ${successCount}`)
    console.log(`Failed: ${failureCount}`)
    
    return { successCount, failureCount }
    
  } catch (error) {
    console.error('❌ Batch migration failed:', error)
    throw error
  }
}

export { 
  auditFirestoreUsers, 
  migrateSpecificUser, 
  migrateUsersWithoutUids, 
  migrateUserToFirebaseAuth 
}
