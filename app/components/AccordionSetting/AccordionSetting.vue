<script setup lang="ts">
import type { Settings } from '~~/types/Settings'

interface Props {
  item: Settings
  isExpanded: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()

const handleToggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- Accordion Header -->
    <button
      class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      @click="handleToggle"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-2 h-2 rounded-full"
          :class="item.enabled ? 'bg-green-500' : 'bg-gray-300'"
        />
        <div class="text-left">
          <h4 class="text-sm font-medium text-gray-900">
            {{ item.name }}
          </h4>
          <p class="text-xs text-gray-500">
            Key: {{ item.key || 'Not set' }}
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="item.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
        >
          {{ item.enabled ? 'Enabled' : 'Disabled' }}
        </span>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Accordion Content (Slot) -->
    <div
      v-show="isExpanded"
      class="px-4 py-4 bg-gray-50 border-t border-gray-200"
    >
      <slot />
    </div>
  </div>
</template>
