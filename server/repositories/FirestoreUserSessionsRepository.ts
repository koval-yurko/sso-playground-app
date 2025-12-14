import type { UserSessionsRepository } from '~~/types/UserSessionsRepository'
import type { UserSession, UserSessionId, UserSessionCreateDTO } from '~~/types/UserSession'
import { getFirestoreDB } from '../utils/firestore'
import { FieldValue } from 'firebase-admin/firestore'

export class FirestoreUserSessionsRepository implements UserSessionsRepository {
  private readonly collectionName = 'user-sessions'

  async getBySessionId(id: UserSessionId): Promise<UserSession | null> {
    const db = getFirestoreDB()
    const docRef = db.collection(this.collectionName).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as UserSession
  }

  async createOrUpdate(data: UserSessionCreateDTO): Promise<UserSession> {
    const db = getFirestoreDB()

    // Try to find existing session by userId
    const snapshot = await db
      .collection(this.collectionName)
      .where('userId', '==', data.userId)
      .limit(1)
      .get()

    if (!snapshot.empty) {
      // Update existing session
      const doc = snapshot.docs[0]
      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      }

      await doc.ref.update(updateData)
      const updatedDoc = await doc.ref.get()

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as UserSession
    } else {
      // Create new session
      const newSessionData = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      const docRef = await db.collection(this.collectionName).add(newSessionData)
      const newDoc = await docRef.get()

      return {
        id: newDoc.id,
        ...newDoc.data(),
      } as UserSession
    }
  }

  async delete(id: UserSessionId): Promise<UserSession> {
    const db = getFirestoreDB()
    const docRef = db.collection(this.collectionName).doc(id)

    // Get the document before deleting to return it
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Settings with id ${id} not found`)
    }

    const user = {
      id: doc.id,
      ...doc.data(),
    } as UserSession

    await docRef.delete()

    return user
  }
}
