export default defineEventHandler(async (event) => {
  try {
    const db = getFirestoreDB()

    const snapshot = await db.collection('items')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return {
      items,
      count: items.length,
    }
  } catch (error: any) {
    console.error('Full error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
    })
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching items: ${error.message}`,
    })
  }
})
