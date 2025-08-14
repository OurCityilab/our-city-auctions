<!-- Enhanced Moderator Console with Safeguard System -->
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
            Participants: {{ totalParticipants }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="showManualOverride = !showManualOverride"
            :class="[
              'px-4 py-2 rounded transition',
              showManualOverride ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'
            ]"
          >
            <span class="mr-2">🔧</span>
            Manual Controls {{ showManualOverride ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Safeguard Controls (Collapsible) -->
    <div v-if="showManualOverride" class="bg-yellow-900 border-b-2 border-yellow-700 p-4">
      <h3 class="font-semibold mb-3 text-yellow-100 flex items-center">
        🛡️ Safeguard & Manual Override Controls
      </h3>
      
      <div class="grid grid-cols-3 gap-4">
        <!-- Add Team/Company -->
        <div class="bg-yellow-800 rounded p-3">
          <label class="block text-sm font-medium mb-2">Add Team or Company</label>
          <div class="flex gap-2">
            <input
              v-model="newTeamName"
              type="text"
              placeholder="e.g., 'Detroit REI Group'"
              class="flex-1 px-2 py-1 bg-gray-800 text-white rounded"
              @keyup.enter="addTeam"
            />
            <button
              @click="addTeam"
              class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add
            </button>
          </div>
          <p class="text-xs text-yellow-300 mt-1">For groups working together</p>
        </div>

        <!-- Manual Bid Entry -->
        <div class="bg-yellow-800 rounded p-3">
          <label class="block text-sm font-medium mb-2">Manual Bid Entry</label>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="manualBidStudent"
              type="text"
              placeholder="Name/Paddle#"
              class="px-2 py-1 bg-gray-800 text-white rounded"
            />
            <input
              v-model.number="manualBidAmount"
              type="number"
              placeholder="Amount"
              class="px-2 py-1 bg-gray-800 text-white rounded"
            />
          </div>
          <button
            @click="recordManualBid"
            :disabled="!currentProperty"
            class="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
          >
            Record Bid
          </button>
        </div>

        <!-- Quick Fixes -->
        <div class="bg-yellow-800 rounded p-3">
          <label class="block text-sm font-medium mb-2">Quick Fixes</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="resetCredits"
              class="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
            >
              Reset Credits
            </button>
            <button
              @click="adjustCash"
              class="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
            >
              Adjust Cash
            </button>
            <button
              @click="overrideSale"
              class="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
            >
              Override Sale
            </button>
            <button
              @click="clearAllBids"
              class="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-500"
            >
              Clear Bids
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex h-[calc(100vh-140px)]">
      <!-- Left Panel: Phase Control -->
      <div class="w-1/3 border-r border-gray-700 p-6 overflow-y-auto">
        <!-- Phase Control -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Phase Control</h2>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="phase in phases"
              :key="phase"
              @click="transitionToPhase(phase)"
              :class="[
                'px-4 py-3 rounded font-medium transition',
                session.currentPhase === phase 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              ]"
            >
              {{ phase }}
            </button>
          </div>
        </div>

        <!-- Phase Access Codes -->
        <div class="mb-6 bg-blue-900 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">Phase Access Codes</h3>
          <div class="space-y-2 font-mono">
            <div v-for="phase in ['PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION']" 
                 :key="phase" 
                 class="flex justify-between">
              <span class="text-sm">{{ phase }}:</span>
              <code class="bg-black px-2 py-1 rounded text-green-400">
                {{ getPhaseCode(phase) }}
              </code>
            </div>
          </div>
        </div>

        <!-- Property Sequence Control (Bidding Phase) -->
        <div v-if="session.currentPhase === 'BIDDING'" class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">
            Property #{{ currentPropertyIndex + 1 }} of {{ session.properties.length }}
          </h3>
          
          <div v-if="currentProperty">
            <p class="text-xl font-bold">{{ currentProperty.address }}</p>
            <p class="text-gray-400">{{ currentProperty.city }}</p>
            <div class="mt-3 p-3 bg-green-900 rounded">
              <p class="text-sm text-green-400">Opening Bid</p>
              <p class="text-2xl font-bold">${{ currentProperty.openingBid?.toLocaleString() }}</p>
            </div>
          </div>

          <!-- Property Navigation -->
          <div class="mt-4 flex gap-2">
            <button 
              @click="previousProperty"
              :disabled="currentPropertyIndex === 0"
              class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              ← Previous
            </button>
            <button 
              @click="nextProperty"
              :disabled="currentPropertyIndex >= session.properties.length - 1"
              class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>

          <!-- Auction Controls -->
          <div class="mt-4 grid grid-cols-3 gap-2">
            <button class="py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-bold">
              🔨 Once
            </button>
            <button class="py-2 bg-orange-600 hover:bg-orange-700 rounded font-bold">
              🔨🔨 Twice
            </button>
            <button 
              @click="markSold"
              class="py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              🎉 SOLD
            </button>
          </div>
        </div>
      </div>

      <!-- Middle Panel: Participant List -->
      <div class="flex-1 border-r border-gray-700 p-6 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Participants</h2>
          <button
            @click="showAddParticipant = !showAddParticipant"
            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add
          </button>
        </div>

        <!-- Add Participant Form -->
        <div v-if="showAddParticipant" class="mb-4 p-3 bg-gray-800 rounded">
          <input
            v-model="newParticipantName"
            type="text"
            placeholder="Enter name..."
            class="w-full px-3 py-2 bg-gray-700 text-white rounded"
            @keyup.enter="addParticipant"
          />
          <div class="mt-2 flex gap-2">
            <button
              @click="addParticipant"
              class="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add as Student
            </button>
            <button
              @click="addParticipant(true)"
              class="flex-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add as Team
            </button>
          </div>
        </div>

        <!-- Participant List -->
        <div class="space-y-2">
          <!-- Students -->
          <div v-for="student in studentsArray" 
               :key="student.id"
               class="p-3 bg-gray-800 rounded flex justify-between items-center">
            <div>
              <p class="font-medium">
                <span class="text-blue-400">#{{ student.paddleNumber }}</span>
                {{ student.name }}
              </p>
              <p class="text-sm text-gray-400">
                Credits: {{ student.researchCredits }}/30 | 
                Cash: ${{ student.cashAvailable?.toLocaleString() }}
              </p>
            </div>
            <button
              @click="removeParticipant(student.id)"
              class="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>

          <!-- Teams -->
          <div v-for="team in teamsArray" 
               :key="team.id"
               class="p-3 bg-purple-900 rounded flex justify-between items-center">
            <div>
              <p class="font-medium">
                <span class="text-purple-400">🏢</span>
                {{ team.name }}
              </p>
              <p class="text-sm text-gray-400">
                Cash: ${{ team.cashAvailable?.toLocaleString() }}
              </p>
            </div>
            <button
              @click="removeParticipant(team.id)"
              class="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Current Bids -->
      <div class="w-1/3 p-6 overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Current Property Bids</h2>
        
        <div v-if="session.currentPhase === 'BIDDING' && currentProperty">
          <!-- Manual Bid List -->
          <div class="space-y-2">
            <div v-for="bid in currentPropertyBids" 
                 :key="bid.id"
                 class="p-3 bg-gray-800 rounded flex justify-between">
              <span>{{ bid.studentName }}</span>
              <span class="font-mono font-bold">${{ bid.amount.toLocaleString() }}</span>
            </div>
          </div>

          <!-- No bids yet -->
          <div v-if="currentPropertyBids.length === 0" class="text-center py-8 text-gray-500">
            No bids recorded yet
          </div>

          <!-- Highest Bid -->
          <div v-if="highestBid" class="mt-4 p-4 bg-green-900 rounded">
            <p class="text-sm text-green-400">Highest Bid</p>
            <p class="text-2xl font-bold">${{ highestBid.amount.toLocaleString() }}</p>
            <p class="text-sm">{{ highestBid.studentName }}</p>
          </div>
        </div>

        <!-- Session Stats -->
        <div class="mt-6 p-4 bg-gray-800 rounded">
          <h3 class="font-semibold mb-3">Session Statistics</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Properties Sold:</span>
              <span>{{ propertiesSold }} / {{ session.properties.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Total Sales:</span>
              <span>${{ totalSales.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Active Participants:</span>
              <span>{{ activeParticipants }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useModeratorStore } from '~/stores/moderatorStore'

const props = defineProps({
  sessionCode: String
})

const gameStore = useGameStore()
const moderatorStore = useModeratorStore()

// State
const showManualOverride = ref(false)
const showAddParticipant = ref(false)
const newTeamName = ref('')
const newParticipantName = ref('')
const manualBidStudent = ref('')
const manualBidAmount = ref(null)
const currentPropertyIndex = ref(0)
const manualBids = ref(new Map())
const teams = ref(new Map())

// Computed
const session = computed(() => gameStore.session)
const studentsArray = computed(() => Array.from(session.value?.students?.values() || []))
const teamsArray = computed(() => Array.from(teams.value.values()))
const totalParticipants = computed(() => studentsArray.value.length + teamsArray.value.length)

const currentProperty = computed(() => {
  if (!session.value || session.value.currentPhase !== 'BIDDING') return null
  return session.value.properties[currentPropertyIndex.value]
})

const currentPropertyBids = computed(() => {
  if (!currentProperty.value) return []
  
  const bids = []
  manualBids.value.forEach((bidList, propId) => {
    if (propId === currentProperty.value.id) {
      bids.push(...bidList)
    }
  })
  
  return bids.sort((a, b) => b.amount - a.amount)
})

const highestBid = computed(() => currentPropertyBids.value[0] || null)

const propertiesSold = computed(() => {
  let count = 0
  manualBids.value.forEach(bidList => {
    if (bidList.length > 0) count++
  })
  return count
})

const totalSales = computed(() => {
  let total = 0
  manualBids.value.forEach(bidList => {
    if (bidList.length > 0) {
      total += Math.max(...bidList.map(b => b.amount))
    }
  })
  return total
})

const activeParticipants = computed(() => {
  const active = new Set()
  manualBids.value.forEach(bidList => {
    bidList.forEach(bid => {
      active.add(bid.studentName)
    })
  })
  return active.size
})

// Phase data
const phases = ['LOBBY', 'PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']

// Methods
function addTeam() {
  if (!newTeamName.value) return
  
  const teamId = `team_${Date.now()}`
  teams.value.set(teamId, {
    id: teamId,
    name: newTeamName.value,
    isTeam: true,
    cashAvailable: 500000,
    propertiesWon: []
  })
  
  newTeamName.value = ''
  teams.value = new Map(teams.value) // Trigger reactivity
}

function addParticipant(isTeam = false) {
  if (!newParticipantName.value) return
  
  if (isTeam) {
    const teamId = `team_${Date.now()}`
    teams.value.set(teamId, {
      id: teamId,
      name: newParticipantName.value,
      isTeam: true,
      cashAvailable: 500000,
      propertiesWon: []
    })
    teams.value = new Map(teams.value)
  } else {
    // Add as regular student
    gameStore.addManualStudent(newParticipantName.value)
  }
  
  newParticipantName.value = ''
  showAddParticipant.value = false
}

function removeParticipant(id) {
  if (teams.value.has(id)) {
    teams.value.delete(id)
    teams.value = new Map(teams.value)
  } else {
    gameStore.removeStudent(id)
  }
}

function recordManualBid() {
  if (!currentProperty.value || !manualBidStudent.value || !manualBidAmount.value) return
  
  const propId = currentProperty.value.id
  if (!manualBids.value.has(propId)) {
    manualBids.value.set(propId, [])
  }
  
  manualBids.value.get(propId).push({
    id: Date.now(),
    studentName: manualBidStudent.value,
    amount: manualBidAmount.value,
    timestamp: Date.now()
  })
  
  manualBids.value = new Map(manualBids.value)
  manualBidStudent.value = ''
  manualBidAmount.value = null
}

function transitionToPhase(phase) {
  gameStore.transitionToPhase(phase)
}

function getPhaseCode(phase) {
  return gameStore.getPhaseCode(phase)
}

function previousProperty() {
  if (currentPropertyIndex.value > 0) {
    currentPropertyIndex.value--
  }
}

function nextProperty() {
  if (currentPropertyIndex.value < session.value.properties.length - 1) {
    currentPropertyIndex.value++
  }
}

function markSold() {
  if (highestBid.value) {
    alert(`SOLD to ${highestBid.value.studentName} for $${highestBid.value.amount.toLocaleString()}!`)
    nextProperty()
  }
}

function resetCredits() {
  const id = prompt('Enter participant name or paddle #:')
  if (id) {
    alert(`Credits reset to 30 for ${id}`)
  }
}

function adjustCash() {
  const id = prompt('Enter participant name or paddle #:')
  const amount = prompt('Amount to add:')
  if (id && amount) {
    alert(`Added $${amount} to ${id}`)
  }
}

function overrideSale() {
  const winner = prompt('Winner name or paddle #:')
  const amount = prompt('Sale amount:')
  if (winner && amount) {
    recordManualBid()
    alert(`Sale recorded: ${winner} for $${amount}`)
  }
}

function clearAllBids() {
  if (confirm('Clear all bids for current property?')) {
    if (currentProperty.value) {
      manualBids.value.set(currentProperty.value.id, [])
      manualBids.value = new Map(manualBids.value)
    }
  }
}

onMounted(() => {
  // Initialize moderator store
  moderatorStore.initializeModerator()
})
</script>

<style scoped>
.moderator-console {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
</style>