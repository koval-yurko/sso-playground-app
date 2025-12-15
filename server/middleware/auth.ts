import { FirestoreUserSessionsRepository } from '../repositories/FirestoreUserSessionsRepository'

export default defineEventHandler(async (event) => {
  // Skip auth check for login and auth-related endpoints
  const path = event.path
  if (
    path.startsWith('/api/auth/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/login')
  ) {
    return
  }

  // Get session_id from cookie (server-side)
  const sessionId = getCookie(event, 'session_id')

  if (!sessionId) {
    // No session cookie, user needs to login
    if (!path.startsWith('/api/')) {
      // For page requests, redirect to login
      return sendRedirect(event, '/login', 302)
    }
    return
  }

  try {
    // Validate session
    const userSessionsRepository = new FirestoreUserSessionsRepository()
    const session = await userSessionsRepository.getBySessionId(sessionId)

    if (!session || session.expiresAt < Date.now()) {
      // Invalid or expired session
      if (!path.startsWith('/api/')) {
        return sendRedirect(event, '/login', 302)
      }
      return
    }

    // Session is valid, attach user info to event context
    event.context.user = {
      id: session.userId,
      sessionId: session.id,
    }
  }
  catch (error) {
    console.error('Auth middleware error:', error)
    if (!path.startsWith('/api/')) {
      return sendRedirect(event, '/login', 302)
    }
  }
})