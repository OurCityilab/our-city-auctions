<template>
  <div class="phase-unlock">
    <!-- Current Phase Display -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Phase Navigation</h3>
        <div v-if="gameStore.devMode" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          DEV MODE
        </div>
      </div>
      
      <!-- Phase Code Entry -->
      <div v-if="!gameStore.devMode" class="mb-4">
        <div class="flex gap-2">
          <input
            v-model="phaseCode"
            @keyup.enter="unlockPhase"
            type="text"
            placeholder="Enter phase code..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
          <button
            @click="unlockPhase"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Unlock Phase
          </button>
        </div>
        <p v-if="errorMessage" class="text-red-600 text-sm mt-2">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-green-600 text-sm mt-2">{{ successMessage }}</p>
      </div>
      
      <!-- Phase Buttons -->
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="phase in phases"
          :key="phase"
          @click="goToPhase(phase)"
          :disabled="!gameStore.isPhaseUnlocked(phase)"
          :class="[
            'px-3 py-2 rounded-lg font-medium transition text-sm',
            gameStore.studentPhase === phase
              ? 'bg-blue-600 text-white'
              : gameStore.isPhaseUnlocked(phase)
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          ]"
        >
          <div class="flex items-center justify-center gap-1">
            <Icon 
              v-if="gameStore.isPhaseUnlocked(phase)" 
              name="heroicons:lock-open" 
              class="w-3 h-3"
            />
            <Icon 
              v-else 
              name="heroicons:lock-closed" 
              class="w-3 h-3"
            />
            <span>{{ formatPhaseName(phase) }}</span>
          </div>
        </button>
      </div>
      
      <!-- Current Phase Info -->
      <div class="mt-4 p-3 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-900">
          <span class="font-semibold">Current Phase:</span> 
          {{ formatPhaseName(gameStore.studentPhase) }}
        </p>
        <p class="text-xs text-blue-700 mt-1">
          The moderator will announce codes to unlock new phases
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '~/stores/gameStore'

const gameStore = useGameStore()

const phases = ['PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']
const phaseCode = ref('')
const errorMessage = ref('')
const successMessage = ref('')

function unlockPhase() {
  if (!phaseCode.value.trim()) {
    errorMessage.value = 'Please enter a phase code'
    successMessage.value = ''
    return
  }
  
  const result = gameStore.unlockPhase(phaseCode.value.toUpperCase())
  
  if (result.success) {
    successMessage.value = `✓ ${formatPhaseName(result.phase)} phase unlocked!`
    errorMessage.value = ''
    phaseCode.value = ''
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    errorMessage.value = 'Invalid phase code. Please check with the moderator.'
    successMessage.value = ''
  }
}

function goToPhase(phase) {
  if (gameStore.isPhaseUnlocked(phase)) {
    gameStore.setStudentPhase(phase)
  }
}

function formatPhaseName(phase) {
  const names = {
    PREVIEW: 'Preview',
    ANNOUNCEMENT: 'Opening Bids',
    BANKING: 'Banking',
    BIDDING: 'Bidding',
    REDEMPTION: 'Redemption',
    COMPLETE: 'Results'
  }
  return names[phase] || phase
}
</script>

<style scoped>
input.uppercase {
  text-transform: uppercase;
}
</style>