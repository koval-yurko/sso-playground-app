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

  // TODO: Create user session, set cookies, etc.
  // For now, return the authentication result
  return {
    success: true,
    userInfo: result.userInfo,
    // Don't expose tokens in response for security
    // Store them in a session instead
  }
})
