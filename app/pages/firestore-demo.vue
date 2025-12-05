<script setup lang="ts">
const name = ref('')
const description = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Fetch items from Firestore
const { data: itemsData, refresh: refreshItems } = await useFetch('/api/settings')

// Add new item
async function addItem() {
  if (!name.value.trim()) {
    errorMessage.value = 'Name is required'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value,
      },
    })

    successMessage.value = 'Item added successfully!'
    name.value = ''
    description.value = ''

    // Refresh the items list
    await refreshItems()

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
  catch (error: any) {
    errorMessage.value = error.data?.statusMessage || 'Failed to add item'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Firestore Demo
        </h1>
        <p class="text-gray-600">
          Add items to Firestore and see them listed below
        </p>
        <NuxtLink
          to="/"
          class="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
        >
          Back to Home
        </NuxtLink>
      </div>

      <!-- Add Item Form -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Add New Item
        </h2>

        <form class="space-y-4" @submit.prevent="addItem">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter item name"
            >
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter item description"
            />
          </div>

          <div v-if="errorMessage" class="text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="text-green-600 text-sm">
            {{ successMessage }}
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Adding...' : 'Add Item' }}
          </button>
        </form>
      </div>

      <!-- Items List -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">
            Settings List ({{ itemsData?.items?.length || 0 }})
          </h2>
          <button
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            @click="refreshItems"
          >
            Refresh
          </button>
        </div>

        <div v-if="!itemsData?.items || itemsData.items.length === 0" class="text-gray-500 text-center py-8">
          No items yet. Add your first item above!
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in itemsData.items"
            :key="item.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">
                  {{ item.name }}
                </h3>
                <p v-if="item.key" class="text-gray-600 text-sm mt-1">
                  {{ item.key }}
                </p>
                <p v-if="item.enabled" class="text-gray-600 text-sm mt-1">
                  {{ item.enabled }}
                </p>
              </div>
              <div class="text-xs text-gray-500 ml-4">
                {{ item.type }}
              </div>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              ID: {{ item.id }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
