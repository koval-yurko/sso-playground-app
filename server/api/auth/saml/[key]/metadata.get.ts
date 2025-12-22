export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }

  const authService = useAuthService()
  const metadata = await authService.handleSAMLMetadata(key)
  setResponseHeader(event, 'Content-Type', 'application/xml')
  return metadata
})
