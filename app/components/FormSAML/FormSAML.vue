<script setup lang="ts">
import type { SAMLSettings, SAMLSettingsCreateDTO, SAMLSettingsUpdateDTO } from '~~/types/Settings'

interface Props {
  item?: SAMLSettings | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  mode: 'create',
})

const emit = defineEmits<{
  'submit-create': [data: SAMLSettingsCreateDTO],
  'submit-update': [data: SAMLSettingsUpdateDTO],
  'submit-delete': [],
  'cancel': []
}>()

const formData = ref({
  name: props.item?.name || '',
  key: props.item?.key || '',
  metadataURL: props.item?.metadataURL || '',
  enabled: props.item?.enabled ?? true,
})

const isKeyManuallyEdited = ref(!!props.item?.key)

const redirectUrl = computed(() => {
  const key = formData.value.key || generateKey(formData.value.name)
  const baseUrl = useRuntimeConfig().public.baseUrl || window.location.origin
  return `${baseUrl}/auth/saml/${key}/acs`
})

const entityId = computed(() => {
  const key = formData.value.key || generateKey(formData.value.name)
  const baseUrl = useRuntimeConfig().public.baseUrl || window.location.origin
  return `${baseUrl}/auth/saml/${key}/metadata`
})

watch(() => formData.value.name, (newName) => {
  if (!isKeyManuallyEdited.value) {
    formData.value.key = generateKey(newName)
  }
})

const handleKeyInput = () => {
  // If key is cleared, reset to auto-generation
  if (!formData.value.key) {
    isKeyManuallyEdited.value = false
  }
  else {
    isKeyManuallyEdited.value = true
  }
}

const handleSubmit = () => {
  const data: SAMLSettingsCreateDTO | SAMLSettingsUpdateDTO = {
    type: 'saml',
    name: formData.value.name,
    key: formData.value.key || generateKey(formData.value.name),
    metadataURL: formData.value.metadataURL,
    enabled: formData.value.enabled,
  }

  if (formData.value.key) {
    data.key = formData.value.key
  }

  if (props.item) {
    emit('submit-update', data as SAMLSettingsUpdateDTO)
  } else {
    emit('submit-create', data as SAMLSettingsCreateDTO)
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
        {{ mode === 'create' ? 'Add SAML Provider' : 'Edit SAML Provider' }}
      </h3>
      <p class="mt-1 text-sm text-gray-600">
        Configure your SAML authentication provider details
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseInput
        id="name"
        v-model="formData.name"
        class="block"
        label="Provider Name"
        hint="A friendly name to identify this provider"
        required
      />

      <BaseInput
        id="key"
        v-model="formData.key"
        class="block"
        label="Configuration Key"
        hint="Unique identifier used in callback URLs"
        @input="handleKeyInput"
      />

      <BaseInput
        id="key"
        v-model="redirectUrl"
        readonly
        class="block"
        label="Redirect URL"
        hint="Copy the Redirect URL to configure your SAML provider"
      />

      <BaseInput
          id="key"
          v-model="entityId"
          readonly
          class="block"
          label="Entity ID"
          hint="Copy the Entity ID URL to configure your SAML provider"
      />

      <BaseInput
        id="metadataURL"
        v-model="formData.metadataURL"
        class="block"
        label="Metadata URL"
        hint="Paste here the Identity Provider Metadata URL"
        placeholder="e.g. https://samltest.id/saml/idp"
      />

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
