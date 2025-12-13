<script setup lang="ts">
import type { OpenIDSettings, OpenIDSettingsCreateDTO, OpenIDSettingsUpdateDTO } from '~~/types/Settings'

interface Props {
  item?: OpenIDSettings | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  mode: 'create',
})

const emit = defineEmits<{
  'submit-create': [data: OpenIDSettingsCreateDTO],
  'submit-update': [data: OpenIDSettingsUpdateDTO],
  'submit-delete': [],
  'cancel': []
}>()

const formData = ref({
  name: props.item?.name || '',
  key: props.item?.key || '',
  discoveryEndpoint: props.item?.discoveryEndpoint || '',
  clientId: props.item?.clientId || '',
  clientSecret: props.item?.clientSecret || '',
  prompt: props.item?.prompt || '',
  enabled: props.item?.enabled ?? true,
})

const isKeyManuallyEdited = ref(!!props.item?.key)

const redirectUrl = computed(() => {
  const key = formData.value.key || generateKey(formData.value.name)
  const baseUrl = useRuntimeConfig().public.baseUrl || window.location.origin
  
  return `${baseUrl}/api/auth/openid/${key}/callback`
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
  const data: OpenIDSettingsCreateDTO | OpenIDSettingsUpdateDTO = {
    type: 'openid',
    name: formData.value.name,
    key: formData.value.key || generateKey(formData.value.name),
    discoveryEndpoint: formData.value.discoveryEndpoint,
    clientId: formData.value.clientId,
    clientSecret: formData.value.clientSecret,
    prompt: formData.value.prompt,
    enabled: formData.value.enabled,
  }

  if (formData.value.key) {
    data.key = formData.value.key
  }

  if (props.item) {
    emit('submit-update', data as OpenIDSettingsUpdateDTO)
  } else {
    emit('submit-create', data as OpenIDSettingsCreateDTO)
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
        hint="Copy the Redirect URL to configure your OIDC provider "
      />

      <BaseInput
        id="discoveryEndpoint"
        v-model="formData.discoveryEndpoint"
        class="block"
        label="Discovery Endpoint"
        hint="Paste here your discovery endpoint"
        placeholder="https://accounts.google.com/.well-known/openid-configuration"
      />

      <BaseInput
        id="clientId"
        v-model="formData.clientId"
        class="block"
        label="Client Id"
        hint="The client ID you received when registering your application with your provider"
      />

      <BaseInput
        id="clientSecret"
        v-model="formData.clientSecret"
        autocomplete="new-password"
        type="password"
        class="block"
        label="Client Secret"
        hint="The client Secret you received when registering your application with your provider"
      />

      <BaseInput
        id="prompt"
        v-model="formData.prompt"
        class="block"
        label="Prompt"
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
