export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }

  // Get callback query parameters (code, state, etc.)
  const query = getQuery(event)

  return {
    key,
    query,
    message: 'OAuth callback endpoint',
  }
})