import type { AuthUser } from '~/server/middleware/auth'

export function useCurrentUser() {
  // Get user from server context during SSR and persist to client
  const currentUser = useState<AuthUser | null>('current-user', () => {
    const event = useRequestEvent()
    return event?.context.user || null
  })

  // Watch for user becoming null and redirect to login
  if (process.client) {
    watch(currentUser, (user) => {
      if (user === null) {
        navigateTo('/login')
      }
    })
  }

  // Logout method
  const logout = async () => {
    try {
      // Call logout endpoint in background
      await $fetch('/api/auth/logout')
    }
    catch (error) {
      console.error('Logout error:', error)
    }
    finally {
      // Clear user state (will trigger redirect via watcher)
      currentUser.value = null
    }
  }

  return {
    currentUser,
    logout,
  }
}