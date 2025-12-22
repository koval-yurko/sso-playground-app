import type { UsersRepository } from '~~/types/UsersRepository'
import type { User, UserId, UserCreateDTO } from '~~/types/User'
import { getFirestoreDB } from '../utils/firestore'
import { FieldValue } from 'firebase-admin/firestore'

export class FirestoreUsersRepository implements UsersRepository {
  private readonly collectionName = 'users'

  async getByEmail(email: string): Promise<User | null> {
    const db = getFirestoreDB()
    const snapshot = await db
      .collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get()

    if (snapshot.empty || !snapshot.docs[0]) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as User
  }

  async createOrUpdate(data: UserCreateDTO): Promise<User> {
    const db = getFirestoreDB()

    // Try to find existing user by email
    const existingUser = await this.getByEmail(data.email)

    if (existingUser) {
      // Update existing user
      const docRef = db.collection(this.collectionName).doc(existingUser.id)
      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      }

      await docRef.update(updateData)
      const updatedDoc = await docRef.get()

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as User
    } else {
      // Create new user
      const newUserData = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      const docRef = await db.collection(this.collectionName).add(newUserData)
      const newDoc = await docRef.get()

      return {
        id: newDoc.id,
        ...newDoc.data(),
      } as User
    }
  }

  async delete(id: UserId): Promise<User> {
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
    } as User

    await docRef.delete()

    return user
  }
}
