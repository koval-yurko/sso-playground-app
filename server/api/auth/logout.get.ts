export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')

  if (sessionId) {
    try {
      const authService = useAuthService()
      await authService.handleLogout(sessionId)
    }
    catch (error) {
      console.error('Error during logout:', error)
      // Continue with logout even if deletion fails
    }
  }

  // Clear the session cookie
  deleteCookie(event, 'session_id')

  // Redirect to login page
  return sendRedirect(event, '/login')
})
