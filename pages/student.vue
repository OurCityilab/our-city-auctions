<template>
  <StudentDashboard :session-code="sessionCode" :student-id="studentId" />
</template>

<script setup>
import StudentDashboard from '~/features/auction/components/student/StudentDashboard.vue'

const route = useRoute()
const sessionCode = route.query.code || 'DEMO'
const studentId = route.query.id || 'student_1'
const studentName = route.query.name || 'Student'

onMounted(() => {
  console.log('Student view:', { sessionCode, studentId, studentName })
})
</script>