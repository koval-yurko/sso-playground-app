<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">
            SSO Settings
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            Configure your Single Sign-On authentication providers
          </p>
        </div>

        <div class="border-b border-gray-200">
          <nav class="flex -mb-px px-6" aria-label="Tabs">
            <NuxtLink
              to="/settings/openid"
              class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
              exact-active-class="!border-blue-500 !text-blue-600"
            >
              OpenID Connect
            </NuxtLink>
            <NuxtLink
              to="/settings/saml"
              class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
              exact-active-class="!border-blue-500 !text-blue-600"
            >
              SAML 2.0
            </NuxtLink>
          </nav>
        </div>

        <div class="px-6">
          <NuxtPage />
        </div>

        <div class="px-6 py-5 border-t border-gray-200 flex justify-between">
          <NuxtLink
            to="/"
            class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Redirect to /settings/openid if on parent route
const route = useRoute()
if (route.path === '/settings') {
  navigateTo('/settings/openid', { replace: true })
}
</script>
