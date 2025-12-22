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
  const result = await authService.handleSAMLCallback(key, samlResponse)

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
