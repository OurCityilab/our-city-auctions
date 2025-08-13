<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Initializing moderator console...</p>
    </div>
  </div>
  
  <ModeratorConsole 
    v-else-if="session"
    :session-code="sessionCode" 
  />
  
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-red-600 mb-4">Failed to create or load session</p>
      <button 
        @click="router.push('/')"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Return to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '~/stores/gameStore'
import { useModeratorStore } from '~/stores/moderatorStore'
import ModeratorConsole from '~/features/auction/components/moderator/ModeratorConsole.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const moderatorStore = useModeratorStore()

const sessionCode = ref(route.query.code || 'DEMO')
const loading = ref(true)
const session = ref(null)

onMounted(async () => {
  console.log('Moderator view for session:', sessionCode.value)
  
  // Initialize moderator
  moderatorStore.initializeModerator()
  
  // Try to load existing session first
  const loaded = gameStore.loadSession(sessionCode.value)
  
  if (loaded) {
    console.log('Loaded existing session:', sessionCode.value)
    session.value = gameStore.session
  } else {
    // Create new session
    const moderatorId = 'moderator_' + Date.now()
    session.value = gameStore.createSession(sessionCode.value, moderatorId)
    console.log('Created new session:', sessionCode.value)
  }
  
  loading.value = false
  
  // Set up keyboard shortcuts
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

function handleKeyPress(event) {
  moderatorStore.handleHotkey(event)
}
</script>