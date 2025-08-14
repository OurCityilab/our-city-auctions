<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">System Test Suite</h1>
        <p class="text-gray-600">Wayne County Auction Game - Comprehensive System Testing</p>
        
        <div class="mt-4 flex gap-4">
          <button 
            @click="runTests"
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ loading ? 'Testing...' : 'Run All Tests' }}
          </button>
          
          <button 
            @click="clearResults"
            class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      <!-- Test Status Summary -->
      <div v-if="testResults" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Test Summary</h2>
        
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center p-4 rounded" :class="summaryClass">
            <div class="text-3xl font-bold">{{ testResults.summary.passed }}/{{ testResults.summary.totalTests }}</div>
            <div class="text-sm">Tests Passed</div>
          </div>
          
          <div class="text-center p-4 bg-gray-50 rounded">
            <div class="text-3xl font-bold">{{ successRate }}%</div>
            <div class="text-sm">Success Rate</div>
          </div>
          
          <div class="text-center p-4 rounded" :class="statusClass">
            <div class="text-2xl font-bold">{{ testResults.summary.status }}</div>
            <div class="text-sm">Overall Status</div>
          </div>
        </div>

        <!-- Individual Test Results -->
        <div class="space-y-2">
          <div v-for="(passed, test) in testResults.tests" :key="test" 
               class="flex items-center justify-between p-3 rounded"
               :class="passed ? 'bg-green-50' : 'bg-red-50'">
            <span class="font-medium">{{ formatTestName(test) }}</span>
            <span class="text-2xl">{{ passed ? '✅' : '❌' }}</span>
          </div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div v-if="testResults" class="space-y-6">
        <!-- Property Generation Details -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">📊 Property Generation</h3>
          
          <div v-if="testResults.details.properties.length > 0" class="space-y-3">
            <p class="text-sm text-gray-600">Sample properties generated:</p>
            
            <div v-for="prop in testResults.details.properties" :key="prop.id"
                 class="border rounded p-3">
              <div class="font-medium">{{ prop.address }}, {{ prop.city }}</div>
              <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>Market Value: ${{ prop.marketValue.toLocaleString() }}</div>
                <div>Opening Bid: ${{ prop.openingBid.toLocaleString() }}</div>
                <div>Comparables: {{ prop.comparablesCount }}</div>
                <div>Occupied: {{ prop.hasOccupant ? 'Yes' : 'No' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparable Sales Details -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">🏘️ Comparable Sales Analysis</h3>
          
          <div class="mb-4">
            <p class="text-sm font-medium">{{ testResults.details.comparables.message }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-2">Comp Counts per Property:</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="(count, i) in testResults.details.comparables.counts" :key="i"
                      class="px-2 py-1 rounded text-sm"
                      :class="count >= 3 && count <= 6 ? 'bg-green-100' : 'bg-red-100'">
                  {{ count }}
                </span>
              </div>
            </div>
            
            <div v-if="testResults.details.comparables.ageRanges.length > 0">
              <p class="text-sm text-gray-600 mb-2">Sample Comp Ages (days):</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="(age, i) in testResults.details.comparables.ageRanges" :key="i"
                      class="px-2 py-1 bg-blue-100 rounded text-sm">
                  {{ age }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Occupant System Details -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">👤 Occupant System</h3>
          
          <div class="mb-4">
            <p class="text-sm font-medium">{{ testResults.details.occupants.message }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded p-3">
              <div class="text-2xl font-bold">{{ testResults.details.occupants.percentage }}%</div>
              <div class="text-sm text-gray-600">Occupancy Rate</div>
            </div>
            
            <div class="bg-gray-50 rounded p-3">
              <div class="text-2xl font-bold">{{ testResults.details.occupants.count }}/10</div>
              <div class="text-sm text-gray-600">Occupied Properties</div>
            </div>
          </div>
          
          <div v-if="testResults.details.occupants.responseRates.length > 0" class="mt-4">
            <p class="text-sm text-gray-600 mb-2">Contact Response Rates:</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="(rate, i) in testResults.details.occupants.responseRates" :key="i"
                    class="px-2 py-1 rounded text-sm"
                    :class="rate >= 30 && rate <= 70 ? 'bg-green-100' : 'bg-red-100'">
                {{ rate }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Errors -->
        <div v-if="testResults.details.errors.length > 0" class="bg-red-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-red-700">⚠️ Errors</h3>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="(error, i) in testResults.details.errors" :key="i" class="text-sm text-red-600">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 rounded-lg p-6 mt-6">
        <h3 class="text-lg font-semibold mb-2">📋 Test Coverage</h3>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Property Generation: Verifies 10 properties are generated with correct structure</li>
          <li>Comparable Sales: Checks each property has 3-6 comps aged 7-365 days</li>
          <li>Occupant System: Validates occupant profiles and response rates (30-70%)</li>
          <li>Research System: Confirms research fields are present on properties</li>
          <li>Contact System: Verifies occupant contact fields (income, credit, etc.)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const loading = ref(false)
const testResults = ref(null)

const successRate = computed(() => {
  if (!testResults.value) return 0
  return Math.round((testResults.value.summary.passed / testResults.value.summary.totalTests) * 100)
})

const summaryClass = computed(() => {
  if (!testResults.value) return 'bg-gray-50'
  const rate = successRate.value
  if (rate === 100) return 'bg-green-100'
  if (rate >= 80) return 'bg-yellow-100'
  return 'bg-red-100'
})

const statusClass = computed(() => {
  if (!testResults.value) return 'bg-gray-50'
  switch (testResults.value.summary.status) {
    case 'SUCCESS': return 'bg-green-100 text-green-700'
    case 'PARTIAL': return 'bg-yellow-100 text-yellow-700'
    case 'FAILURE': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-50'
  }
})

async function runTests() {
  loading.value = true
  try {
    const response = await $fetch('/api/test-systems')
    testResults.value = response
    console.log('Test results:', response)
  } catch (error) {
    console.error('Test failed:', error)
    alert('Failed to run tests. Check console for details.')
  } finally {
    loading.value = false
  }
}

function clearResults() {
  testResults.value = null
}

function formatTestName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Run tests on mount
onMounted(() => {
  runTests()
})
</script>