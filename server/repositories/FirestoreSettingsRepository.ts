import type { SettingsRepository } from '~~/types/SettingsRepository'
import type { Settings, SettingId, SettingsCreateDTO, SettingsUpdateDTO, SettingType } from '~~/types/Settings'
import { getFirestoreDB } from '../utils/firestore'
import { FieldValue } from 'firebase-admin/firestore'

export class FirestoreSettingsRepository implements SettingsRepository {
  private readonly collectionName = 'settings'

  async getList(type: SettingType): Promise<Settings[]> {
    const db = getFirestoreDB()
    const snapshot = await db
      .collection(this.collectionName)
      .where('type', '==', type)
      .orderBy('createdAt', 'asc')
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Settings[]
  }

  async getByKey(key: string): Promise<Settings | null> {
    const db = getFirestoreDB()
    const snapshot = await db
      .collection(this.collectionName)
      .where('key', '==', key)
      .limit(1)
      .get()

    if (snapshot.empty || !snapshot.docs[0]) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as Settings
  }

  async getEnabled(): Promise<Settings[]> {
    const db = getFirestoreDB()
    const snapshot = await db
      .collection(this.collectionName)
      .where('enabled', '==', true)
      .orderBy('createdAt', 'asc')
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Settings[]
  }

  async create(data: SettingsCreateDTO): Promise<Settings> {
    const db = getFirestoreDB()

    const now = FieldValue.serverTimestamp()
    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await db.collection(this.collectionName).add(docData)
    const doc = await docRef.get()

    return {
      id: doc.id,
      ...doc.data(),
    } as Settings
  }

  async update(id: SettingId, data: SettingsUpdateDTO): Promise<Settings> {
    const db = getFirestoreDB()
    const docRef = db.collection(this.collectionName).doc(id)

    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await docRef.update(updateData)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Settings with id ${id} not found`)
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Settings
  }

  async delete(id: SettingId): Promise<Settings> {
    const db = getFirestoreDB()
    const docRef = db.collection(this.collectionName).doc(id)

    // Get the document before deleting to return it
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Settings with id ${id} not found`)
    }

    const settings = {
      id: doc.id,
      ...doc.data(),
    } as Settings

    await docRef.delete()

    return settings
  }
}
