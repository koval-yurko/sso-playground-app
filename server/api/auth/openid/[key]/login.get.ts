export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }
  const authService = useAuthService()
  const loginResult = await authService.handleOpenIdLogin(key)

  // TODO: Store state in session for validation in callback

  // Redirect to the authorization endpoint
  return sendRedirect(event, loginResult.authorizationUrl)
})
