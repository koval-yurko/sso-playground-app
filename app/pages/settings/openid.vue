<script setup lang="ts">
import type { OpenIDSettings, OpenIDSettingsCreateDTO, OpenIDSettingsUpdateDTO } from '~~/types/Settings'

interface SettingsListResponse {
  items: OpenIDSettings[]
}

const { data: itemsData, refresh: refreshItems } = await useFetch<SettingsListResponse>('/api/settings?type=openid')

const items = computed(() => itemsData.value?.items || [])

const expandedItems = ref<Set<string>>(new Set())

const isCreateActivated = ref(false)

const isExpanded = (id: string) => expandedItems.value.has(id)

const toggleItem = (id: string) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  }
  else {
    expandedItems.value.add(id)
  }
}

const handleCreateStart = () => {
  isCreateActivated.value = true
}

const handleCreateCancel = () => {
  isCreateActivated.value = false
}

const handleCreateSubmit = async (data: OpenIDSettingsCreateDTO) => {
  await $fetch('/api/settings', {
    method: 'POST',
    body: data,
  })
  await refreshItems()
  isCreateActivated.value = false
}

const handleUpdateSubmit = async (id: string, data: OpenIDSettingsUpdateDTO) => {
  await $fetch(`/api/settings/${id}`, {
    method: 'PATCH',
    body: data,
  })
  await refreshItems()
}

const handleDeleteSubmit = async (id: string) => {
  await $fetch(`/api/settings/${id}`, {
    method: 'DELETE',
  })
  await refreshItems()
}

</script>

<template>
  <div class="py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-medium text-gray-900">
          OpenID Connect Settings
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          Configure your OpenID Connect authentication providers
        </p>
      </div>
      <BaseButton @click="handleCreateStart">Add Provider</BaseButton>
    </div>

    <div v-if="items.length === 0" class="text-center py-12">
      <p class="text-gray-500">
        No OpenID Connect providers configured yet.
      </p>
      <p class="text-sm text-gray-400 mt-2">
        Click "Add Provider" to get started.
      </p>
    </div>

    <div v-else class="space-y-2">
      <AccordionSetting
        v-for="item in items"
        :key="item.id"
        :item="item"
        :is-expanded="isExpanded(item.id)"
        @toggle="toggleItem(item.id)"
      >
        <FormOpenid
          :item="item"
          mode="edit"
          @submit-update="(data) => handleUpdateSubmit(item.id, data)"
          @submit-delete="() => handleDeleteSubmit(item.id)"
        />
      </AccordionSetting>
    </div>

    <div v-if="isCreateActivated" class="mt-6">
      <FormOpenid
        mode="create"
        @submit-create="(data) => handleCreateSubmit(data)"
        @cancel="handleCreateCancel"
      />
    </div>
  </div>
</template>
