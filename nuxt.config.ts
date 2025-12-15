// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  nitro: {
    preset: 'firebase_app_hosting',
  },

  hooks: {
    'prerender:routes': ({ routes }) => {
      routes.clear()
    },
  },

  devServer: {
    port: 3000,
  },

  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/hints',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/eslint',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    testSecret: '', // NUXT_TEST_SECRET
    firestoreDatabaseId: '', // NUXT_FIRESTORE_DATABASE_ID
    firebaseConfig: process.env.FIREBASE_CONFIG || '', // FIREBASE_CONFIG (no NUXT_ prefix),

    public: {
      baseUrl: '', // NUXT_PUBLIC_BASE_URL
    },
  },
})
