<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'

interface InputProps extends /* @vue-ignore */ InputHTMLAttributes {
  id: string
  label?: string
}

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<InputProps>()
const model = defineModel<string>()

const inputClasses = computed(() => {
  return [
    'appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 bg-white text-gray-900 sm:text-sm',
    'focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10',
    'enabled:cursor-pointer disabled:opacity-50',
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div>
    <label v-if="props.label" :for="props.id" class="block text-sm font-medium text-gray-700 mb-1 text-left">
      {{ props.label }}
    </label>
    <input
        :id="props.id"
        v-model="model"
        v-bind="$attrs"
        :name="props.id"
        :class="inputClasses"
    >
  </div>
</template>
