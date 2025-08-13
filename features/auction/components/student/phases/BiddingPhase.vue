<template>
  <div class="bidding-phase">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-red-900 mb-2">Live Bidding Phase</h3>
      <p class="text-sm text-red-700">Properties are being auctioned. Place your bids carefully!</p>
    </div>
    
    <div v-if="currentProperty" class="bg-white rounded-lg shadow p-6">
      <div class="mb-4">
        <h4 class="text-xl font-bold">{{ currentProperty.address }}</h4>
        <p class="text-gray-600">{{ currentProperty.city }}, {{ currentProperty.neighborhood }}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-sm text-gray-600">Opening Bid</p>
          <p class="text-xl font-bold">${{ currentProperty.openingBid?.toLocaleString() || '0' }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Current High Bid</p>
          <p class="text-xl font-bold text-green-600">${{ highestBid?.toLocaleString() || currentProperty.openingBid?.toLocaleString() || '0' }}</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Your Bid</label>
          <input 
            v-model.number="bidAmount"
            type="number"
            :min="minBid"
            step="1000"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        
        <button 
          @click="placeBid"
          :disabled="!canBid"
          class="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
        >
          Place Bid
        </button>
        
        <p class="text-sm text-gray-600">
          Your Cash: ${{ currentStudent?.cashAvailable?.toLocaleString() || '0' }}
        </p>
      </div>
    </div>
    
    <div v-else class="text-center py-12 text-gray-500">
      Waiting for next property...
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'
import { useModeratorStore } from '~/stores/moderatorStore'

const gameStore = useGameStore()
const studentStore = useStudentStore()
const moderatorStore = useModeratorStore()

const bidAmount = ref(0)

const currentStudent = computed(() => studentStore.currentStudent)
const currentProperty = computed(() => moderatorStore.currentProperty)
const currentBids = computed(() => {
  if (!currentProperty.value) return []
  return gameStore.getPropertyBids(currentProperty.value.id)
})
const highestBid = computed(() => {
  const bids = currentBids.value
  return bids.length > 0 ? bids[0].amount : null
})
const minBid = computed(() => {
  if (highestBid.value) return highestBid.value + 1000
  return currentProperty.value?.openingBid || 0
})
const canBid = computed(() => {
  return bidAmount.value >= minBid.value && 
         bidAmount.value <= (currentStudent.value?.cashAvailable || 0)
})

function placeBid() {
  if (studentStore.placeBid(currentProperty.value.id, bidAmount.value)) {
    alert('Bid placed successfully!')
    bidAmount.value = minBid.value
  } else {
    alert('Failed to place bid. Please check your available cash.')
  }
}
</script>