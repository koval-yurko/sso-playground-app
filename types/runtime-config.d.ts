declare module 'nuxt/schema' {
  interface RuntimeConfig {
    firestoreDatabaseId: string
    firebaseConfig: string
    testSecret: string
  }

  interface PublicRuntimeConfig {
    baseUrl: string
  }
}

export {}
