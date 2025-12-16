<script setup lang="ts">
import type { SettingsLoginsResponse } from '~~/server/api/settings/logins.get'

const { data: loginData, error } = await useFetch<SettingsLoginsResponse>('/api/settings/logins')

const methods = computed(() => loginData.value?.methods || [])
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          SSO Playground Login
        </p>
      </div>
      <div class="mt-8 space-y-4">
        <div v-if="error" class="text-red-600 text-sm text-center">
          Error loading login methods. Please try again.
        </div>
        <div v-else-if="methods.length === 0" class="text-gray-600 text-sm text-center">
          No login methods available. Please contact administrator.
        </div>
        <a
          v-for="method in methods"
          :key="method.loginUrl"
          :href="method.loginUrl"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ({{ method.type }}) Sign in with {{ method.name }}
        </a>
      </div>
    </div>
  </div>
</template>
