import { FirestoreUserSessionsRepository } from '~~/server/repositories/FirestoreUserSessionsRepository'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const sessionId = body?.sessionId

  if (!sessionId) {
    return {
      authenticated: false,
      user: null,
      error: 'Session ID is required',
    }
  }

  try {
    // Look up session in the database
    const userSessionsRepository = new FirestoreUserSessionsRepository()
    const session = await userSessionsRepository.getBySessionId(sessionId)

    if (!session) {
      return {
        authenticated: false,
        user: null,
        error: 'Session not found',
      }
    }

    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      return {
        authenticated: false,
        user: null,
        error: 'Session expired',
      }
    }

    // Return authenticated user info
    return {
      authenticated: true,
      user: {
        id: session.userId,
        // Add more user fields as needed
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    }
  }
  catch (error) {
    console.error('Error validating session:', error)
    return {
      authenticated: false,
      user: null,
      error: 'Failed to validate session',
    }
  }
})