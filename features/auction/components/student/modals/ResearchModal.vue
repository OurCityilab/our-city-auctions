<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Property Research - {{ property.address }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
      </div>
      
      <div class="mb-4 p-3 bg-yellow-50 rounded flex justify-between items-center">
        <p class="text-sm">Research Credits Remaining: <span class="font-bold text-lg">{{ studentStore.researchCreditsRemaining }}</span>/30</p>
        <p class="text-xs text-gray-600">Each research level costs 2 credits</p>
      </div>
      
      <div class="space-y-4">
        <!-- Level 1: Basic Research -->
        <div class="border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-lg">📋 Level 1: Basic Property Information</h3>
            <button 
              v-if="!researchData || researchData.level < 1"
              @click="performResearch(1)"
              :disabled="studentStore.researchCreditsRemaining < 2"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 text-sm"
            >
              Research (2 credits)
            </button>
            <span v-else class="text-green-600 text-sm">✓ Completed</span>
          </div>
          
          <div v-if="researchData?.level >= 1" class="space-y-3 bg-gray-50 rounded p-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Occupancy Status:</p>
                <p class="font-semibold">{{ formatOccupancy(researchData.occupancyStatus) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Property Type:</p>
                <p class="font-semibold">{{ property.propertyType?.replace('_', ' ') || 'Unknown' }}</p>
              </div>
              <div>
                <p class="text-gray-600">Bedrooms/Bathrooms:</p>
                <p class="font-semibold">{{ property.bedrooms }}BR / {{ property.bathrooms }}BA</p>
              </div>
              <div>
                <p class="text-gray-600">Square Feet:</p>
                <p class="font-semibold">{{ property.squareFeet?.toLocaleString() || 'N/A' }}</p>
              </div>
            </div>
            
            <div v-if="researchData.occupant" class="border-t pt-3">
              <p class="text-sm font-semibold mb-2">Occupant Information:</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <p><span class="text-gray-600">Name:</span> {{ researchData.occupant.name }}</p>
                <p><span class="text-gray-600">Preference:</span> {{ formatPreference(researchData.occupant.preferredOutcome) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Level 2: Title Search & Comparables -->
        <div class="border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-lg">🏘️ Level 2: Title Search & Comparable Sales</h3>
            <button 
              v-if="researchData?.level === 1"
              @click="performResearch(2)"
              :disabled="studentStore.researchCreditsRemaining < 2"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 text-sm"
            >
              Research (2 credits)
            </button>
            <span v-else-if="researchData?.level >= 2" class="text-green-600 text-sm">✓ Completed</span>
            <span v-else class="text-gray-400 text-sm">Complete Level 1 first</span>
          </div>
          
          <div v-if="researchData?.level >= 2" class="space-y-4">
            <!-- Liens Discovery -->
            <div class="bg-red-50 rounded p-4">
              <h4 class="font-semibold mb-3">📋 Outstanding Liens & Debt</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>1st Mortgage ({{ property.lenderName || 'Bank' }}):</span>
                  <span class="font-bold">${{ (property.firstLienAmount || 0).toLocaleString() }}</span>
                </div>
                <div v-if="property.hasSecondLien" class="flex justify-between text-sm">
                  <span>2nd Mortgage/HELOC:</span>
                  <span class="font-bold">${{ (property.secondLienAmount || 0).toLocaleString() }}</span>
                </div>
                <div v-if="property.hasThirdLien" class="flex justify-between text-sm">
                  <span>Tax Lien:</span>
                  <span class="font-bold">${{ (property.thirdLienAmount || 0).toLocaleString() }}</span>
                </div>
                <div class="border-t pt-2 mt-2">
                  <div class="flex justify-between font-bold">
                    <span>Total Outstanding Debt:</span>
                    <span class="text-red-600">${{ totalDebt.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comparable Sales -->
            <div class="bg-blue-50 rounded p-4">
              <h4 class="font-semibold mb-3">🏠 Comparable Sales (Last 6 Months)</h4>
              <div class="space-y-2">
                <div v-for="(comp, index) in property.comparables?.slice(0, 5)" :key="index" 
                     class="bg-white p-3 rounded border">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-medium text-sm">{{ comp.address }}</p>
                      <p class="text-xs text-gray-600 mt-1">
                        📍 {{ comp.distance }} mi away | 📅 {{ comp.daysAgo }} days ago
                      </p>
                      <p class="text-xs mt-1">
                        {{ comp.bedrooms }}BR/{{ comp.bathrooms }}BA | {{ comp.squareFeet?.toLocaleString() }} sqft | {{ comp.condition }}
                      </p>
                    </div>
                    <div class="text-right ml-4">
                      <p class="font-bold text-green-600">${{ comp.soldPrice.toLocaleString() }}</p>
                      <p class="text-xs text-gray-600">${{ comp.pricePerSqft }}/sqft</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Comps Summary -->
              <div class="mt-3 pt-3 border-t bg-white rounded p-3">
                <div class="grid grid-cols-3 gap-3 text-sm">
                  <div class="text-center">
                    <p class="text-gray-600">Average</p>
                    <p class="font-bold">${{ compsAnalysis.average.toLocaleString() }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-gray-600">Range</p>
                    <p class="font-bold text-xs">${{ compsAnalysis.min.toLocaleString() }} - ${{ compsAnalysis.max.toLocaleString() }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-gray-600">Confidence</p>
                    <p class="font-bold" :class="getConfidenceColor(compsAnalysis.confidence)">{{ compsAnalysis.confidence }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student's Market Value Analysis -->
            <div class="bg-yellow-50 rounded p-4">
              <h4 class="font-semibold mb-3">📊 Your Market Value Analysis</h4>
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium">Based on comps, your estimated market value:</label>
                  <div class="flex gap-2 mt-1">
                    <input 
                      v-model.number="studentMarketValue"
                      type="number"
                      placeholder="Enter your estimate..."
                      class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @input="calculateLTV"
                    />
                    <button 
                      @click="useCompsAverage"
                      class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Use Avg
                    </button>
                  </div>
                </div>
                
                <!-- LTV Calculation -->
                <div v-if="studentMarketValue > 0" class="space-y-3">
                  <!-- Accuracy Assessment -->
                  <div class="p-3 bg-white rounded">
                    <div class="flex justify-between text-sm mb-2">
                      <span>Your estimate vs. comps:</span>
                      <span :class="estimateAccuracy.color" class="font-bold">
                        {{ estimateAccuracy.message }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- LTV Metrics -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-white rounded">
                      <p class="text-xs text-gray-600">Loan-to-Value (LTV)</p>
                      <p class="text-2xl font-bold" :class="ltvAssessment.color">{{ calculatedLTV }}%</p>
                    </div>
                    <div class="p-3 bg-white rounded">
                      <p class="text-xs text-gray-600">Estimated Equity</p>
                      <p class="text-2xl font-bold" :class="estimatedEquity >= 0 ? 'text-green-600' : 'text-red-600'">
                        ${{ estimatedEquity.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="p-3 rounded" :class="ltvAssessment.bgColor">
                    <p class="text-sm font-medium">{{ ltvAssessment.message }}</p>
                  </div>
                </div>

                <!-- Maximum Bid Calculation -->
                <div v-if="studentMarketValue > 0" class="mt-4 p-4 bg-green-50 rounded">
                  <h5 class="font-semibold mb-2">💰 Maximum Bid Recommendation</h5>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span>Your Market Value Estimate:</span>
                      <span>${{ studentMarketValue.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Target Profit Margin (20%):</span>
                      <span class="text-red-600">-${{ Math.round(studentMarketValue * 0.2).toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Estimated Renovation:</span>
                      <span class="text-red-600">-${{ getRenovationCost().toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Transaction Costs (10%):</span>
                      <span class="text-red-600">-${{ Math.round(studentMarketValue * 0.1).toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>LTV Risk Adjustment:</span>
                      <span :class="maxBidCalculation.riskMultiplier < 0.7 ? 'text-red-600' : 'text-green-600'">
                        {{ (maxBidCalculation.riskMultiplier * 100).toFixed(0) }}%
                      </span>
                    </div>
                    <div class="border-t pt-2 flex justify-between font-bold">
                      <span>Maximum Profitable Bid:</span>
                      <span class="text-green-700 text-lg">${{ maxBidCalculation.maxBid.toLocaleString() }}</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-2">{{ maxBidCalculation.recommendation }}</p>
                  </div>
                </div>

                <!-- Save Analysis Button -->
                <button 
                  @click="saveCompsAnalysis"
                  :disabled="!studentMarketValue"
                  class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Save Market Analysis
                </button>
              </div>
            </div>

            <!-- Additional Property Details -->
            <div class="bg-gray-50 rounded p-4">
              <h4 class="font-semibold mb-3">🔧 Property Condition</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-600">Renovation Level:</p>
                  <p class="font-semibold">{{ formatRenovation(researchData.renovationNeeded) }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Est. Renovation Cost:</p>
                  <p class="font-semibold">${{ getRenovationCost().toLocaleString() }}</p>
                </div>
                <div v-if="researchData.hiddenDamage">
                  <p class="text-gray-600">Hidden Damage:</p>
                  <p class="font-semibold text-red-600">${{ researchData.hiddenDamage.toLocaleString() }} ({{ researchData.hiddenDamageType }})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Level 3: Occupant Contact (if occupied) -->
        <div v-if="property.occupant" class="border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-lg">📞 Level 3: Occupant Contact</h3>
            <button 
              v-if="researchData?.level === 2"
              @click="performResearch(3)"
              :disabled="studentStore.researchCreditsRemaining < 1"
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 text-sm"
            >
              Contact (1 credit)
            </button>
            <span v-else-if="researchData?.level >= 3" class="text-green-600 text-sm">✓ Completed</span>
            <span v-else class="text-gray-400 text-sm">Complete Level 2 first</span>
          </div>
          
          <div v-if="researchData?.level >= 3 && researchData.occupantDetails" class="bg-purple-50 rounded p-4">
            <div class="space-y-2 text-sm">
              <p><strong>Willingness to Negotiate:</strong> {{ researchData.occupantDetails.willingToNegotiate ? 'Yes' : 'No' }}</p>
              <p><strong>Monthly Income:</strong> ${{ researchData.occupantDetails.monthlyIncome?.toLocaleString() || 'Unknown' }}</p>
              <p><strong>Credit Score:</strong> {{ researchData.occupantDetails.creditScore || 'Unknown' }}</p>
              <p><strong>Story:</strong> {{ researchData.occupantDetails.story || 'No additional information' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="mt-6 flex gap-3">
        <button 
          @click="$emit('close')"
          class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Close
        </button>
        <button 
          v-if="researchData?.level >= 2 && studentMarketValue > 0"
          @click="createSellSheet"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Sell Sheet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStudentStore } from '~/stores/studentStore'
import { useGameStore } from '~/stores/gameStore'
import { 
  calculateLTV as calcLTV,
  calculateEquity,
  getLTVAssessment,
  analyzeComparables,
  assessEstimateAccuracy,
  calculateMaxBid,
  calculateTotalDebt
} from '~/utils/underwritingCalculations'
import { getRenovationCost as getBaseCost } from '~/utils/profitCalculations'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'create-sell-sheet'])
const studentStore = useStudentStore()
const gameStore = useGameStore()

// State
const studentMarketValue = ref(0)

// Computed
const researchData = computed(() => {
  return studentStore.researchResults.get(props.property.id)
})

const totalDebt = computed(() => {
  return calculateTotalDebt(props.property)
})

const compsAnalysis = computed(() => {
  if (!props.property.comparables) return { average: 0, min: 0, max: 0, confidence: 'LOW' }
  return analyzeComparables(props.property.comparables)
})

const calculatedLTV = computed(() => {
  if (studentMarketValue.value === 0) return 0
  return calcLTV(totalDebt.value, studentMarketValue.value)
})

const estimatedEquity = computed(() => {
  return calculateEquity(studentMarketValue.value, totalDebt.value)
})

const ltvAssessment = computed(() => {
  return getLTVAssessment(parseFloat(calculatedLTV.value))
})

const estimateAccuracy = computed(() => {
  return assessEstimateAccuracy(studentMarketValue.value, compsAnalysis.value.average)
})

const maxBidCalculation = computed(() => {
  return calculateMaxBid({
    marketValue: studentMarketValue.value,
    renovationCost: getRenovationCost(),
    targetProfit: 0.2,
    transactionCosts: 0.1,
    holdingCosts: 0.06,
    ltv: parseFloat(calculatedLTV.value)
  })
})

// Methods
function performResearch(level) {
  const result = studentStore.performResearch(props.property.id, level)
  if (result) {
    console.log('Research successful:', result)
  }
}

function calculateLTV() {
  // Triggers computed properties update
}

function getRenovationCost() {
  return getBaseCost(props.property)
}

function useCompsAverage() {
  studentMarketValue.value = compsAnalysis.value.average
}

function saveCompsAnalysis() {
  const analysis = {
    studentMarketValue: studentMarketValue.value,
    calculatedLTV: calculatedLTV.value,
    estimatedEquity: estimatedEquity.value,
    maxBid: maxBidCalculation.value.maxBid,
    compsReviewed: true,
    timestamp: Date.now()
  }
  
  studentStore.saveAnalysis(props.property.id, analysis)
  
  // Also save to game store for tracking
  gameStore.savePropertyAnalysis?.(props.property.id, gameStore.currentStudentId, analysis)
  
  alert('Market analysis saved!')
}

function createSellSheet() {
  emit('create-sell-sheet', {
    property: props.property,
    analysis: {
      studentMarketValue: studentMarketValue.value,
      calculatedLTV: calculatedLTV.value,
      estimatedEquity: estimatedEquity.value,
      maxBid: maxBidCalculation.value.maxBid,
      compsAnalysis: compsAnalysis.value
    }
  })
  emit('close')
}

// Formatting helpers
function formatOccupancy(status) {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ')
}

function formatPreference(pref) {
  if (!pref) return 'Unknown'
  return pref.replace(/_/g, ' ')
}

function formatRenovation(level) {
  if (!level) return 'Unknown'
  return level.replace(/_/g, ' ')
}

function getConfidenceColor(confidence) {
  switch(confidence) {
    case 'HIGH': return 'text-green-600'
    case 'MEDIUM': return 'text-yellow-600'
    case 'LOW': return 'text-red-600'
    default: return 'text-gray-600'
  }
}
</script>

<style scoped>
/* Custom scrollbar for modal */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>