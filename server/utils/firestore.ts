import * as path from 'path'
import * as fs from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { App } from 'firebase-admin/app'
import type { Firestore } from 'firebase-admin/firestore'

import { useRuntimeConfig } from '#imports'

let db: Firestore
let app: App

export function getFirestoreDB() {
  if (db) {
    return db
  }

  if (!app) {
    // Try to load service account key for local development
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json')

    if (fs.existsSync(serviceAccountPath)) {
      // Local development: Use service account key
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
      console.log('✓ Loading service account for project:', serviceAccount.project_id)

      app = initializeApp({
        credential: cert(serviceAccount),
      })
      console.log('✓ Firebase initialized with service account')
    } else {
      // Production/Firebase App Hosting: Use default credentials
      const config = useRuntimeConfig()
      const firebaseConfig = config.firebaseConfig
        ? JSON.parse(config.firebaseConfig)
        : undefined

      app = initializeApp({
        projectId: firebaseConfig?.projectId,
      })
      console.log('✓ Firebase initialized with default credentials for project:', firebaseConfig?.projectId)
    }
  }

  const config = useRuntimeConfig()

  db = getFirestore(app, config.firestoreDatabaseId)
  console.log('✓ Firestore instance created for database:', config.firestoreDatabaseId)
  return db
}
