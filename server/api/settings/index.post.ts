import type { Settings, SettingsCreateDTO } from '~~/types/Settings'

type SettingCreateResponse = Settings

export default defineEventHandler(async (event): Promise<SettingCreateResponse> => {
  try {
    const body = await readBody<SettingsCreateDTO>(event)

    const settingsService = useSettingsService()
    return await settingsService.create(body)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: `Error creating setting: ${errorMessage}`,
    })
  }
})
