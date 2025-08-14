<!-- features/auction/components/student/StudentDashboard.vue -->
<template>
  <div class="student-dashboard min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Property Research Center</h1>
            <p class="text-sm text-gray-600">
              Session: {{ sessionCode }} | 
              Phase: <span class="font-bold text-blue-600">{{ gameStore.studentPhase }}</span> |
              Student: {{ currentStudent?.name }}
              <button 
                v-if="gameStore.devMode"
                @click="gameStore.toggleDevMode()"
                class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
              >
                DEV MODE ON
              </button>
            </p>
          </div>
          <div class="flex items-center space-x-6">
            <!-- Research Credits -->
            <div class="text-center">
              <p class="text-sm text-gray-500">Research Credits</p>
              <p class="text-2xl font-bold text-blue-600">{{ studentStore.researchCreditsRemaining }}/30</p>
            </div>
            <!-- Cash Available -->
            <div class="text-center">
              <p class="text-sm text-gray-500">Cash Available</p>
              <p class="text-2xl font-bold text-green-600">
                ${{ studentStore.cashAvailable.toLocaleString() }}
              </p>
            </div>
            <!-- Phase Timer -->
            <div v-if="phaseTimeRemaining > 0" class="text-center">
              <p class="text-sm text-gray-500">Time Remaining</p>
              <p class="text-2xl font-mono">{{ formatTime(phaseTimeRemaining) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase-specific Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Phase Unlock Interface -->
      <PhaseUnlock />
      
      <!-- Phase Content Based on Student's Current Phase -->
      <div v-if="!gameStore.studentPhase || gameStore.studentPhase === 'LOBBY'" class="text-center py-12">
        <h2 class="text-3xl font-bold mb-4">Welcome to the Auction Game</h2>
        <p class="text-gray-600 mb-8">Enter the phase code provided by your moderator to begin.</p>
      </div>

      <!-- PREVIEW Phase -->
      <div v-else-if="gameStore.studentPhase === 'PREVIEW'" class="space-y-6">
        <PreviewPhase />
      </div>

      <!-- ANNOUNCEMENT Phase -->
      <div v-else-if="gameStore.studentPhase === 'ANNOUNCEMENT'" class="space-y-6">
        <AnnouncementPhase />
      </div>

      <!-- BANKING Phase -->
      <div v-else-if="gameStore.studentPhase === 'BANKING'" class="space-y-6">
        <BankingPhase />
      </div>

      <!-- BIDDING Phase -->
      <div v-else-if="gameStore.studentPhase === 'BIDDING'" class="space-y-6">
        <BiddingPhase />
      </div>

      <!-- REDEMPTION Phase -->
      <div v-else-if="gameStore.studentPhase === 'REDEMPTION'" class="space-y-6">
        <RedemptionPhase />
      </div>

      <!-- COMPLETE Phase -->
      <div v-else-if="gameStore.studentPhase === 'COMPLETE'" class="space-y-6">
        <CompletePhase />
      </div>
    </div>

    <!-- Modals -->
    <ResearchModal 
      v-if="showResearchModal && selectedProperty"
      :property="selectedProperty"
      @close="showResearchModal = false"
    />
    
    <AnalysisModal 
      v-if="showAnalysisModal && selectedProperty"
      :property="selectedProperty"
      @close="showAnalysisModal = false"
    />
    
    <DraftBoardModal 
      v-if="showDraftBoard"
      @close="showDraftBoard = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'

// Phase Navigation Component
import PhaseUnlock from '~/components/student/PhaseUnlock.vue'

// Phase Components
import PreviewPhase from './phases/PreviewPhase.vue'
import AnnouncementPhase from './phases/AnnouncementPhase.vue'
import BankingPhase from './phases/BankingPhase.vue'
import BiddingPhase from './phases/BiddingPhase.vue'
import RedemptionPhase from './phases/RedemptionPhaseSafetyCheck.vue'
import CompletePhase from './phases/CompletePhase.vue'

// Modal Components
import ResearchModal from './modals/ResearchModal.vue'
import AnalysisModal from './modals/AnalysisModal.vue'
import DraftBoardModal from './modals/DraftBoardModal.vue'

const props = defineProps({
  sessionCode: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  }
})

const gameStore = useGameStore()
const studentStore = useStudentStore()

// State
const showResearchModal = ref(false)
const showAnalysisModal = ref(false)
const showDraftBoard = ref(false)
const selectedProperty = ref(null)

// Computed
const session = computed(() => gameStore.session)
const currentStudent = computed(() => studentStore.currentStudent)
const phaseTimeRemaining = computed(() => gameStore.phaseTimeRemaining)

// Methods
function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Provide shared state and methods to child components
provide('studentDashboard', {
  showResearchModal,
  showAnalysisModal,
  showDraftBoard,
  selectedProperty,
  openResearchModal(property) {
    selectedProperty.value = property
    showResearchModal.value = true
  },
  openAnalysisModal(property) {
    selectedProperty.value = property
    showAnalysisModal.value = true
  },
  openDraftBoard() {
    showDraftBoard.value = true
  }
})

// Auto-refresh timer
const timerInterval = setInterval(() => {
  // This will trigger reactivity for the timer
  gameStore.$patch({})
}, 1000)

onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
.student-dashboard {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
</style>