export interface AuthUser {
  sessionId: string
  userId: string
  userEmail: string
  settingType: string
  settingKey: string
}

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

  const isApiRequest = path.startsWith('/api/')

  // Get session_id from cookie (server-side)
  const sessionId = getCookie(event, 'session_id')

  try {
    // Validate session using AuthService
    const authService = useAuthService()
    const session = await authService.getValidSession(sessionId)

    if (!session) {
      // Invalid or expired session
      if (!isApiRequest) {
        return sendRedirect(event, '/login', 302)
      }
      return
    }

    // Session is valid, attach user info to event context
    event.context.user = {
      sessionId: session.id,
      userId: session.userId,
      userEmail: session.userEmail,
      settingType: session.settingType,
      settingKey: session.settingKey,
    } as AuthUser
  }
  catch (error) {
    console.error('Auth middleware error:', error)
    if (!isApiRequest) {
      return sendRedirect(event, '/login', 302)
    }
  }
})
