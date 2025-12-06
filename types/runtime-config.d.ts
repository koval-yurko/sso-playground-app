declare module 'nuxt/schema' {
  interface RuntimeConfig {
    firestoreDatabaseId: string
    firebaseConfig: string
    testSecret: string
  }

  interface PublicRuntimeConfig {
    // Add public config here
  }
}

export {}
