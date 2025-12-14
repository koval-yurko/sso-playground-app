<template>
  <NuxtPage />
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  if (route.path === '/login') {
    return
  }

  try {
    // Get sessionId from cookie
    const sessionId = useCookie('session_id').value

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
