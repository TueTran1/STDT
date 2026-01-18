// MIGRATION SCRIPT: Pure Firebase Auth Migration
// ONE-TIME script using Firebase Admin SDK
// This script migrates existing Firestore users to Firebase Auth
// and removes password fields from Firestore

import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, cert } from 'firebase-admin/app'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Initialize Firebase Admin SDK
// Note: You need to have service account key file or environment variables set
let app: any = null
let auth: any = null
let db: any = null

try {
  // Try to initialize with service account file
  const serviceAccountPath = join(process.cwd(), 'service-account-key.json')
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
  
  app = initializeApp({
    credential: cert(serviceAccount)
  })
  
  auth = getAuth(app)
  db = getFirestore(app)
  
  console.log('✅ Firebase Admin SDK initialized with service account')
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error)
  console.log('💡 Make sure service-account-key.json exists in project root')
  console.log('💡 Or set GOOGLE_APPLICATION_CREDENTIALS environment variable')
  process.exit(1)
}

// Generate temporary password for migrated users
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Create Firebase Auth user using Admin SDK
async function createFirebaseUser(email: string, displayName: string): Promise<{ uid: string; temporaryPassword: string } | null> {
  try {
    const temporaryPassword = generateTemporaryPassword()
    
    const userRecord = await auth.createUser({
      email: email,
      displayName: displayName,
      password: temporaryPassword,
      emailVerified: false, // Force email verification later
      disabled: false
    })
    
    console.log(`✅ Created Firebase Auth user: ${email} (UID: ${userRecord.uid})`)
    
    return {
      uid: userRecord.uid,
      temporaryPassword: temporaryPassword
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      // User already exists in Firebase Auth, get their UID
      try {
        const userRecord = await auth.getUserByEmail(email)
        console.log(`ℹ️  Firebase Auth user already exists: ${email} (UID: ${userRecord.uid})`)
        return {
          uid: userRecord.uid,
          temporaryPassword: 'EXISTING_USER'
        }
      } catch (getUserError) {
        console.error(`❌ Failed to get existing Firebase user for ${email}:`, getUserError)
        return null
      }
    } else {
      console.error(`❌ Failed to create Firebase user for ${email}:`, error)
      return null
    }
  }
}

// Update Firestore user document with Firebase UID and remove password fields
async function updateFirestoreUser(docId: string, firebaseUid: string): Promise<boolean> {
  try {
    const userRef = db.collection('users').doc(docId)
    
    // Update with Firebase UID and remove password-related fields
    await userRef.update({
      uid: firebaseUid,
      passwordHash: null, // Remove password hash
      updatedAt: new Date()
    })
    
    console.log(`✅ Updated Firestore user document: ${docId} → UID: ${firebaseUid}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to update Firestore user ${docId}:`, error)
    return false
  }
}

// Main migration function
async function migrateToPureFirebaseAuth(): Promise<void> {
  console.log('🚀 Starting migration to Pure Firebase Auth...')
  console.log('=' .repeat(60))
  
  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get()
    
    let totalUsers = 0
    let migratedUsers = 0
    let skippedUsers = 0
    let failedUsers = 0
    
    const migrationResults: Array<{
      email: string
      displayName: string
      role: string
      firebaseUid: string
      temporaryPassword?: string
      status: string
    }> = []
    
    console.log(`📊 Found ${usersSnapshot.size} users in Firestore`)
    console.log('')
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      totalUsers++
      
      const email = userData.email
      const displayName = userData.displayName || 'Unknown'
      const role = userData.role
      const existingUid = userData.uid
      
      // Skip if not admin or editor
      if (role !== 'admin' && role !== 'editor') {
        console.log(`⏭️  Skipping user ${email} - Role: ${role} (not admin/editor)`)
        skippedUsers++
        continue
      }
      
      // Check if already migrated
      if (existingUid && existingUid !== '') {
        // Verify Firebase user exists
        try {
          await auth.getUser(existingUid)
          console.log(`⏭️  User ${email} already migrated - UID: ${existingUid}`)
          migrationResults.push({
            email,
            displayName,
            role,
            firebaseUid: existingUid,
            status: 'ALREADY_MIGRATED'
          })
          skippedUsers++
          continue
        } catch (error) {
          console.log(`⚠️  User ${email} has UID but Firebase user not found. Re-migrating...`)
        }
      }
      
      // Create Firebase Auth user
      const firebaseResult = await createFirebaseUser(email, displayName)
      
      if (!firebaseResult) {
        failedUsers++
        migrationResults.push({
          email,
          displayName,
          role,
          firebaseUid: '',
          status: 'FAILED_TO_CREATE'
        })
        continue
      }
      
      // Update Firestore document
      const updateSuccess = await updateFirestoreUser(userDoc.id, firebaseResult.uid)
      
      if (updateSuccess) {
        migratedUsers++
        migrationResults.push({
          email,
          displayName,
          role,
          firebaseUid: firebaseResult.uid,
          temporaryPassword: firebaseResult.temporaryPassword !== 'EXISTING_USER' ? firebaseResult.temporaryPassword : undefined,
          status: 'MIGRATED'
        })
        
        if (firebaseResult.temporaryPassword !== 'EXISTING_USER') {
          console.log(`🔑 Temporary password for ${email}: ${firebaseResult.temporaryPassword}`)
        }
      } else {
        failedUsers++
        migrationResults.push({
          email,
          displayName,
          role,
          firebaseUid: firebaseResult.uid,
          status: 'FAILED_TO_UPDATE'
        })
      }
    }
    
    // Print summary
    console.log('')
    console.log('📊 MIGRATION SUMMARY')
    console.log('=' .repeat(60))
    console.log(`Total users processed: ${totalUsers}`)
    console.log(`Successfully migrated: ${migratedUsers}`)
    console.log(`Skipped (already migrated): ${skippedUsers}`)
    console.log(`Failed: ${failedUsers}`)
    console.log('')
    
    // Print migration results
    console.log('📋 MIGRATION RESULTS')
    console.log('=' .repeat(60))
    
    for (const result of migrationResults) {
      if (result.status === 'MIGRATED' && result.temporaryPassword) {
        console.log(`✅ ${result.email} (${result.role})`)
        console.log(`   Firebase UID: ${result.firebaseUid}`)
        console.log(`   Temporary Password: ${result.temporaryPassword}`)
        console.log('')
      } else if (result.status === 'ALREADY_MIGRATED') {
        console.log(`ℹ️  ${result.email} (${result.role}) - Already migrated`)
        console.log(`   Firebase UID: ${result.firebaseUid}`)
        console.log('')
      } else {
        console.log(`❌ ${result.email} (${result.role}) - ${result.status}`)
        console.log('')
      }
    }
    
    // Save migration results to file
    writeFileSync(
      join(process.cwd(), 'migration-results.json'),
      JSON.stringify(migrationResults, null, 2)
    )
    console.log('💾 Migration results saved to: migration-results.json')
    
    if (failedUsers > 0) {
      console.log('')
      console.log('⚠️  MIGRATION COMPLETED WITH ERRORS')
      console.log('   Check the failed users above and re-run the script')
    } else {
      console.log('')
      console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!')
      console.log('')
      console.log('NEXT STEPS:')
      console.log('1. Notify users of their temporary passwords')
      console.log('2. Force password reset on first login')
      console.log('3. Update authentication code to use Pure Firebase Auth')
      console.log('4. Remove password-related code from Firestore')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this script is executed directly
migrateToPureFirebaseAuth()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })

export { migrateToPureFirebaseAuth }
