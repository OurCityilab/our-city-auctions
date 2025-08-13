<template>
  <div class="banking-phase max-w-2xl mx-auto">
    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-green-900 mb-2">Banking Phase - Withdraw Cash</h3>
      <p class="text-sm text-green-700">
        Withdraw cash for bidding. Maximum withdrawal: $500,000 total.
        Time remaining: {{ formatTime(phaseTimeRemaining) }}
      </p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="text-center p-4 bg-gray-50 rounded">
          <p class="text-sm text-gray-600 mb-1">Starting Balance</p>
          <p class="text-2xl font-bold">$100,000</p>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded">
          <p class="text-sm text-gray-600 mb-1">Current Cash</p>
          <p class="text-2xl font-bold text-blue-600">${{ currentStudent?.cashAvailable?.toLocaleString() || '0' }}</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Withdraw Amount</label>
          <input 
            v-model.number="withdrawAmount"
            type="number"
            :max="maxWithdrawal"
            step="10000"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div class="flex gap-2">
          <button 
            v-for="amount in [50000, 100000, 200000, 500000]"
            :key="amount"
            @click="withdrawAmount = Math.min(amount, maxWithdrawal)"
            class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            ${{ (amount/1000) }}k
          </button>
        </div>
        
        <button 
          @click="withdraw"
          :disabled="withdrawAmount <= 0 || withdrawAmount > maxWithdrawal"
          class="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
        >
          Withdraw ${{ withdrawAmount.toLocaleString() }}
        </button>
        
        <p class="text-sm text-gray-600">
          Maximum additional withdrawal: ${{ maxWithdrawal.toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'

const gameStore = useGameStore()
const studentStore = useStudentStore()

const withdrawAmount = ref(100000)

const currentStudent = computed(() => studentStore.currentStudent)
const phaseTimeRemaining = computed(() => gameStore.phaseTimeRemaining)
const maxWithdrawal = computed(() => {
  const withdrawn = currentStudent.value?.cashWithdrawn || 0
  return Math.max(0, 500000 - withdrawn)
})

function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function withdraw() {
  if (studentStore.withdrawCash(withdrawAmount.value)) {
    alert(`Successfully withdrew $${withdrawAmount.value.toLocaleString()}`)
    withdrawAmount.value = Math.min(100000, maxWithdrawal.value)
  } else {
    alert('Withdrawal failed. Please try again.')
  }
}
</script>