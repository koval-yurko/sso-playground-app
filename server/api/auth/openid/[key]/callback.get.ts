export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }

  const query = getQuery(event)

  // Check for OAuth error response
  if (query.error) {
    throw createError({
      statusCode: 400,
      statusMessage: `OAuth error: ${query.error}`,
      data: {
        error: query.error,
        errorDescription: query.error_description,
      },
    })
  }

  // Extract authorization code
  const code = query.code as string
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Authorization code is required',
    })
  }

  // Handle the callback using AuthService
  const authService = useAuthService()
  const result = await authService.handleOpenIdCallback(key, code)

  // Set session cookie with proper security settings
  const isProduction = process.env.NODE_ENV === 'production'
  setCookie(event, 'session_id', result.sessionId, {
    httpOnly: true, // Always secure: prevents client-side JavaScript access
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Redirect to home page
  return sendRedirect(event, '/', 302)
})
