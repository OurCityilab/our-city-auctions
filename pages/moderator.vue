<template>
  <ModeratorConsole :session-code="sessionCode" />
</template>

<script setup>
import ModeratorConsole from '~/features/auction/components/moderator/ModeratorConsole.vue'

const route = useRoute()
const sessionCode = route.query.code || 'DEMO'

onMounted(() => {
  console.log('Moderator view for session:', sessionCode)
})
</script>