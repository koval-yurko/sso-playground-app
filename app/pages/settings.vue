<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">
            Settings
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div class="px-6 py-5 space-y-6">
          <!-- Profile Section -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Profile Information
            </h2>
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  v-model="profile.name"
                  type="text"
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your name"
                >
              </div>
              <div>
                <label for="email-settings" class="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email-settings"
                  v-model="profile.email"
                  type="email"
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="your.email@example.com"
                >
              </div>
            </div>
          </div>

          <!-- Preferences Section -->
          <div class="pt-6 border-t border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Preferences
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label for="notifications" class="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p class="text-sm text-gray-500">
                    Receive email updates about your account
                  </p>
                </div>
                <input
                  id="notifications"
                  v-model="preferences.notifications"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label for="two-factor" class="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </label>
                  <p class="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <input
                  id="two-factor"
                  v-model="preferences.twoFactor"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 border-t border-gray-200 flex justify-between">
            <NuxtLink
              to="/home"
              class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Home
            </NuxtLink>
            <button
              @click="saveSettings"
              class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const profile = ref({
  name: '',
  email: ''
})

const preferences = ref({
  notifications: true,
  twoFactor: false
})

const saveSettings = () => {
  console.log('Saving settings:', { profile: profile.value, preferences: preferences.value })
  // Add your save logic here
}
</script>