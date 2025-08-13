<template>
  <div class="announcement-phase">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-yellow-900 mb-2">Announcement Phase</h3>
      <p class="text-sm text-yellow-700">Opening bids are being revealed. Review and adjust your strategy.</p>
    </div>
    
    <div class="space-y-3">
      <div v-for="property in properties" :key="property.id" class="bg-white rounded-lg shadow p-4">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '~/stores/gameStore'

const gameStore = useGameStore()
const properties = computed(() => gameStore.session?.properties || [])
</script>