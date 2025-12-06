
export default defineEventHandler(async (event): Promise<unknown> => {
  try {
    const key = getRouterParam(event, 'key')

    if (!key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Setting Key is required',
      })
    }

    const settingsService = useSettingsService()
    return await settingsService.getByKey(key)
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: `Can not make an Auth: ${errorMessage}`,
    })
  }
})
