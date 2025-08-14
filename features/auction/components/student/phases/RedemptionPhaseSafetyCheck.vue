<template>
  <div class="redemption-phase">
    <!-- Phase Header -->
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold text-purple-900">Redemption Period - Confirm Your Wins</h2>
      <p class="text-purple-700">
        First, verify the properties you won and confirm the amounts. Then negotiate with occupants.
      </p>
      <div class="mt-2 flex items-center gap-4">
        <span class="font-semibold">Time Remaining: {{ formatTime(timeRemaining) }}</span>
      </div>
    </div>

    <!-- Safety Check Mode -->
    <div v-if="!confirmedProperties" class="space-y-6">
      <div class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h3 class="font-semibold text-yellow-900 mb-3 flex items-center">
          ⚠️ Verify Your Properties
        </h3>
        <p class="text-sm text-yellow-800 mb-4">
          Please confirm the properties you won and the amounts you paid.
          You can edit these if there were any mistakes during the bidding phase.
        </p>
        
        <!-- Property Verification List -->
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div v-for="property in allProperties" 
               :key="property.id" 
               class="flex items-center gap-4 p-3 bg-white rounded border">
            
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="isPropertyWon(property.id)"
              @change="togglePropertyWon(property.id, $event.target.checked)"
              class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            
            <!-- Property Info -->
            <div class="flex-1">
              <p class="font-medium">{{ property.address }}</p>
              <p class="text-sm text-gray-600">
                {{ property.city }}, {{ property.neighborhood }} • 
                Opening bid: ${{ property.openingBid?.toLocaleString() }}
              </p>
            </div>
            
            <!-- Winning Bid Input -->
            <div v-if="isPropertyWon(property.id)" class="w-40">
              <div class="relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  :value="getWinningBid(property.id)"
                  @input="updateWinningBid(property.id, $event.target.value)"
                  type="number"
                  class="w-full pl-7 pr-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  :placeholder="property.openingBid"
                  :min="property.openingBid"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Summary -->
        <div class="mt-4 p-4 bg-purple-50 rounded">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-2xl font-bold text-purple-600">{{ verifiedWins.size }}</p>
              <p class="text-sm text-gray-600">Properties Won</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">
                ${{ totalVerifiedAmount.toLocaleString() }}
              </p>
              <p class="text-sm text-gray-600">Total Invested</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-blue-600">
                ${{ remainingCash.toLocaleString() }}
              </p>
              <p class="text-sm text-gray-600">Cash Remaining</p>
            </div>
          </div>
        </div>
        
        <!-- Confirm Button -->
        <div class="mt-6 flex gap-4">
          <button
            @click="confirmProperties"
            :disabled="verifiedWins.size === 0"
            class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            Confirm Properties & Continue
          </button>
          <button
            @click="loadFromBiddingPhase"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Load from Bidding Phase
          </button>
        </div>
      </div>
    </div>

    <!-- Normal Redemption Flow (after confirmation) -->
    <div v-else class="space-y-6">
      <!-- Back to Edit Button -->
      <button
        @click="confirmedProperties = false"
        class="text-sm text-purple-600 hover:text-purple-700 underline"
      >
        ← Back to edit properties
      </button>

      <!-- No Properties Won -->
      <div v-if="wonProperties.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-semibold text-gray-600">No Properties Won</h3>
        <p class="text-gray-500 mt-2">You didn't win any properties in this auction.</p>
      </div>

      <!-- Properties Won -->
      <div v-else>
        <!-- Summary Stats -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 border">
            <p class="text-sm text-gray-600">Total Invested</p>
            <p class="text-2xl font-bold">${{ totalInvested.toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border">
            <p class="text-sm text-gray-600">Properties Won</p>
            <p class="text-2xl font-bold">{{ wonProperties.length }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border">
            <p class="text-sm text-gray-600">Portfolio Value</p>
            <p class="text-2xl font-bold">${{ portfolioValue.toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border">
            <p class="text-sm text-gray-600">Cash Remaining</p>
            <p class="text-2xl font-bold">${{ cashRemaining.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Property Cards with Negotiation -->
        <div v-for="property in wonProperties" :key="property.id" 
             class="bg-white rounded-lg border p-6">
          
          <!-- Property Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">{{ property.address }}</h3>
              <p class="text-gray-600">{{ property.city }}, {{ property.neighborhood }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Your Winning Bid</p>
              <p class="text-xl font-bold">${{ property.winningBid.toLocaleString() }}</p>
            </div>
          </div>

          <!-- Occupant Negotiation Section -->
          <div v-if="property.occupant" class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-semibold mb-2">Occupant Negotiation</h4>
            <p class="text-sm text-gray-700 mb-3">
              Property is occupied. Choose your negotiation approach:
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in negotiationOptions"
                :key="option.id"
                @click="setNegotiation(property.id, option.id)"
                :class="[
                  'p-2 text-sm rounded transition-all',
                  property.negotiation === option.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white hover:bg-blue-100'
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Exit Strategy -->
          <div class="mt-4 pt-4 border-t">
            <h4 class="font-semibold mb-2">Exit Strategy</h4>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="strategy in exitStrategies"
                :key="strategy.id"
                @click="setStrategy(property.id, strategy.id)"
                :class="[
                  'p-3 rounded text-sm',
                  property.strategy === strategy.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                ]"
              >
                {{ strategy.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'

const gameStore = useGameStore()
const studentStore = useStudentStore()

// State
const confirmedProperties = ref(false)
const verifiedWins = ref(new Map()) // propertyId -> { amount: number }
const timeRemaining = ref(600)
let timer = null

// Get all properties
const allProperties = computed(() => gameStore.session?.properties || [])

// Get properties after confirmation
const wonProperties = computed(() => {
  if (!confirmedProperties.value) return []
  
  return Array.from(verifiedWins.value.entries()).map(([propertyId, data]) => {
    const property = allProperties.value.find(p => p.id === propertyId)
    return {
      ...property,
      winningBid: data.amount,
      negotiation: data.negotiation || null,
      strategy: data.strategy || null
    }
  })
})

// Calculations
const totalVerifiedAmount = computed(() => {
  let total = 0
  verifiedWins.value.forEach(data => {
    total += data.amount || 0
  })
  return total
})

const remainingCash = computed(() => {
  const startingCash = studentStore.currentStudent?.cashAvailable || 500000
  return Math.max(0, startingCash - totalVerifiedAmount.value)
})

const totalInvested = computed(() => totalVerifiedAmount.value)
const cashRemaining = computed(() => remainingCash.value)

const portfolioValue = computed(() => {
  return wonProperties.value.reduce((sum, p) => sum + (p.marketValue || p.estimatedValue || 0), 0)
})

// Options for negotiation and strategy
const negotiationOptions = [
  { id: 'cash_for_keys', label: 'Cash for Keys' },
  { id: 'eviction', label: 'Eviction Process' },
  { id: 'rent_back', label: 'Rent Back Agreement' },
  { id: 'land_contract', label: 'Land Contract' }
]

const exitStrategies = [
  { id: 'flip', label: 'Fix & Flip' },
  { id: 'rental', label: 'Hold as Rental' },
  { id: 'wholesale', label: 'Wholesale' }
]

// Methods
function isPropertyWon(propertyId) {
  return verifiedWins.value.has(propertyId)
}

function togglePropertyWon(propertyId, won) {
  if (won) {
    const property = allProperties.value.find(p => p.id === propertyId)
    verifiedWins.value.set(propertyId, {
      amount: property?.openingBid || 0
    })
  } else {
    verifiedWins.value.delete(propertyId)
  }
  verifiedWins.value = new Map(verifiedWins.value) // Trigger reactivity
}

function getWinningBid(propertyId) {
  return verifiedWins.value.get(propertyId)?.amount || 0
}

function updateWinningBid(propertyId, value) {
  const amount = parseInt(value) || 0
  if (verifiedWins.value.has(propertyId)) {
    const data = verifiedWins.value.get(propertyId)
    data.amount = amount
    verifiedWins.value = new Map(verifiedWins.value) // Trigger reactivity
  }
}

function loadFromBiddingPhase() {
  // Load the manual bids from the bidding phase
  const manualBids = studentStore.manualBids
  
  verifiedWins.value.clear()
  manualBids.forEach((bid, propertyId) => {
    if (bid.won && bid.confirmed) {
      verifiedWins.value.set(propertyId, {
        amount: bid.amount
      })
    }
  })
  
  verifiedWins.value = new Map(verifiedWins.value) // Trigger reactivity
}

function confirmProperties() {
  // Save confirmed properties to store
  verifiedWins.value.forEach((data, propertyId) => {
    studentStore.recordManualWin(propertyId, data.amount)
  })
  
  confirmedProperties.value = true
}

function setNegotiation(propertyId, negotiationType) {
  const data = verifiedWins.value.get(propertyId)
  if (data) {
    data.negotiation = negotiationType
    verifiedWins.value = new Map(verifiedWins.value)
  }
}

function setStrategy(propertyId, strategyType) {
  const data = verifiedWins.value.get(propertyId)
  if (data) {
    data.strategy = strategyType
    verifiedWins.value = new Map(verifiedWins.value)
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Timer
onMounted(() => {
  // Try to load from bidding phase automatically
  loadFromBiddingPhase()
  
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.redemption-phase {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>