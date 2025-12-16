import type { H3Event } from 'h3'
import type { AuthUser } from '~/server/middleware/auth'

/**
 * Ensures the request has an authenticated user.
 * Throws a 401 error if not authenticated.
 * Returns the authenticated user if successful.
 */
export function requireAuth(event: H3Event): AuthUser {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Authentication required',
    })
  }

  return event.context.user
}