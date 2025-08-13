<template>
  <div class="bid-tracker bg-white rounded-lg shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2">Bid Tracker</h2>
      <p class="text-gray-600 text-sm">Track bids manually as the moderator announces them</p>
    </div>

    <!-- Current Property Info -->
    <div v-if="currentProperty" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold text-lg">{{ currentProperty.address }}</h3>
      <p class="text-gray-600">{{ currentProperty.city }}, {{ currentProperty.neighborhood }}</p>
      <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span class="text-gray-500">Opening Bid:</span>
          <span class="ml-2 font-semibold">${{ currentProperty.openingBid?.toLocaleString() || 'TBD' }}</span>
        </div>
        <div>
          <span class="text-gray-500">Your Max:</span>
          <span class="ml-2 font-semibold">${{ myMaxBid?.toLocaleString() || 'Not Set' }}</span>
        </div>
      </div>
    </div>

    <!-- My Bid Section -->
    <div class="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
      <h4 class="font-semibold mb-3 text-blue-900">Your Intended Bid</h4>
      <div class="flex gap-2">
        <input
          v-model.number="myBid"
          type="number"
          step="1000"
          placeholder="Enter your bid amount..."
          class="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="recordMyBid"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Record Bid
        </button>
      </div>
      <div v-if="myLastBid" class="mt-2 text-sm text-blue-700">
        Your last bid: ${{ myLastBid.toLocaleString() }}
      </div>
    </div>

    <!-- Auction Tracker -->
    <div class="mb-6 p-4 border rounded-lg">
      <h4 class="font-semibold mb-3">Live Auction Tracker</h4>
      <p class="text-sm text-gray-600 mb-3">Enter bids as the moderator announces them</p>
      
      <div class="grid grid-cols-2 gap-2 mb-3">
        <input
          v-model.number="currentHighBid"
          type="number"
          step="1000"
          placeholder="Current high bid..."
          class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <input
          v-model="currentHighBidder"
          type="text"
          placeholder="Paddle # or name..."
          class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>
      
      <button
        @click="addToHistory"
        :disabled="!currentHighBid || !currentHighBidder"
        class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 transition"
      >
        Add to Bid History
      </button>
    </div>

    <!-- Bid History -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-semibold">Bid History</h4>
        <button
          v-if="bidHistory.length > 0"
          @click="clearHistory"
          class="text-sm text-red-600 hover:text-red-700"
        >
          Clear History
        </button>
      </div>
      
      <div v-if="bidHistory.length === 0" class="text-gray-500 text-center py-4 bg-gray-50 rounded">
        No bids recorded yet
      </div>
      
      <div v-else class="space-y-1 max-h-48 overflow-y-auto">
        <div
          v-for="(entry, index) in bidHistory"
          :key="index"
          :class="[
            'flex justify-between items-center p-2 rounded',
            index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">#{{ bidHistory.length - index }}</span>
            <span class="font-medium">{{ entry.bidder }}</span>
          </div>
          <span class="font-bold">${{ entry.amount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Decision Helper -->
    <div class="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
      <h4 class="font-semibold mb-2">Decision Helper</h4>
      
      <div v-if="!myMaxBid" class="text-gray-600">
        Set your max bid in the analysis to see recommendations
      </div>
      
      <div v-else-if="!currentHighBid || currentHighBid === 0" class="text-gray-600">
        Waiting for first bid...
      </div>
      
      <div v-else-if="currentHighBid < myMaxBid" class="text-green-700">
        <p class="font-semibold flex items-center gap-2">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          Still within your max bid
        </p>
        <p class="text-sm mt-1">
          Room to bid: ${{ (myMaxBid - currentHighBid).toLocaleString() }}
        </p>
      </div>
      
      <div v-else class="text-red-700">
        <p class="font-semibold flex items-center gap-2">
          <Icon name="heroicons:x-circle" class="w-5 h-5" />
          Exceeds your max bid
        </p>
        <p class="text-sm mt-1">
          Over by: ${{ (currentHighBid - myMaxBid).toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- Property Won Checkbox -->
    <div class="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="propertyWon"
          type="checkbox"
          class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <span class="font-semibold">I won this property</span>
      </label>
      
      <div v-if="propertyWon" class="mt-3">
        <label class="block text-sm font-medium mb-1">Final winning bid:</label>
        <input
          v-model.number="winningBid"
          type="number"
          step="1000"
          placeholder="Enter winning bid amount..."
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>

    <!-- Save Button -->
    <button
      @click="saveBidData"
      class="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
    >
      Save Bid Data
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStudentStore } from '~/stores/studentStore'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const studentStore = useStudentStore()

// Current property
const currentProperty = computed(() => props.property)

// My bid tracking
const myBid = ref(0)
const myLastBid = ref(0)
const myMaxBid = ref(null)

// Auction tracking
const currentHighBid = ref(0)
const currentHighBidder = ref('')
const bidHistory = ref([])

// Property won tracking
const propertyWon = ref(false)
const winningBid = ref(0)

// Load max bid from analysis if exists
watch(() => currentProperty.value, (newProperty) => {
  if (newProperty) {
    const analysis = studentStore.propertyAnalyses.get(newProperty.id)
    if (analysis) {
      myMaxBid.value = analysis.maxBid || null
    }
    // Reset tracking for new property
    resetTracking()
  }
}, { immediate: true })

function recordMyBid() {
  if (myBid.value > 0) {
    myLastBid.value = myBid.value
    // Also add to history if it's competitive
    if (myBid.value > currentHighBid.value) {
      addToHistory(true)
    }
  }
}

function addToHistory(isMyBid = false) {
  if (isMyBid && myBid.value > 0) {
    bidHistory.value.unshift({
      amount: myBid.value,
      bidder: 'YOU',
      timestamp: Date.now()
    })
    currentHighBid.value = myBid.value
    currentHighBidder.value = 'YOU'
  } else if (currentHighBid.value > 0 && currentHighBidder.value) {
    bidHistory.value.unshift({
      amount: currentHighBid.value,
      bidder: currentHighBidder.value,
      timestamp: Date.now()
    })
  }
  
  // Clear input fields after adding
  if (!isMyBid) {
    currentHighBidder.value = ''
  }
}

function clearHistory() {
  bidHistory.value = []
  currentHighBid.value = 0
  currentHighBidder.value = ''
}

function resetTracking() {
  myBid.value = 0
  myLastBid.value = 0
  currentHighBid.value = 0
  currentHighBidder.value = ''
  bidHistory.value = []
  propertyWon.value = false
  winningBid.value = 0
}

function saveBidData() {
  const bidData = {
    propertyId: currentProperty.value.id,
    myIntendedBid: myLastBid.value,
    finalHighBid: bidHistory.value[0]?.amount || currentHighBid.value,
    bidHistory: [...bidHistory.value],
    won: propertyWon.value,
    winningBid: propertyWon.value ? winningBid.value : null,
    timestamp: Date.now()
  }
  
  // Save to localStorage
  const existingData = JSON.parse(localStorage.getItem('bidTrackerData') || '{}')
  existingData[currentProperty.value.id] = bidData
  localStorage.setItem('bidTrackerData', JSON.stringify(existingData))
  
  // Show confirmation
  alert('Bid data saved successfully!')
}

// Load existing data if available
onMounted(() => {
  const existingData = JSON.parse(localStorage.getItem('bidTrackerData') || '{}')
  const propertyData = existingData[currentProperty.value?.id]
  
  if (propertyData) {
    myLastBid.value = propertyData.myIntendedBid || 0
    currentHighBid.value = propertyData.finalHighBid || 0
    bidHistory.value = propertyData.bidHistory || []
    propertyWon.value = propertyData.won || false
    winningBid.value = propertyData.winningBid || 0
  }
})
</script>

<style scoped>
.bid-tracker {
  max-width: 600px;
  margin: 0 auto;
}
</style>