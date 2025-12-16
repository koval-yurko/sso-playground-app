import type { Settings, SettingsUpdateDTO } from '~~/types/Settings'

export default defineEventHandler(async (event): Promise<Settings> => {
  requireAuth(event)

  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Setting ID is required',
      })
    }

    const body = await readBody<SettingsUpdateDTO>(event)

    const settingsService = useSettingsService()
    return await settingsService.update(id, body)
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: `Error updating setting: ${errorMessage}`,
    })
  }
})
