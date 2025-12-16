import type { AuthUser } from '~/server/middleware/auth'

declare module 'h3' {
  interface H3EventContext {
    user?: AuthUser
  }
}

export {}
