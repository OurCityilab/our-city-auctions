<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center text-white mb-12">
        <h1 class="text-5xl font-bold mb-4">Wayne County Auction Game</h1>
        <p class="text-xl">Educational Real Estate Auction Simulation</p>
      </div>

      <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <!-- Create Session -->
        <div class="bg-white rounded-lg shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Create Session</h2>
          <p class="text-gray-600 mb-6">Start a new auction session as moderator</p>
          
          <div class="space-y-4">
            <input
              v-model="newSessionCode"
              type="text"
              placeholder="Enter session code (e.g., WAYNE-F24)"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <button
              @click="createSession"
              class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Session as Moderator
            </button>
          </div>

          <div class="mt-6 pt-6 border-t">
            <p class="text-sm text-gray-600 mb-3">Quick Start:</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="preset in presetSessions"
                :key="preset"
                @click="quickStart(preset, 'moderator')"
                class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                {{ preset }}
              </button>
            </div>
          </div>
        </div>

        <!-- Join Session -->
        <div class="bg-white rounded-lg shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Join Session</h2>
          <p class="text-gray-600 mb-6">Enter as a student</p>
          
          <div class="space-y-4">
            <input
              v-model="joinCode"
              type="text"
              placeholder="Session code"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <input
              v-model="studentName"
              type="text"
              placeholder="Your name"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <button
              @click="joinSession"
              class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Join as Student
            </button>
          </div>

          <div class="mt-6 pt-6 border-t">
            <p class="text-sm text-gray-600 mb-3">Demo Sessions:</p>
            <button
              @click="joinDemo"
              class="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded text-sm"
            >
              Join DEMO Session
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="max-w-4xl mx-auto mt-12 bg-white bg-opacity-10 rounded-lg p-6">
        <h3 class="text-white text-lg font-semibold mb-4">Quick Access Links:</h3>
        <div class="grid md:grid-cols-3 gap-4">
          <a
            href="/moderator?code=DEMO"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-lg text-center transition"
          >
            <div class="text-2xl mb-2">🎮</div>
            <div>Moderator Console</div>
            <div class="text-sm opacity-75">Demo Session</div>
          </a>
          
          <a
            href="/student?code=DEMO&id=student_1"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-lg text-center transition"
          >
            <div class="text-2xl mb-2">📚</div>
            <div>Student Dashboard</div>
            <div class="text-sm opacity-75">Demo Session</div>
          </a>
          
          <a
            href="/projection?code=DEMO"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-lg text-center transition"
          >
            <div class="text-2xl mb-2">📽️</div>
            <div>Projection Display</div>
            <div class="text-sm opacity-75">Demo Session</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const router = useRouter()
const newSessionCode = ref('')
const joinCode = ref('')
const studentName = ref('')

const presetSessions = ['WAYNE-F24', 'WAYNE-S25', 'DEMO', 'QUICK']

function createSession() {
  if (newSessionCode.value) {
    router.push(`/moderator?code=${newSessionCode.value}`)
  }
}

function quickStart(code, role) {
  router.push(`/${role}?code=${code}`)
}

function joinSession() {
  if (joinCode.value && studentName.value) {
    const studentId = 'student_' + Date.now()
    router.push(`/student?code=${joinCode.value}&id=${studentId}&name=${encodeURIComponent(studentName.value)}`)
  }
}

function joinDemo() {
  const studentId = 'student_' + Date.now()
  router.push(`/student?code=DEMO&id=${studentId}&name=Demo Student`)
}
</script>