export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }
  const authService = useAuthService()
  const loginResult = await authService.handleSAMLLogin(key)

  // Redirect to the SAML IdP for authentication
  return sendRedirect(event, loginResult.authorizationUrl)
})
