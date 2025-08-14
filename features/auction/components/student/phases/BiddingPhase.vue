<template>
  <div class="bidding-phase">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-red-900 mb-2">Live Auction - Manual Entry</h3>
      <p class="text-sm text-red-700">Record whether you won or lost each property, and the winning bid amount.</p>
    </div>
    
    <!-- Current Property in Sequence -->
    <div v-if="currentProperty" class="bg-white rounded-lg shadow-lg p-6">
      <div class="mb-6 p-4 bg-blue-50 rounded">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg">
              Property #{{ currentPropertyIndex + 1 }} of {{ allProperties.length }}
            </h3>
            <p class="text-xl font-semibold mt-1">{{ currentProperty.address }}</p>
            <p class="text-gray-600">{{ currentProperty.city }}, {{ currentProperty.neighborhood }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Opening Bid</p>
            <p class="text-2xl font-bold text-green-600">
              ${{ currentProperty.openingBid?.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Manual Bid Entry -->
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="markAsWon"
            :class="[
              'py-4 rounded-lg font-bold text-lg transition-all',
              currentBid?.won 
                ? 'bg-green-600 text-white ring-2 ring-green-400' 
                : 'bg-gray-100 hover:bg-green-100 text-gray-700'
            ]"
          >
            ✓ I WON This Property
          </button>
          
          <button
            @click="markAsLost"
            :class="[
              'py-4 rounded-lg font-bold text-lg transition-all',
              currentBid?.won === false
                ? 'bg-red-600 text-white ring-2 ring-red-400'
                : 'bg-gray-100 hover:bg-red-100 text-gray-700'
            ]"
          >
            ✗ I LOST This Property
          </button>
        </div>

        <!-- If won, enter amount -->
        <div v-if="currentBid?.won" class="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded">
          <label class="block mb-2 font-semibold text-green-900">
            Enter Your Winning Bid Amount:
          </label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                v-model.number="bidAmount"
                type="number"
                class="w-full pl-8 pr-4 py-3 border-2 border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter amount..."
                :min="currentProperty.openingBid"
              />
            </div>
            <button
              @click="confirmAndNext"
              :disabled="!bidAmount || bidAmount < currentProperty.openingBid"
              class="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              Confirm & Next →
            </button>
          </div>
          <p v-if="bidAmount && bidAmount < currentProperty.openingBid" class="text-sm text-red-600 mt-2">
            Bid must be at least the opening bid amount
          </p>
        </div>

        <!-- Quick Lost confirmation -->
        <div v-if="currentBid?.won === false" class="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded">
          <p class="text-red-900 font-medium mb-3">Property marked as lost.</p>
          <button
            @click="confirmAndNext"
            class="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold w-full"
          >
            Continue to Next Property →
          </button>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="flex gap-2 mt-6 pt-4 border-t">
        <button
          @click="previousProperty"
          :disabled="currentPropertyIndex === 0"
          class="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600"
        >
          ← Previous
        </button>
        <div class="flex-1 text-center py-2 text-gray-600">
          Use the buttons above to record your result
        </div>
        <button
          @click="skipProperty"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Skip for Now →
        </button>
      </div>
    </div>

    <!-- Progress indicator -->
    <div class="mt-6 bg-white rounded-lg shadow p-4">
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>Auction Progress</span>
        <span class="font-semibold">{{ recordedCount }} / {{ allProperties.length }} Recorded</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div 
          class="bg-blue-600 h-3 rounded-full transition-all duration-300"
          :style="{width: `${(recordedCount / allProperties.length) * 100}%`}"
        />
      </div>
      
      <!-- Quick summary -->
      <div class="grid grid-cols-3 gap-4 mt-4 text-center">
        <div>
          <p class="text-2xl font-bold text-green-600">{{ wonCount }}</p>
          <p class="text-sm text-gray-600">Won</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-red-600">{{ lostCount }}</p>
          <p class="text-sm text-gray-600">Lost</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-600">{{ skippedCount }}</p>
          <p class="text-sm text-gray-600">Pending</p>
        </div>
      </div>
    </div>

    <!-- Quick Review Section -->
    <div v-if="manualBids.size > 0" class="mt-6 bg-white rounded-lg shadow p-4">
      <h4 class="font-semibold mb-3">Your Recorded Bids:</h4>
      <div class="max-h-48 overflow-y-auto space-y-2">
        <div 
          v-for="[propId, bid] in Array.from(manualBids.entries()).filter(([, b]) => b.confirmed)"
          :key="propId"
          class="flex justify-between items-center p-2 rounded"
          :class="bid.won ? 'bg-green-50' : 'bg-red-50'"
        >
          <span class="text-sm">
            {{ getPropertyById(propId)?.address }}
          </span>
          <span class="font-mono text-sm font-semibold">
            {{ bid.won ? `Won: $${bid.amount?.toLocaleString()}` : 'Lost' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'

const gameStore = useGameStore()
const studentStore = useStudentStore()

// State for manual bid tracking
const currentPropertyIndex = ref(0)
const manualBids = ref(new Map())
const bidAmount = ref(null)

// Computed properties
const allProperties = computed(() => gameStore.session?.properties || [])
const currentProperty = computed(() => allProperties.value[currentPropertyIndex.value])
const currentBid = computed(() => manualBids.value.get(currentProperty.value?.id))

// Statistics
const recordedCount = computed(() => {
  return Array.from(manualBids.value.values()).filter(b => b.confirmed).length
})
const wonCount = computed(() => {
  return Array.from(manualBids.value.values()).filter(b => b.won && b.confirmed).length
})
const lostCount = computed(() => {
  return Array.from(manualBids.value.values()).filter(b => b.won === false && b.confirmed).length
})
const skippedCount = computed(() => allProperties.value.length - recordedCount.value)

// Helper function
function getPropertyById(id) {
  return allProperties.value.find(p => p.id === id)
}

// Actions
function markAsWon() {
  if (!currentProperty.value) return
  
  manualBids.value.set(currentProperty.value.id, {
    won: true,
    amount: bidAmount.value || currentProperty.value.openingBid,
    confirmed: false
  })
  manualBids.value = new Map(manualBids.value) // Trigger reactivity
}

function markAsLost() {
  if (!currentProperty.value) return
  
  manualBids.value.set(currentProperty.value.id, {
    won: false,
    amount: 0,
    confirmed: false
  })
  manualBids.value = new Map(manualBids.value) // Trigger reactivity
}

function confirmAndNext() {
  const bid = currentBid.value
  if (!bid) return
  
  if (bid.won && (!bidAmount.value || bidAmount.value < currentProperty.value.openingBid)) {
    alert('Please enter a valid winning bid amount')
    return
  }
  
  // Update the bid with final amount and mark as confirmed
  manualBids.value.set(currentProperty.value.id, {
    ...bid,
    amount: bid.won ? bidAmount.value : 0,
    confirmed: true
  })
  manualBids.value = new Map(manualBids.value)
  
  // Save to store
  if (bid.won) {
    studentStore.recordManualWin(currentProperty.value.id, bidAmount.value)
  } else {
    studentStore.recordManualLoss(currentProperty.value.id)
  }
  
  // Move to next property
  nextProperty()
}

function nextProperty() {
  if (currentPropertyIndex.value < allProperties.value.length - 1) {
    currentPropertyIndex.value++
    bidAmount.value = null
  } else {
    alert('You have reached the last property!')
  }
}

function previousProperty() {
  if (currentPropertyIndex.value > 0) {
    currentPropertyIndex.value--
    const prevBid = manualBids.value.get(allProperties.value[currentPropertyIndex.value]?.id)
    bidAmount.value = prevBid?.amount || null
  }
}

function skipProperty() {
  nextProperty()
}

// Watch for property changes to load existing bid amount
watch(currentProperty, (newProp) => {
  if (newProp) {
    const existingBid = manualBids.value.get(newProp.id)
    bidAmount.value = existingBid?.amount || null
  }
})

// Initialize with persisted data if available
onMounted(() => {
  const savedBids = studentStore.manualBids
  if (savedBids) {
    manualBids.value = new Map(savedBids)
  }
})
</script>