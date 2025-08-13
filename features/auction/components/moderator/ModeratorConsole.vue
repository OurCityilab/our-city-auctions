<!-- features/auction/components/moderator/ModeratorConsole.vue -->
<template>
  <div class="moderator-console min-h-screen bg-gray-900 text-white">
    <!-- Header Bar -->
    <div class="bg-gray-800 border-b border-gray-700 p-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Moderator Console</h1>
          <p class="text-gray-400">
            Session: {{ sessionCode }} | 
            Phase: <span class="font-bold text-yellow-400">{{ session.currentPhase }}</span> | 
            Students: {{ studentsArray.length }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="moderatorStore.showTimer" class="text-right">
            <p class="text-sm text-gray-400">Time Remaining</p>
            <p class="text-3xl font-mono">{{ formatTime(phaseTimeRemaining) }}</p>
          </div>
          <button 
            @click="moderatorStore.toggleHotkeys()"
            :class="[
              'px-4 py-2 rounded transition',
              moderatorStore.hotkeysEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
            ]"
          >
            Hotkeys: {{ moderatorStore.hotkeysEnabled ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex h-[calc(100vh-80px)]">
      <!-- Left Panel: Phase Control & Current Property -->
      <div class="w-1/3 border-r border-gray-700 p-6 overflow-y-auto">
        <!-- Phase Control -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Phase Control</h2>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="phase in availablePhases"
              :key="phase"
              @click="transitionToPhase(phase)"
              :class="[
                'px-4 py-3 rounded font-medium transition',
                session.currentPhase === phase 
                  ? 'bg-blue-600 text-white' 
                  : moderatorStore.canTransitionToPhase(phase)
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              ]"
              :disabled="!moderatorStore.canTransitionToPhase(phase) && session.currentPhase !== phase"
            >
              {{ phase }}
            </button>
          </div>
        </div>

        <!-- Phase Access Codes -->
        <div class="mb-6 bg-yellow-900 rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-3 text-yellow-100">Phase Access Codes</h2>
          <div class="space-y-2">
            <div v-for="phase in ['ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']" 
                 :key="`code-${phase}`" 
                 class="flex justify-between items-center bg-yellow-800 rounded px-3 py-2">
              <span class="text-sm font-medium">{{ formatPhaseName(phase) }}:</span>
              <div class="flex items-center gap-2">
                <code class="bg-black px-2 py-1 rounded text-yellow-300 font-mono">
                  {{ gameStore.getPhaseCode(phase) }}
                </code>
                <button
                  @click="copyPhaseCode(phase)"
                  class="p-1 hover:bg-yellow-700 rounded transition"
                  title="Copy code"
                >
                  <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <p class="text-xs text-yellow-300 mt-3">
            Share these codes with students to unlock phases
          </p>
        </div>

        <!-- Current Property (During Bidding) -->
        <div v-if="session.currentPhase === 'BIDDING' && currentProperty" class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">
            Property {{ moderatorStore.currentPropertyIndex + 1 }} of {{ session.properties.length }}
          </h3>
          <div>
            <p class="font-bold text-xl">{{ currentProperty.address }}</p>
            <p class="text-gray-400">{{ currentProperty.city }}, {{ currentProperty.neighborhood }}</p>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">Beds/Baths:</span>
                <span class="ml-2">{{ currentProperty.bedrooms }}/{{ currentProperty.bathrooms }}</span>
              </div>
              <div>
                <span class="text-gray-500">Sq Ft:</span>
                <span class="ml-2">{{ currentProperty.squareFeet?.toLocaleString() || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-gray-500">Year:</span>
                <span class="ml-2">{{ currentProperty.yearBuilt }}</span>
              </div>
              <div>
                <span class="text-gray-500">Type:</span>
                <span class="ml-2">{{ currentProperty.propertyType }}</span>
              </div>
            </div>
            <div class="mt-4 p-3 bg-green-900 rounded">
              <p class="text-green-400 text-sm">Opening Bid</p>
              <p class="text-3xl font-bold">${{ currentProperty.openingBid?.toLocaleString() || '0' }}</p>
            </div>
            
            <!-- Current High Bid -->
            <div v-if="topBid" class="mt-3 p-3 bg-blue-900 rounded">
              <p class="text-blue-400 text-sm">Current High Bid</p>
              <p class="text-2xl font-bold">${{ topBid.amount.toLocaleString() }}</p>
              <p class="text-sm text-gray-400">{{ topBid.studentName }} (#{{ topBid.paddleNumber }})</p>
            </div>
          </div>
          
          <!-- Property Navigation -->
          <div class="mt-4 flex gap-2">
            <button 
              @click="moderatorStore.previousProperty()"
              :disabled="moderatorStore.currentPropertyIndex === 0"
              class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              ← Previous (P)
            </button>
            <button 
              @click="moderatorStore.nextProperty()"
              :disabled="moderatorStore.currentPropertyIndex >= session.properties.length - 1"
              class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Next (N) →
            </button>
          </div>
        </div>

        <!-- Market Events -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-3">Market Events</h3>
          <div class="space-y-2">
            <button 
              @click="triggerMarketEvent('FACTORY_CLOSING')"
              class="w-full px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-left"
            >
              🏭 Factory Closing (-20% Detroit area)
            </button>
            <button 
              @click="triggerMarketEvent('NEW_DEVELOPMENT')"
              class="w-full px-3 py-2 bg-green-900 hover:bg-green-800 rounded text-left"
            >
              🏗️ New Development (+15% Suburbs)
            </button>
            <button 
              @click="triggerMarketEvent('CRIME_REDUCTION')"
              class="w-full px-3 py-2 bg-blue-900 hover:bg-blue-800 rounded text-left"
            >
              👮 Crime Reduction (+10% Detroit)
            </button>
          </div>
          
          <!-- Event Queue -->
          <div v-if="moderatorStore.marketEventQueue.length > 0" class="mt-3 space-y-1">
            <div 
              v-for="event in moderatorStore.marketEventQueue" 
              :key="event.timestamp"
              class="text-xs bg-yellow-900 text-yellow-200 p-2 rounded animate-pulse"
            >
              {{ event.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Center Panel: Quick Bid Entry & Student Management -->
      <div class="flex-1 p-6 overflow-y-auto">
        <!-- Quick Bid Entry (During Bidding) -->
        <div v-if="session.currentPhase === 'BIDDING'" class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Quick Bid Entry</h2>
          
          <!-- Hotkey Guide -->
          <div class="bg-gray-800 rounded p-3 mb-4 text-sm">
            <span class="text-gray-400">Hotkeys:</span>
            <span class="ml-2">1-9 = Student</span>
            <span class="ml-4">Enter = Record</span>
            <span class="ml-4">G = Going Once</span>
            <span class="ml-4">W = Going Twice</span>
            <span class="ml-4">S = Sold</span>
          </div>

          <!-- Bid Entry Form -->
          <div class="bg-gray-800 rounded-lg p-6">
            <!-- Student Selector -->
            <div class="mb-4">
              <label class="block text-sm text-gray-400 mb-2">Student (Press 1-9 or select)</label>
              <select
                v-model="selectedStudentId"
                @change="moderatorStore.selectStudentForBid(selectedStudentId)"
                class="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student</option>
                <option v-for="student in studentsArray" :key="student.id" :value="student.id">
                  #{{ student.paddleNumber }} - {{ student.name }} (${{ student.cashAvailable.toLocaleString() }})
                </option>
              </select>
              <div v-if="selectedStudent" class="mt-2 text-green-400">
                Selected: {{ selectedStudent.name }} (Paddle #{{ selectedStudent.paddleNumber }})
              </div>
            </div>

            <!-- Bid Amount -->
            <div class="mb-4">
              <label class="block text-sm text-gray-400 mb-2">Bid Amount</label>
              <div class="flex gap-2">
                <input
                  v-model.number="bidAmount"
                  @input="moderatorStore.setQuickBidAmount(bidAmount)"
                  type="number"
                  :min="currentMinBid"
                  :step="1000"
                  placeholder="Enter bid amount"
                  class="flex-1 px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <button 
                  @click="recordBid"
                  :disabled="!selectedStudentId || !bidAmount || bidAmount < currentMinBid"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Record Bid (Enter)
                </button>
              </div>
              
              <!-- Quick Increment Buttons -->
              <div class="mt-2 flex gap-2">
                <button 
                  v-for="increment in [1000, 5000, 10000, 25000]"
                  :key="increment"
                  @click="bidAmount = currentMinBid + increment; moderatorStore.setQuickBidAmount(bidAmount)"
                  class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  +${{ (increment/1000) }}k
                </button>
              </div>
            </div>

            <!-- Auction Control Buttons -->
            <div class="grid grid-cols-3 gap-2">
              <button 
                @click="moderatorStore.goingOnce()"
                class="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded font-bold"
              >
                Going Once (G)
              </button>
              <button 
                @click="moderatorStore.goingTwice()"
                class="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded font-bold"
              >
                Going Twice (W)
              </button>
              <button 
                @click="moderatorStore.sold()"
                :disabled="!topBid"
                class="px-4 py-3 bg-green-600 hover:bg-green-700 rounded font-bold disabled:bg-gray-600"
              >
                SOLD! (S)
              </button>
            </div>
            
            <!-- Verification Panel -->
            <div v-if="moderatorStore.pendingVerification && topBid" class="mt-4 p-4 bg-yellow-900 rounded">
              <p class="text-yellow-200 font-semibold mb-2">⚠️ Verify Sale</p>
              <div class="flex justify-between items-center">
                <div>
                  <p>Winner: {{ topBid.studentName }} (#{{ topBid.paddleNumber }})</p>
                  <p class="text-2xl font-bold">${{ topBid.amount.toLocaleString() }}</p>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="moderatorStore.sold()"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                  >
                    Confirm Sale
                  </button>
                  <button 
                    @click="moderatorStore.cancelSale()"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Property Bids -->
          <div v-if="currentPropertyBids.length > 0" class="mt-4 bg-gray-800 rounded-lg p-4">
            <h3 class="font-semibold mb-3">Bid History</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="(bid, index) in currentPropertyBids"
                :key="bid.id"
                :class="[
                  'flex justify-between items-center p-2 rounded',
                  index === 0 ? 'bg-green-900 text-green-200' : 'bg-gray-700'
                ]"
              >
                <span>{{ bid.studentName }} (#{{ bid.paddleNumber }})</span>
                <span class="font-mono font-bold">${{ bid.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Students Grid -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Students ({{ studentsArray.length }})</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="student in studentsArray" 
              :key="student.id"
              :class="[
                'bg-gray-800 p-4 rounded-lg border-2 transition',
                selectedStudentId === student.id ? 'border-blue-500' : 'border-transparent'
              ]"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-semibold text-lg">
                    #{{ student.paddleNumber }} {{ student.name }}
                  </p>
                  <p class="text-sm text-gray-400">
                    Credits: {{ student.researchCredits }}/30
                  </p>
                </div>
                <button 
                  v-if="session.currentPhase === 'BIDDING'"
                  @click="selectStudent(student.id)"
                  class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                >
                  Select
                </button>
              </div>
              
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Cash Available:</span>
                  <span class="font-mono">${{ student.cashAvailable.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Cash Withdrawn:</span>
                  <span class="font-mono">${{ student.cashWithdrawn.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Properties Won:</span>
                  <span>{{ student.propertiesWon.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Total Spent:</span>
                  <span class="font-mono">${{ student.totalSpent.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Session Info & Settings -->
      <div class="w-1/4 border-l border-gray-700 p-6">
        <!-- Session Info -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">Session Info</h3>
          <div class="space-y-2 text-sm">
            <div>
              <span class="text-gray-400">Code:</span>
              <span class="ml-2 font-mono text-xl">{{ sessionCode }}</span>
            </div>
            <div>
              <span class="text-gray-400">Properties:</span>
              <span class="ml-2">{{ session.properties.length }}</span>
            </div>
            <div>
              <span class="text-gray-400">Students:</span>
              <span class="ml-2">{{ studentsArray.length }}</span>
            </div>
            <div>
              <span class="text-gray-400">Properties Sold:</span>
              <span class="ml-2">{{ session.winners.length }}</span>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">Settings</h3>
          <div class="space-y-3">
            <label class="flex items-center justify-between">
              <span class="text-sm">Show Timer</span>
              <button 
                @click="moderatorStore.toggleTimer()"
                :class="[
                  'w-12 h-6 rounded-full transition',
                  moderatorStore.showTimer ? 'bg-green-600' : 'bg-gray-600'
                ]"
              >
                <div :class="[
                  'w-5 h-5 bg-white rounded-full transition transform',
                  moderatorStore.showTimer ? 'translate-x-6' : 'translate-x-0.5'
                ]"></div>
              </button>
            </label>
            
            <label class="flex items-center justify-between">
              <span class="text-sm">Auto-Advance</span>
              <button 
                @click="moderatorStore.toggleAutoAdvance()"
                :class="[
                  'w-12 h-6 rounded-full transition',
                  moderatorStore.autoAdvanceProperties ? 'bg-green-600' : 'bg-gray-600'
                ]"
              >
                <div :class="[
                  'w-5 h-5 bg-white rounded-full transition transform',
                  moderatorStore.autoAdvanceProperties ? 'translate-x-6' : 'translate-x-0.5'
                ]"></div>
              </button>
            </label>
          </div>
        </div>

        <!-- Properties Sold Summary -->
        <div v-if="session.winners.length > 0">
          <h3 class="text-lg font-semibold mb-3">Recent Sales</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div 
              v-for="winner in recentWinners" 
              :key="winner.propertyId"
              class="bg-gray-800 p-2 rounded text-sm"
            >
              <p class="font-medium">{{ getPropertyById(winner.propertyId)?.address }}</p>
              <p class="text-gray-400">
                {{ getStudentById(winner.studentId)?.name }} - 
                ${{ winner.winningBid.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useModeratorStore } from '~/stores/moderatorStore'

const props = defineProps({
  sessionCode: {
    type: String,
    required: true
  }
})

const gameStore = useGameStore()
const moderatorStore = useModeratorStore()

// Reactive references
const selectedStudentId = ref('')
const bidAmount = ref(0)

// Computed properties
const session = computed(() => gameStore.session)
const studentsArray = computed(() => gameStore.studentsArray)
const phaseTimeRemaining = computed(() => gameStore.phaseTimeRemaining)
const currentProperty = computed(() => moderatorStore.currentProperty)
const currentPropertyBids = computed(() => moderatorStore.currentPropertyBids)
const topBid = computed(() => moderatorStore.topBid)
const selectedStudent = computed(() => {
  if (!selectedStudentId.value) return null
  return studentsArray.value.find(s => s.id === selectedStudentId.value)
})
const currentMinBid = computed(() => {
  if (topBid.value) {
    return topBid.value.amount + 1000
  }
  return currentProperty.value?.openingBid || 0
})
const recentWinners = computed(() => {
  return session.value.winners.slice(-5).reverse()
})

const availablePhases = ['LOBBY', 'PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']

// Methods
function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function transitionToPhase(phase) {
  moderatorStore.transitionToPhase(phase)
}

function triggerMarketEvent(type) {
  const message = moderatorStore.triggerMarketEvent(type)
  if (message) {
    console.log('Market Event:', message)
  }
}

function selectStudent(studentId) {
  selectedStudentId.value = studentId
  moderatorStore.selectStudentForBid(studentId)
  
  // Set default bid amount
  bidAmount.value = currentMinBid.value
  moderatorStore.setQuickBidAmount(bidAmount.value)
}

function recordBid() {
  if (moderatorStore.recordQuickBid()) {
    // Auto-increment for next bid
    bidAmount.value = moderatorStore.quickBidAmount
  }
}

function getPropertyById(propertyId) {
  return session.value.properties.find(p => p.id === propertyId)
}

function getStudentById(studentId) {
  return session.value.students.get(studentId)
}

// Watch for property changes to update bid amount
watch(currentProperty, () => {
  bidAmount.value = currentMinBid.value
  moderatorStore.setQuickBidAmount(bidAmount.value)
})

// Helper functions
function formatPhaseName(phase) {
  const names = {
    LOBBY: 'Lobby',
    PREVIEW: 'Preview',
    ANNOUNCEMENT: 'Opening Bids',
    BANKING: 'Banking',
    BIDDING: 'Bidding',
    REDEMPTION: 'Redemption',
    COMPLETE: 'Complete'
  }
  return names[phase] || phase
}

function copyPhaseCode(phase) {
  const code = gameStore.getPhaseCode(phase)
  navigator.clipboard.writeText(code).then(() => {
    alert(`Phase code "${code}" copied to clipboard!`)
  })
}

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
.moderator-console {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>