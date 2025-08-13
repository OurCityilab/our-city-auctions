<template>
  <div class="redemption-phase">
    <!-- Phase Header -->
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold text-purple-900">Redemption & Settlement Phase</h2>
      <p class="text-purple-700">
        Negotiate with occupants and calculate your investment returns. 
        You have 10 minutes to finalize your exit strategies.
      </p>
      <div class="mt-2 flex items-center gap-4">
        <span class="font-semibold">Time Remaining: {{ formatTime(timeRemaining) }}</span>
        <span class="text-sm">Properties Won: {{ wonProperties.length }}</span>
      </div>
    </div>

    <!-- No Properties Won -->
    <div v-if="wonProperties.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <h3 class="text-xl font-semibold text-gray-600">No Properties Won</h3>
      <p class="text-gray-500 mt-2">You didn't win any properties in this auction.</p>
      <p class="text-sm text-gray-400 mt-4">Better luck next time! Consider adjusting your bidding strategy.</p>
    </div>

    <!-- Properties Won -->
    <div v-else class="space-y-6">
      <!-- Summary Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border">
          <p class="text-sm text-gray-600">Total Invested</p>
          <p class="text-2xl font-bold">${{ totalInvested.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <p class="text-sm text-gray-600">Projected Profit</p>
          <p class="text-2xl font-bold" :class="totalProfit >= 0 ? 'text-green-600' : 'text-red-600'">
            ${{ totalProfit.toLocaleString() }}
          </p>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <p class="text-sm text-gray-600">ROI</p>
          <p class="text-2xl font-bold" :class="overallROI >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ overallROI }}%
          </p>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <p class="text-sm text-gray-600">Cash Remaining</p>
          <p class="text-2xl font-bold">${{ cashRemaining.toLocaleString() }}</p>
        </div>
      </div>

      <!-- Property Cards -->
      <div v-for="(property, index) in wonProperties" :key="property.id" 
           class="bg-white rounded-lg border p-6">
        
        <!-- Property Header -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold">{{ property.address }}</h3>
            <p class="text-gray-600">{{ property.city }}, {{ property.neighborhood }}</p>
            <div class="flex gap-4 mt-2 text-sm">
              <span>{{ property.bedrooms }}BR/{{ property.bathrooms }}BA</span>
              <span>{{ property.squareFeet?.toLocaleString() || 'N/A' }} sqft</span>
              <span>Built {{ property.yearBuilt }}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Your Winning Bid</p>
            <p class="text-xl font-bold">${{ property.winningBid.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">Market Value: ${{ property.marketValue?.toLocaleString() || 'Unknown' }}</p>
          </div>
        </div>

        <!-- Occupant Negotiation -->
        <div v-if="property.occupant" class="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 class="font-semibold mb-2">Occupant Situation</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Status:</strong> {{ property.occupancyStatus?.replace('_', ' ') || 'Unknown' }}</p>
              <p><strong>Name:</strong> {{ property.occupant.name }}</p>
              <p><strong>Occupation:</strong> {{ property.occupant.occupation }}</p>
            </div>
            <div>
              <p><strong>Income:</strong> ${{ property.occupant.monthlyIncome?.toLocaleString() || 0 }}/mo</p>
              <p><strong>Credit Score:</strong> {{ property.occupant.creditScore || 'N/A' }}</p>
              <p><strong>Preference:</strong> {{ property.occupant.preferredOutcome?.replace('_', ' ') || 'Unknown' }}</p>
            </div>
          </div>
          
          <!-- Negotiation Outcome -->
          <div class="mt-3 p-3 bg-white rounded">
            <p class="text-sm font-semibold mb-2">Negotiation Result:</p>
            <div class="flex gap-2 flex-wrap">
              <button 
                v-for="outcome in negotiationOutcomes"
                :key="outcome.id"
                @click="setNegotiationOutcome(property.id, outcome.id)"
                :class="[
                  'px-3 py-1 rounded text-sm',
                  property.negotiationOutcome === outcome.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                ]"
              >
                {{ outcome.label }}
              </button>
            </div>
            <p v-if="property.negotiationOutcome" class="text-xs text-gray-600 mt-2">
              {{ getNegotiationImpact(property.negotiationOutcome) }}
            </p>
          </div>
        </div>

        <!-- Exit Strategy Selection -->
        <div class="border-t pt-4">
          <h4 class="font-semibold mb-3">Exit Strategy</h4>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="strategy in exitStrategies"
              :key="strategy.id"
              @click="setExitStrategy(property.id, strategy.id)"
              :class="[
                'p-3 rounded-lg border-2 transition-all',
                property.exitStrategy === strategy.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="font-semibold">{{ strategy.label }}</div>
              <div class="text-xs text-gray-600 mt-1">{{ strategy.description }}</div>
            </button>
          </div>
        </div>

        <!-- Profit/Loss Calculation -->
        <div v-if="property.exitStrategy" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-semibold mb-2">Projected Outcome</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Purchase Price:</span>
              <span>-${{ property.winningBid.toLocaleString() }}</span>
            </div>
            
            <!-- Strategy-specific calculations -->
            <template v-if="property.exitStrategy === 'FLIP'">
              <div class="flex justify-between">
                <span>Renovation Cost:</span>
                <span>-${{ getRenovationCost(property).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Holding Costs (6 mo):</span>
                <span>-${{ Math.round(property.winningBid * 0.06).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span>After Repair Value:</span>
                <span class="text-green-600">+${{ (property.marketValue || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Selling Costs (8%):</span>
                <span>-${{ Math.round((property.marketValue || 0) * 0.08).toLocaleString() }}</span>
              </div>
            </template>
            
            <template v-else-if="property.exitStrategy === 'RENTAL'">
              <div class="flex justify-between">
                <span>Renovation Cost:</span>
                <span>-${{ getRenovationCost(property).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Monthly Rent (1% rule):</span>
                <span class="text-green-600">+${{ Math.round((property.marketValue || 0) * 0.01).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Annual NOI (60% of rent):</span>
                <span class="text-green-600">+${{ Math.round((property.marketValue || 0) * 0.01 * 12 * 0.6).toLocaleString() }}</span>
              </div>
            </template>
            
            <template v-else-if="property.exitStrategy === 'WHOLESALE'">
              <div class="flex justify-between">
                <span>Quick Sale Price (110% of bid):</span>
                <span class="text-green-600">+${{ Math.round(property.winningBid * 1.1).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Assignment Fee:</span>
                <span>-${{ Math.round(property.winningBid * 0.02).toLocaleString() }}</span>
              </div>
            </template>
            
            <div v-if="property.negotiationOutcome" class="text-xs text-gray-600">
              <div class="flex justify-between">
                <span>Negotiation Impact:</span>
                <span>{{ getNegotiationImpact(property.negotiationOutcome) }}</span>
              </div>
            </div>
            
            <div class="border-t pt-2 mt-2">
              <div class="flex justify-between font-bold">
                <span>Net Profit/Loss:</span>
                <span :class="getPropertyProfit(property) >= 0 ? 'text-green-600' : 'text-red-600'">
                  ${{ getPropertyProfit(property).toLocaleString() }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>ROI:</span>
                <span :class="getPropertyROI(property) >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ getPropertyROI(property) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Summary -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mt-8">
        <h3 class="text-2xl font-bold mb-4">Final Portfolio Summary</h3>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-purple-100">Total Properties Won</p>
            <p class="text-3xl font-bold">{{ wonProperties.length }}</p>
          </div>
          <div>
            <p class="text-purple-100">Portfolio Value</p>
            <p class="text-3xl font-bold">${{ portfolioValue.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-purple-100">Total Investment</p>
            <p class="text-3xl font-bold">${{ totalInvested.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-purple-100">Expected Return</p>
            <p class="text-3xl font-bold" :class="totalProfit >= 0 ? 'text-green-300' : 'text-red-300'">
              {{ totalProfit >= 0 ? '+' : '' }}${{ Math.abs(totalProfit).toLocaleString() }}
            </p>
          </div>
        </div>
        
        <!-- Performance Grade -->
        <div class="mt-6 text-center p-4 bg-white/20 rounded-lg">
          <p class="text-lg">Performance Grade</p>
          <p class="text-5xl font-bold mt-2">{{ performanceGrade }}</p>
          <p class="text-sm mt-2">{{ performanceFeedback }}</p>
        </div>
      </div>

      <!-- Export Results -->
      <div class="flex gap-4 mt-6">
        <button @click="exportResults" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Export Results as JSON
        </button>
        <button @click="saveToPortfolio" class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
          Save to Portfolio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'
import { 
  getRenovationCost,
  calculatePropertyProfit,
  getPerformanceGrade,
  getPerformanceFeedback,
  calculatePortfolioSummary
} from '~/utils/profitCalculations'

const gameStore = useGameStore()
const studentStore = useStudentStore()

const timeRemaining = ref(600) // 10 minutes
let timer = null

const negotiationOutcomes = [
  { id: 'CASH_FOR_KEYS', label: 'Cash for Keys ($3-5k)' },
  { id: 'EVICTION', label: 'Eviction ($5-10k)' },
  { id: 'RENT_BACK', label: 'Rent Back Agreement' },
  { id: 'LAND_CONTRACT', label: 'Land Contract Sale' },
  { id: 'QUICK_MOVE', label: 'Voluntary Move' }
]

const exitStrategies = [
  { 
    id: 'FLIP', 
    label: 'Fix & Flip', 
    description: 'Renovate and sell in 6 months'
  },
  { 
    id: 'RENTAL', 
    label: 'Buy & Hold', 
    description: 'Renovate and rent out'
  },
  { 
    id: 'WHOLESALE', 
    label: 'Wholesale', 
    description: 'Quick sale to another investor'
  }
]

const wonProperties = computed(() => {
  return gameStore.getCurrentStudentWonProperties()
})

const totalInvested = computed(() => {
  return wonProperties.value.reduce((sum, p) => {
    return sum + p.winningBid + getRenovationCost(p)
  }, 0)
})

const totalProfit = computed(() => {
  return wonProperties.value.reduce((sum, p) => {
    const profit = getPropertyProfit(p)
    return sum + profit
  }, 0)
})

const overallROI = computed(() => {
  if (totalInvested.value === 0) return 0
  return ((totalProfit.value / totalInvested.value) * 100).toFixed(1)
})

const portfolioValue = computed(() => {
  return wonProperties.value.reduce((sum, p) => sum + (p.marketValue || 0), 0)
})

const cashRemaining = computed(() => {
  return studentStore.currentStudent?.cashAvailable || 0
})

const performanceGrade = computed(() => {
  return getPerformanceGrade(parseFloat(overallROI.value))
})

const performanceFeedback = computed(() => {
  return getPerformanceFeedback(parseFloat(overallROI.value))
})

// Methods
function getPropertyProfit(property) {
  if (!property.exitStrategy) return 0
  
  const calc = calculatePropertyProfit(property)
  return calc.profit || 0
}

function getPropertyROI(property) {
  if (!property.exitStrategy) return 0
  
  const calc = calculatePropertyProfit(property)
  return calc.roi || '0.0'
}

function setExitStrategy(propertyId, strategy) {
  // Update in game store
  gameStore.setPropertyExitStrategy(propertyId, gameStore.currentStudentId, strategy)
  
  // Also update local property object for reactivity
  const property = wonProperties.value.find(p => p.id === propertyId)
  if (property) {
    property.exitStrategy = strategy
  }
}

function setNegotiationOutcome(propertyId, outcome) {
  // Update in game store
  gameStore.setPropertyNegotiationOutcome(propertyId, gameStore.currentStudentId, outcome)
  
  // Also update local property object for reactivity
  const property = wonProperties.value.find(p => p.id === propertyId)
  if (property) {
    property.negotiationOutcome = outcome
  }
}

function getNegotiationImpact(outcomeId) {
  const impacts = {
    'CASH_FOR_KEYS': '-$4,000 (one-time payment)',
    'EVICTION': '-$7,500 (legal & moving costs)',
    'RENT_BACK': '+$1,200/mo rental income',
    'LAND_CONTRACT': '+15% sale premium',
    'QUICK_MOVE': 'No additional cost'
  }
  return impacts[outcomeId] || ''
}

function exportResults() {
  // Generate a detailed report
  const report = {
    session: gameStore.session?.code,
    student: studentStore.currentStudent?.name,
    date: new Date().toISOString(),
    properties: wonProperties.value.map(p => ({
      address: p.address,
      city: p.city,
      purchasePrice: p.winningBid,
      marketValue: p.marketValue,
      exitStrategy: p.exitStrategy,
      negotiationOutcome: p.negotiationOutcome,
      projectedProfit: getPropertyProfit(p),
      roi: getPropertyROI(p)
    })),
    summary: {
      totalInvested: totalInvested.value,
      totalProfit: totalProfit.value,
      overallROI: overallROI.value,
      grade: performanceGrade.value,
      feedback: performanceFeedback.value
    }
  }
  
  // Convert to downloadable JSON
  const dataStr = JSON.stringify(report, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `auction-results-${gameStore.session?.code}-${Date.now()}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

function saveToPortfolio() {
  studentStore.savePortfolio()
  alert('Portfolio saved successfully!')
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Timer
onMounted(() => {
  studentStore.startRedemptionTimer()
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      studentStore.decrementRedemptionTimer()
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