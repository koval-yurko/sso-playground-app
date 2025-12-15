<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Extract session_id cookie (works on both server and client)
const sessionIdCookie = useCookie('session_id')

onMounted(async () => {
  if (route.path === '/login') {
    return
  }

  try {
    const sessionId = sessionIdCookie.value
    console.log('sessionId', sessionId)

    if (!sessionId) {
      throw new Error('No session ID found')
    }

    // POST request with sessionId in body
    const session = await $fetch('/api/auth/session', {
      method: 'POST',
      body: {
        sessionId,
      },
    })

    if (!session.authenticated) {
      throw new Error('Not authenticated')
    }
  } catch (error) {
    console.error('Failed to check authentication:', error)
    // On error, redirect to login
    await router.push('/login')
  }
})
</script>

<template>
  <NuxtPage />
</template>
