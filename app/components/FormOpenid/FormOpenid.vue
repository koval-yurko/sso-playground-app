<script setup lang="ts">
import type { SettingsCreateDTO, SettingsUpdateDTO, Settings } from '~~/types/Settings'

interface Props {
  item?: Settings | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  mode: 'create',
})

const emit = defineEmits<{
  'submit-create': [data: SettingsCreateDTO],
  'submit-update': [data: SettingsUpdateDTO],
  'submit-delete': [],
  'cancel': []
}>()

const formData = ref({
  name: props.item?.name || '',
  key: props.item?.key || '',
  enabled: props.item?.enabled ?? true,
})

const handleSubmit = () => {
  const data: SettingsCreateDTO | SettingsUpdateDTO = {
    type: 'openid',
    name: formData.value.name,
    enabled: formData.value.enabled,
  }

  if (formData.value.key) {
    data.key = formData.value.key
  }

  if (props.item) {
    emit('submit-update', data as SettingsUpdateDTO)
  } else {
    emit('submit-create', data as SettingsCreateDTO)
  }
}

const handleDelete = () => {
  if (props.item) {
    emit('submit-delete')
  }
}

const handleDiscard = () => {
  emit('cancel')
}

</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium text-gray-900">
        {{ mode === 'create' ? 'Add OpenID Provider' : 'Edit OpenID Provider' }}
      </h3>
      <p class="mt-1 text-sm text-gray-600">
        Configure your OpenID Connect authentication provider details
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Name -->
      <BaseInput
        id="name"
        v-model="formData.name"
        class="block"
        label="Provider Name"
        hint="A friendly name to identify this provider"
        required
      />


      <!-- Key -->
      <BaseInput
        id="key"
        v-model="formData.key"
        class="block"
        label="Configuration Key"
        hint="Unique identifier used in callback URLs"
      />

      <!-- Enabled Toggle -->
      <div class="flex items-center justify-between py-3 border-t border-gray-200">
        <div>
          <label for="enabled" class="text-sm font-medium text-gray-700">
            Enable Provider
          </label>
          <p class="text-xs text-gray-500">
            Allow users to authenticate with this provider
          </p>
        </div>
        <input
          id="enabled"
          v-model="formData.enabled"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        >
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <BaseButton type="submit" :disabled="!formData.name">
          {{ mode === 'create' ? 'Create Provider' : 'Save Changes' }}
        </BaseButton>
        <BaseButton v-if="mode === 'edit'" type="button" variant="danger" @click="handleDelete">
          Delete
        </BaseButton>
        <BaseButton v-if="mode === 'create'" type="button" variant="secondary" @click="handleDiscard">
          Discard
        </BaseButton>
      </div>
    </form>
  </div>
</template>
