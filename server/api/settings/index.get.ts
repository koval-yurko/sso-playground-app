import { SettingTypes, type Settings, type SettingType } from '~~/types/Settings'

interface SettingsListResponse {
  items: Settings[]
}

export default defineEventHandler(async (event): Promise<SettingsListResponse> => {
  requireAuth(event)

  try {
    const query = getQuery(event)
    const type = (query.type as SettingType) || SettingTypes.OPEN_ID

    const settingsService = useSettingsService()
    const items = await settingsService.getList(type)

    return {
      items,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching settings: ${errorMessage}`,
    })
  }
})
