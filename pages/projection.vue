<template>
  <ProjectionDisplay :session-code="sessionCode" />
</template>

<script setup>
import ProjectionDisplay from '~/features/auction/components/projection/ProjectionDisplay.vue'

const route = useRoute()
const sessionCode = route.query.code || 'DEMO'

onMounted(() => {
  console.log('Projection view for session:', sessionCode)
})
</script>