import type { Settings } from '~~/types/Settings'

export default defineEventHandler(async (event): Promise<Settings> => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Setting ID is required',
      })
    }

    const settingsService = useSettingsService()
    return await settingsService.delete(id)
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: `Error deleting setting: ${errorMessage}`,
    })
  }
})