<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold">Property Sell Sheet</h2>
          <p class="text-sm text-gray-600">{{ property.address }}, {{ property.city }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
      </div>
      
      <!-- Property Overview -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded p-3">
          <p class="text-xs text-gray-600">Property Type</p>
          <p class="font-semibold">{{ property.propertyType?.replace('_', ' ') || 'Single Family' }}</p>
        </div>
        <div class="bg-blue-50 rounded p-3">
          <p class="text-xs text-gray-600">Size</p>
          <p class="font-semibold">{{ property.bedrooms }}BR / {{ property.bathrooms }}BA / {{ property.squareFeet?.toLocaleString() || 'N/A' }} sqft</p>
        </div>
        <div class="bg-blue-50 rounded p-3">
          <p class="text-xs text-gray-600">Year Built</p>
          <p class="font-semibold">{{ property.yearBuilt }}</p>
        </div>
      </div>

      <!-- LTV Analysis Section -->
      <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
        <h3 class="font-bold text-lg mb-3">📊 Underwriting Analysis</h3>
        
        <!-- Comps Summary -->
        <div class="mb-4 bg-white rounded p-3">
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p class="text-gray-600">Comps Average:</p>
              <p class="font-bold text-lg">${{ compsAverage.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-gray-600">Your Estimate:</p>
              <p class="font-bold text-lg">${{ (analysis.studentMarketValue || 0).toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-gray-600">Accuracy:</p>
              <p class="font-bold" :class="getAccuracyColor()">{{ getAccuracyText() }}</p>
            </div>
          </div>
        </div>

        <!-- LTV Metrics -->
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div class="bg-white rounded p-3">
            <p class="text-xs text-gray-600">Total Debt</p>
            <p class="text-lg font-bold text-red-600">${{ totalDebt.toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded p-3">
            <p class="text-xs text-gray-600">Loan-to-Value</p>
            <p class="text-lg font-bold" :class="getLTVColor()">{{ calculatedLTV }}%</p>
          </div>
          <div class="bg-white rounded p-3">
            <p class="text-xs text-gray-600">Equity Available</p>
            <p class="text-lg font-bold" :class="estimatedEquity >= 0 ? 'text-green-600' : 'text-red-600'">
              ${{ estimatedEquity.toLocaleString() }}
            </p>
          </div>
          <div class="bg-white rounded p-3">
            <p class="text-xs text-gray-600">Opening Bid</p>
            <p class="text-lg font-bold">${{ (property.openingBid || 0).toLocaleString() }}</p>
          </div>
        </div>

        <!-- Risk Assessment -->
        <div class="p-3 rounded" :class="getLTVBgColor()">
          <p class="text-sm font-medium">{{ getLTVMessage() }}</p>
        </div>
      </div>

      <!-- Maximum Bid Calculation -->
      <div class="bg-green-50 rounded-lg p-4 mb-6">
        <h3 class="font-bold text-lg mb-3">💰 Maximum Bid Recommendation</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Market Value (Your Estimate):</span>
            <span class="font-semibold">${{ (analysis.studentMarketValue || 0).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Target Profit (20%):</span>
            <span class="text-red-600">-${{ Math.round((analysis.studentMarketValue || 0) * 0.2).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Renovation Cost:</span>
            <span class="text-red-600">-${{ (analysis.renovationCost || 0).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Transaction Costs (10%):</span>
            <span class="text-red-600">-${{ Math.round((analysis.studentMarketValue || 0) * 0.1).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Holding Costs (6 months):</span>
            <span class="text-red-600">-${{ Math.round((analysis.studentMarketValue || 0) * 0.06).toLocaleString() }}</span>
          </div>
          <div class="border-t pt-2 mt-2 flex justify-between">
            <span class="font-bold">Maximum Profitable Bid:</span>
            <span class="font-bold text-green-700 text-xl">${{ (analysis.maxBid || 0).toLocaleString() }}</span>
          </div>
        </div>
        
        <!-- Bid vs Opening Comparison -->
        <div class="mt-4 p-3 rounded" :class="getBidComparisonClass()">
          <p class="text-sm font-medium">{{ getBidComparisonMessage() }}</p>
        </div>
      </div>

      <!-- Strategy Selection & Analysis -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-bold text-lg mb-3">📋 Investment Strategy</h3>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Exit Strategy</label>
            <select 
              v-model="analysis.strategy" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FLIP">Fix & Flip (6 months)</option>
              <option value="RENTAL">Buy & Hold (Rental)</option>
              <option value="WHOLESALE">Wholesale Assignment</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Confidence Level</label>
            <select 
              v-model="analysis.confidence" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">Very High (5)</option>
              <option value="4">High (4)</option>
              <option value="3">Medium (3)</option>
              <option value="2">Low (2)</option>
              <option value="1">Very Low (1)</option>
            </select>
          </div>
        </div>

        <!-- Strategy-specific projections -->
        <div class="bg-white rounded p-3">
          <p class="text-sm font-semibold mb-2">Projected Outcome ({{ analysis.strategy }})</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Total Investment:</span>
              <span class="font-semibold">${{ totalInvestment.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span>Expected Return:</span>
              <span class="font-semibold" :class="expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ expectedReturn.toLocaleString() }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>ROI:</span>
              <span class="font-semibold" :class="projectedROI >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ projectedROI }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Analysis Notes</label>
        <textarea 
          v-model="analysis.notes"
          rows="3"
          placeholder="Add your analysis notes, concerns, or special considerations..."
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Priority Ranking -->
      <div class="bg-yellow-50 rounded p-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold">Add to Draft Board?</p>
            <p class="text-xs text-gray-600">Rank this property in your priority list</p>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="addToDraftBoard"
                class="mr-2"
              />
              <span class="text-sm">Add to Draft Board</span>
            </label>
            <input 
              v-if="addToDraftBoard"
              v-model.number="draftBoardRank"
              type="number"
              min="1"
              max="10"
              placeholder="Rank"
              class="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button 
          @click="saveAnalysis"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Analysis
        </button>
        <button 
          @click="exportAnalysis"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export PDF
        </button>
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStudentStore } from '~/stores/studentStore'
import { 
  calculateLTV,
  calculateEquity,
  getLTVAssessment,
  calculateTotalDebt
} from '~/utils/underwritingCalculations'
import { getRenovationCost } from '~/utils/profitCalculations'

const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  initialAnalysis: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])
const studentStore = useStudentStore()

// State
const analysis = reactive({
  strategy: props.initialAnalysis?.strategy || 'FLIP',
  studentMarketValue: props.initialAnalysis?.studentMarketValue || 0,
  renovationCost: props.initialAnalysis?.renovationCost || getRenovationCost(props.property),
  maxBid: props.initialAnalysis?.maxBid || 0,
  confidence: props.initialAnalysis?.confidence || 3,
  notes: props.initialAnalysis?.notes || '',
  calculatedLTV: props.initialAnalysis?.calculatedLTV || 0,
  estimatedEquity: props.initialAnalysis?.estimatedEquity || 0,
  compsReviewed: props.initialAnalysis?.compsReviewed || false
})

const addToDraftBoard = ref(false)
const draftBoardRank = ref(1)

// Computed
const totalDebt = computed(() => {
  return calculateTotalDebt(props.property)
})

const compsAverage = computed(() => {
  if (!props.property.comparables || props.property.comparables.length === 0) return 0
  const prices = props.property.comparables.map(c => c.soldPrice)
  return Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
})

const calculatedLTV = computed(() => {
  if (!analysis.studentMarketValue) return 0
  return calculateLTV(totalDebt.value, analysis.studentMarketValue)
})

const estimatedEquity = computed(() => {
  return calculateEquity(analysis.studentMarketValue, totalDebt.value)
})

const totalInvestment = computed(() => {
  return (analysis.maxBid || 0) + (analysis.renovationCost || 0)
})

const expectedReturn = computed(() => {
  if (analysis.strategy === 'FLIP') {
    return Math.round(analysis.studentMarketValue * 0.9 - totalInvestment.value) // 10% selling costs
  } else if (analysis.strategy === 'RENTAL') {
    return Math.round(analysis.studentMarketValue * 0.01 * 12 * 0.6) // Annual NOI
  } else {
    return Math.round(analysis.maxBid * 0.1) // 10% wholesale fee
  }
})

const projectedROI = computed(() => {
  if (totalInvestment.value === 0) return 0
  return ((expectedReturn.value / totalInvestment.value) * 100).toFixed(1)
})

// Methods
function getLTVColor() {
  const ltv = parseFloat(calculatedLTV.value)
  if (ltv > 100) return 'text-red-600'
  if (ltv > 80) return 'text-yellow-600'
  return 'text-green-600'
}

function getLTVBgColor() {
  const ltv = parseFloat(calculatedLTV.value)
  if (ltv > 100) return 'bg-red-100'
  if (ltv > 80) return 'bg-yellow-100'
  return 'bg-green-100'
}

function getLTVMessage() {
  const assessment = getLTVAssessment(parseFloat(calculatedLTV.value))
  return assessment.message
}

function getAccuracyColor() {
  const diff = Math.abs(analysis.studentMarketValue - compsAverage.value) / compsAverage.value * 100
  if (diff <= 5) return 'text-green-600'
  if (diff <= 10) return 'text-blue-600'
  if (diff <= 20) return 'text-yellow-600'
  return 'text-red-600'
}

function getAccuracyText() {
  const diff = ((analysis.studentMarketValue - compsAverage.value) / compsAverage.value * 100).toFixed(1)
  if (Math.abs(diff) <= 5) return 'Excellent'
  if (Math.abs(diff) <= 10) return 'Good'
  if (Math.abs(diff) <= 20) return 'Fair'
  return 'Review'
}

function getBidComparisonClass() {
  const openingBid = props.property.openingBid || 0
  if (analysis.maxBid > openingBid) return 'bg-green-100'
  if (analysis.maxBid > openingBid * 0.8) return 'bg-yellow-100'
  return 'bg-red-100'
}

function getBidComparisonMessage() {
  const openingBid = props.property.openingBid || 0
  const diff = analysis.maxBid - openingBid
  
  if (diff > 0) {
    return `✓ Your max bid is $${diff.toLocaleString()} above opening bid - Good opportunity!`
  } else if (diff > -openingBid * 0.2) {
    return `⚠️ Your max bid is $${Math.abs(diff).toLocaleString()} below opening - Marginal deal`
  } else {
    return `✗ Your max bid is $${Math.abs(diff).toLocaleString()} below opening - Consider passing`
  }
}

function saveAnalysis() {
  // Update analysis with latest calculations
  analysis.calculatedLTV = calculatedLTV.value
  analysis.estimatedEquity = estimatedEquity.value
  
  // Save to student store
  studentStore.saveAnalysis(props.property.id, analysis)
  
  // Add to draft board if selected
  if (addToDraftBoard.value) {
    studentStore.addToDraftBoard({
      rank: draftBoardRank.value,
      propertyId: props.property.id,
      property: props.property,
      maxBid: analysis.maxBid,
      confidence: analysis.confidence,
      strategy: analysis.strategy,
      notes: analysis.notes
    })
  }
  
  emit('save', analysis)
  emit('close')
}

function exportAnalysis() {
  // Create export data
  const exportData = {
    property: {
      address: props.property.address,
      city: props.property.city,
      type: props.property.propertyType,
      size: `${props.property.bedrooms}BR/${props.property.bathrooms}BA`,
      squareFeet: props.property.squareFeet,
      yearBuilt: props.property.yearBuilt
    },
    analysis: {
      marketValue: analysis.studentMarketValue,
      totalDebt: totalDebt.value,
      ltv: calculatedLTV.value,
      equity: estimatedEquity.value,
      maxBid: analysis.maxBid,
      strategy: analysis.strategy,
      expectedReturn: expectedReturn.value,
      roi: projectedROI.value,
      notes: analysis.notes
    },
    comps: props.property.comparables?.slice(0, 5) || [],
    timestamp: new Date().toISOString()
  }
  
  // Convert to JSON and download
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `analysis-${props.property.id}-${Date.now()}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  alert('Analysis exported!')
}

// Load existing analysis on mount
onMounted(() => {
  const existingAnalysis = studentStore.propertyAnalyses.get(props.property.id)
  if (existingAnalysis) {
    Object.assign(analysis, existingAnalysis)
  }
})
</script>

<style scoped>
/* Custom scrollbar */
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