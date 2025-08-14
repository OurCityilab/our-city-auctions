<template>
  <div class="announcement-phase">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-yellow-900 mb-2">Announcement Phase</h3>
      <p class="text-sm text-yellow-700">Opening bids are being revealed. Review and adjust your strategy.</p>
    </div>
    
    <!-- Pagination Controls -->
    <div class="flex justify-center gap-4 mb-4">
      <button 
        @click="currentPage = Math.max(0, currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        ← Previous
      </button>
      <span class="py-2 text-gray-700 font-medium">
        Properties {{ currentPage * PROPERTIES_PER_PAGE + 1 }}-{{ Math.min((currentPage + 1) * PROPERTIES_PER_PAGE, allProperties.length) }} 
        of {{ allProperties.length }}
      </span>
      <button 
        @click="currentPage = currentPage + 1"
        :disabled="(currentPage + 1) * PROPERTIES_PER_PAGE >= allProperties.length"
        class="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Next →
      </button>
    </div>
    
    <div class="space-y-3">
      <div v-for="property in visibleProperties" :key="property.id" class="bg-white rounded-lg shadow p-4">
        <div class="flex justify-between">
          <div>
            <h4 class="font-semibold">{{ property.address }}</h4>
            <p class="text-sm text-gray-600">{{ property.city }}, {{ property.neighborhood }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Opening Bid</p>
            <p class="text-xl font-bold text-green-600">${{ property.openingBid?.toLocaleString() || '0' }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Page Indicator Dots -->
    <div class="flex justify-center gap-2 mt-6">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page - 1"
        :class="[
          'w-2 h-2 rounded-full transition-all',
          currentPage === page - 1 ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
        ]"
        :aria-label="`Go to page ${page}`"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '~/stores/gameStore'

const gameStore = useGameStore()
const PROPERTIES_PER_PAGE = 15
const currentPage = ref(0)

const allProperties = computed(() => gameStore.session?.properties || [])

const visibleProperties = computed(() => {
  const start = currentPage.value * PROPERTIES_PER_PAGE
  const end = start + PROPERTIES_PER_PAGE
  return allProperties.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(allProperties.value.length / PROPERTIES_PER_PAGE))
</script>