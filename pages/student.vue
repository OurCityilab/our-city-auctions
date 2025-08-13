<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Joining session...</p>
    </div>
  </div>
  
  <StudentDashboard 
    v-else-if="student"
    :session-code="sessionCode"
    :student-id="studentId" 
  />
  
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-red-600 mb-4">Invalid session code or failed to join</p>
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
import { useStudentStore } from '~/stores/studentStore'
import StudentDashboard from '~/features/auction/components/student/StudentDashboard.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const studentStore = useStudentStore()

const sessionCode = ref(route.query.code || 'DEMO')
const studentId = ref(route.query.id || null)
const studentName = ref(route.query.name || 'Student')
const loading = ref(true)
const student = ref(null)

onMounted(async () => {
  console.log('Student view:', { sessionCode: sessionCode.value, studentId: studentId.value, studentName: studentName.value })
  
  // Check for dev mode in URL params
  if (route.query.dev === 'true') {
    gameStore.toggleDevMode()
  }
  
  // Try to load the session
  const sessionLoaded = gameStore.loadSession(sessionCode.value)
  
  if (!sessionLoaded) {
    console.error('Session not found:', sessionCode.value)
    loading.value = false
    return
  }
  
  // Check if this is a returning student
  if (studentId.value && gameStore.session.students.has(studentId.value)) {
    // Returning student
    student.value = gameStore.session.students.get(studentId.value)
    gameStore.currentStudentId = studentId.value
    studentStore.initializeStudent(student.value)
    console.log('Returning student:', student.value.name)
  } else {
    // New student joining
    student.value = gameStore.joinSession(sessionCode.value, decodeURIComponent(studentName.value))
    
    if (student.value) {
      studentStore.initializeStudent(student.value)
      // Update URL with new student ID
      router.replace({
        query: {
          ...route.query,
          id: student.value.id
        }
      })
      console.log('New student joined:', student.value.name)
    }
  }
  
  loading.value = false
})
</script>