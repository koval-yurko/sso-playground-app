import type { EnabledLoginMethod } from '~~/server/services/SettingsService'

export interface SettingsLoginsResponse {
  methods: EnabledLoginMethod[]
}

export default defineEventHandler(async (): Promise<SettingsLoginsResponse> => {
  try {
    const settingsService = useSettingsService()
    const methods = await settingsService.getEnabledMethods()

    return {
      methods,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching settings: ${errorMessage}`,
    })
  }
})
