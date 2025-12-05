export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required',
    })
  }

  const db = getFirestoreDB()

  const item = {
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
  }

  const docRef = await db.collection('items').add(item)

  return {
    id: docRef.id,
    ...item,
  }
})