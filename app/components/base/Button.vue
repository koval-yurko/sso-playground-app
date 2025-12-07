<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: 'primary' | 'secondary' | 'danger'
}

const variants = {
  primary: 'border-transparent bg-blue-600 enabled:hover:bg-blue-700 focus:ring-blue-500 text-white',
  secondary: 'border-gray-300 bg-white enabled:hover:bg-gray-50 focus:ring-blue-500 text-gray-700',
  danger: 'border-transparent bg-red-600 enabled:hover:bg-red-700 focus:ring-red-500 text-white',
}

const props = defineProps<ButtonProps>()

const buttonClasses = computed(() => {
  const variant = props.variant || 'primary'

  return [
    'py-2 px-4 border rounded-md shadow-sm text-sm font-medium',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'enabled:cursor-pointer disabled:opacity-50',
    variants[variant],
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <button :class="buttonClasses">
    <slot/>
  </button>
</template>
