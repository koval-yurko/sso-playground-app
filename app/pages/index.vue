<script setup lang="ts">
const { currentUser, logout } = useCurrentUser()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          SSO Playground
        </h1>
        <p class="text-gray-600 mb-8">
          Welcome to the SSO Playground Application
        </p>
        <div v-if="currentUser" class="mb-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-gray-700">
            <span class="font-semibold">Logged in as:</span> {{ currentUser.userEmail }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            User ID: {{ currentUser.userId }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            type: {{ currentUser.settingType }}, key: {{ currentUser.settingKey }}
          </p>
        </div>
        <div class="space-y-4">
           <NuxtLink
            to="/settings"
            class="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Settings
          </NuxtLink>
          <button
            class="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="logout"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
