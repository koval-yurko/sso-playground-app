<script setup lang="ts">
const input = ref('XXXXXXXXXXXXXXXXXXXXXX')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h3 class="text-2xl font-bold text-gray-900 my-4">
          Buttons
        </h3>
        <div class="flex flex-col gap-2">
          <div class="space-x-2">
            <BaseButton type="button">Primary</BaseButton>
            <BaseButton variant="secondary" type="button">Secondary</BaseButton>
          </div>

          <BaseButton class="w-full block" type="button">Primary</BaseButton>

          <BaseButton variant="secondary" class="w-full block" type="button">Secondary</BaseButton>
        </div>

        <h3 class="text-2xl font-bold text-gray-900 my-4">
          Inputs
        </h3>
        <div class="flex flex-col gap-2">
          <BaseInput
              id="demo-email"
              label="Email Address"
              placeholder="Placeholder"
          />

          <BaseInput
              id="demo-email"
              v-model="input"
              label="Email Address"
              placeholder="Placeholder"
          />

          <BaseInput
              id="demo-email-2"
              v-model="input"
              label="Email Address (disabled)"
              placeholder="Disabled"
              disabled
          />

          <BaseInput
              id="demo-email-3"
              v-model="input"
              label="Email Address (readonly)"
              placeholder="Placeholder"
              readonly
          />
        </div>
      </div>
    </div>
  </div>
</template>
