<!-- PreviewPhase.vue -->
<template>
  <div class="preview-phase">
    <!-- Phase Info Banner -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-blue-900 mb-2">Preview Phase - Research Properties</h3>
      <p class="text-sm text-blue-700">
        Research properties to uncover hidden information. Each research action costs 2 credits.
        You have {{ studentStore.researchCreditsRemaining }} credits remaining.
      </p>
      <button 
        @click="dashboard.openDraftBoard()"
        class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Draft Board
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-4 gap-3">
        <select 
          v-model="filters.city"
          @change="studentStore.setFilter('city', filters.city)"
          class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
        
        <select 
          v-model="filters.status"
          @change="studentStore.setFilter('status', filters.status)"
          class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="researched">Researched</option>
          <option value="not-researched">Not Researched</option>
        </select>
        
        <select 
          v-model="filters.priceRange"
          @change="studentStore.setFilter('priceRange', filters.priceRange)"
          class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Prices</option>
          <option value="low">Under $50k</option>
          <option value="medium">$50k - $150k</option>
          <option value="high">Over $150k</option>
        </select>
        
        <select 
          v-model="sortBy"
          @change="studentStore.setSortBy(sortBy)"
          class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="address">Sort by Address</option>
          <option value="city">Sort by City</option>
          <option value="openingBid">Sort by Opening Bid</option>
        </select>
      </div>
    </div>

    <!-- Property Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="property in filteredProperties"
        :key="property.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        @click="selectProperty(property)"
      >
        <div class="p-4">
          <h4 class="font-semibold text-sm mb-1">{{ property.address }}</h4>
          <p class="text-xs text-gray-600 mb-2">{{ property.city }}, {{ property.neighborhood }}</p>
          
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Beds/Baths:</span>
              <span>{{ property.bedrooms }}/{{ property.bathrooms }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Sq Ft:</span>
              <span>{{ property.squareFeet?.toLocaleString() || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Year Built:</span>
              <span>{{ property.yearBuilt }}</span>
            </div>
          </div>
          
          <!-- Research Status -->
          <div class="mt-3 flex justify-between items-center">
            <div>
              <span v-if="getResearchLevel(property) > 0" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                L{{ getResearchLevel(property) }} Researched
              </span>
              <span v-else class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                Not Researched
              </span>
            </div>
            <div class="flex gap-1">
              <button 
                @click.stop="dashboard.openResearchModal(property)"
                class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Research Property"
              >
                🔍
              </button>
              <button 
                @click.stop="dashboard.openAnalysisModal(property)"
                class="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Analyze Property"
              >
                📊
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Property Panel -->
    <div v-if="selectedProperty" class="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-semibold">{{ selectedProperty.address }}</h3>
        <button @click="selectedProperty = null" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <div class="space-y-2 text-sm">
        <p class="text-gray-600">{{ selectedProperty.city }}, {{ selectedProperty.neighborhood }}</p>
        
        <!-- Show research data if available -->
        <div v-if="researchData" class="border-t pt-2">
          <p v-if="researchData.occupancyStatus" class="text-xs">
            <span class="font-medium">Occupancy:</span> {{ researchData.occupancyStatus.replace('_', ' ') }}
          </p>
          <p v-if="researchData.renovationNeeded" class="text-xs">
            <span class="font-medium">Condition:</span> {{ researchData.renovationNeeded.replace('_', ' ') }}
          </p>
        </div>
      </div>
      
      <div class="mt-3 flex gap-2">
        <button 
          @click="dashboard.openResearchModal(selectedProperty)"
          class="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Research
        </button>
        <button 
          @click="dashboard.openAnalysisModal(selectedProperty)"
          class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Analyze
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'

const gameStore = useGameStore()
const studentStore = useStudentStore()
const dashboard = inject('studentDashboard')

// State
const selectedProperty = ref(null)
const filters = ref({
  city: '',
  status: '',
  priceRange: 'all'
})
const sortBy = ref('address')

// Computed
const filteredProperties = computed(() => studentStore.filteredProperties)
const cities = computed(() => {
  if (!gameStore.session) return []
  const citySet = new Set(gameStore.session.properties.map(p => p.city))
  return Array.from(citySet).sort()
})
const researchData = computed(() => {
  if (!selectedProperty.value) return null
  return studentStore.researchResults.get(selectedProperty.value.id)
})

// Methods
function selectProperty(property) {
  selectedProperty.value = property
  studentStore.setSelectedProperty(property)
}

function getResearchLevel(property) {
  const research = studentStore.researchResults.get(property.id)
  return research?.level || property.researchLevel || 0
}
</script>