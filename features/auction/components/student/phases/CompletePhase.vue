<template>
  <div class="complete-phase">
    <div class="py-6">
      <h2 class="text-3xl font-bold mb-4 text-center">Auction Complete!</h2>
      <p class="text-gray-600 mb-8 text-center">Enter your final results to calculate your portfolio performance.</p>
      
      <!-- Self-Scoring Interface -->
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Properties Won Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-bold text-xl mb-4">Properties Won</h3>
          <p class="text-sm text-gray-600 mb-4">Mark which properties you won and enter the final bid amounts</p>
          
          <div class="space-y-3">
            <div 
              v-for="property in allProperties" 
              :key="property.id"
              class="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    :id="`won-${property.id}`"
                    v-model="wonPropertyIds"
                    :value="property.id"
                    class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label :for="`won-${property.id}`" class="cursor-pointer">
                    <div>
                      <p class="font-medium">{{ property.address }}</p>
                      <p class="text-sm text-gray-600">{{ property.city }}, {{ property.neighborhood }}</p>
                      <p class="text-xs text-gray-500">Opening bid: ${{ property.openingBid?.toLocaleString() || 'N/A' }}</p>
                    </div>
                  </label>
                </div>
                
                <div v-if="wonPropertyIds.includes(property.id)" class="flex items-center gap-2">
                  <label class="text-sm font-medium">Winning bid:</label>
                  <input
                    v-model.number="winningBids[property.id]"
                    type="number"
                    step="1000"
                    placeholder="Amount..."
                    class="w-32 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Portfolio Summary -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-bold text-xl mb-4">Portfolio Summary</h3>
          
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600">Properties Won</p>
              <p class="text-3xl font-bold text-blue-600">{{ wonPropertyIds.length }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Invested</p>
              <p class="text-3xl font-bold text-green-600">${{ totalInvested.toLocaleString() }}</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-sm text-gray-600">Cash Remaining</p>
              <p class="text-3xl font-bold text-purple-600">${{ cashRemaining.toLocaleString() }}</p>
            </div>
          </div>
          
          <!-- ROI Calculation -->
          <div v-if="wonPropertyIds.length > 0" class="border-t pt-4">
            <h4 class="font-semibold mb-3">Estimated Returns</h4>
            <div class="space-y-2">
              <div v-for="propertyId in wonPropertyIds" :key="`roi-${propertyId}`">
                <div v-if="getProperty(propertyId)" class="flex justify-between items-center">
                  <span class="text-sm">{{ getProperty(propertyId).address }}</span>
                  <div class="text-sm">
                    <span class="text-gray-600">Market Value: </span>
                    <span class="font-medium">${{ getProperty(propertyId).marketValue?.toLocaleString() || 'Unknown' }}</span>
                    <span v-if="winningBids[propertyId]" class="ml-2">
                      <span :class="getRoiClass(propertyId)">
                        ({{ getRoiPercentage(propertyId) }}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Total Portfolio Value:</span>
                <span class="text-xl font-bold">${{ totalPortfolioValue.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="font-semibold">Net Profit/Loss:</span>
                <span :class="netProfit >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xl font-bold">
                  {{ netProfit >= 0 ? '+' : '' }}${{ Math.abs(netProfit).toLocaleString() }}
                </span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="font-semibold">Overall ROI:</span>
                <span :class="overallRoi >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xl font-bold">
                  {{ overallRoi.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Results Button -->
        <button
          @click="saveResults"
          class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Save Final Results
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '~/stores/studentStore'
import { useGameStore } from '~/stores/gameStore'

const studentStore = useStudentStore()
const gameStore = useGameStore()

// State
const wonPropertyIds = ref([])
const winningBids = ref({})

// Computed
const currentStudent = computed(() => studentStore.currentStudent)
const allProperties = computed(() => {
  // Show properties from draft board first, then all others
  const draftBoardIds = studentStore.draftBoard.map(item => item.propertyId)
  const draftProperties = studentStore.draftBoard.map(item => item.property)
  const otherProperties = gameStore.session?.properties.filter(p => !draftBoardIds.includes(p.id)) || []
  return [...draftProperties, ...otherProperties]
})

const totalInvested = computed(() => {
  return wonPropertyIds.value.reduce((sum, propertyId) => {
    return sum + (winningBids.value[propertyId] || 0)
  }, 0)
})

const cashRemaining = computed(() => {
  const initialCash = 100000
  const withdrawn = currentStudent.value?.cashWithdrawn || 0
  const totalCash = initialCash + withdrawn
  return totalCash - totalInvested.value
})

const totalPortfolioValue = computed(() => {
  return wonPropertyIds.value.reduce((sum, propertyId) => {
    const property = getProperty(propertyId)
    return sum + (property?.marketValue || 0)
  }, 0)
})

const netProfit = computed(() => {
  return totalPortfolioValue.value - totalInvested.value
})

const overallRoi = computed(() => {
  if (totalInvested.value === 0) return 0
  return ((totalPortfolioValue.value - totalInvested.value) / totalInvested.value) * 100
})

// Methods
function getProperty(propertyId) {
  return gameStore.session?.properties.find(p => p.id === propertyId)
}

function getRoiPercentage(propertyId) {
  const property = getProperty(propertyId)
  const bid = winningBids.value[propertyId]
  if (!property || !bid || bid === 0) return 'N/A'
  
  const roi = ((property.marketValue - bid) / bid) * 100
  return roi.toFixed(1)
}

function getRoiClass(propertyId) {
  const property = getProperty(propertyId)
  const bid = winningBids.value[propertyId]
  if (!property || !bid) return ''
  
  const roi = ((property.marketValue - bid) / bid) * 100
  if (roi >= 20) return 'text-green-600 font-bold'
  if (roi >= 0) return 'text-green-600'
  return 'text-red-600'
}

function saveResults() {
  // Create portfolio summary
  const portfolio = {
    studentId: currentStudent.value?.id,
    studentName: currentStudent.value?.name,
    timestamp: Date.now(),
    wonProperties: wonPropertyIds.value.map(id => ({
      propertyId: id,
      property: getProperty(id),
      winningBid: winningBids.value[id] || 0
    })),
    totalInvested: totalInvested.value,
    cashRemaining: cashRemaining.value,
    totalPortfolioValue: totalPortfolioValue.value,
    netProfit: netProfit.value,
    overallRoi: overallRoi.value
  }
  
  // Save to localStorage
  const key = `portfolio_results_${gameStore.session?.code}_${currentStudent.value?.id}`
  localStorage.setItem(key, JSON.stringify(portfolio))
  
  // Also save a simplified version for quick access
  const results = {
    propertyCount: wonPropertyIds.value.length,
    totalInvested: totalInvested.value,
    portfolioValue: totalPortfolioValue.value,
    roi: overallRoi.value
  }
  localStorage.setItem(`quick_results_${currentStudent.value?.id}`, JSON.stringify(results))
  
  alert('Results saved successfully! Your portfolio performance has been recorded.')
}

// Load any existing saved data
onMounted(() => {
  const key = `portfolio_results_${gameStore.session?.code}_${currentStudent.value?.id}`
  const saved = localStorage.getItem(key)
  
  if (saved) {
    const portfolio = JSON.parse(saved)
    wonPropertyIds.value = portfolio.wonProperties.map(wp => wp.propertyId)
    portfolio.wonProperties.forEach(wp => {
      winningBids.value[wp.propertyId] = wp.winningBid
    })
  }
})
</script>