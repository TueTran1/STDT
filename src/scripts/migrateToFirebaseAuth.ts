// Migration script to create Firebase Auth users from existing Firestore users
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getDocs, collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const auth = getAuth()

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

async function migrateExistingUsers() {
  try {
    console.log('Starting migration of existing Firestore users to Firebase Auth...')
    
    // Get all users from Firestore
    const usersQuery = query(collection(db, 'users'))
    const querySnapshot = await getDocs(usersQuery)
    
    let successCount = 0
    let failureCount = 0
    
    for (const doc of querySnapshot.docs) {
      const userData = doc.data()
      
      // Skip users that already have a Firebase UID
      if (userData.uid && userData.uid !== '') {
        console.log(`⏭️  Skipping ${userData.email} - already has Firebase UID: ${userData.uid}`)
        continue
      }
      
      // Skip users without email or password
      if (!userData.email || !userData.passwordHash) {
        console.log(`⚠️  Skipping user ${doc.id} - missing email or password hash`)
        continue
      }
      
      // We need the original password, but we only have the hash
      // This means we need to ask the admin to provide the password
      console.log(`🔐 User ${userData.email} needs manual migration - password hash found but original password needed`)
      
      failureCount++
    }
    
    console.log(`\nMigration complete:`)
    console.log(`- Success: ${successCount}`)
    console.log(`- Failed/Manual: ${failureCount}`)
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Manual migration for specific user
async function migrateSpecificUser(email: string, password: string) {
  try {
    // Find user in Firestore
    const usersQuery = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(usersQuery)
    
    if (querySnapshot.empty) {
      console.log(`❌ User with email ${email} not found in Firestore`)
      return
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    // Create Firebase Auth user
    const firebaseUid = await migrateUserToFirebaseAuth(email, password, userData.displayName)
    
    if (firebaseUid) {
      // Update Firestore document with Firebase UID
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: firebaseUid,
        updatedAt: serverTimestamp()
      })
      
      console.log(`✅ Successfully migrated ${email} to Firebase Auth`)
    }
    
  } catch (error) {
    console.error(`Failed to migrate ${email}:`, error)
  }
}

export { migrateExistingUsers, migrateSpecificUser, migrateUserToFirebaseAuth }
