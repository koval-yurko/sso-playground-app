export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }

  // Read the form data from the POST request (IdP sends SAMLResponse via HTTP-POST)
  const body = await readBody(event)
  const samlResponse = body.SAMLResponse

  if (!samlResponse) {
    throw createError({
      statusCode: 400,
      statusMessage: 'SAMLResponse parameter is required',
    })
  }

  // Process the SAML response and create session
  const authService = useAuthService()
  const callbackResult = await authService.handleSAMLCallback(key, samlResponse)

  // Redirect user to the application home page with session
  // You can customize this redirect URL based on your application needs
  const config = useRuntimeConfig()
  const redirectUrl = `${config.public.baseUrl}/?sessionId=${callbackResult.sessionId}`

  return sendRedirect(event, redirectUrl)
})