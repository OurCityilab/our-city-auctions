<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Draft Board - Priority List</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      
      <div class="mb-4 p-4 bg-blue-50 rounded">
        <p class="text-sm text-blue-800">
          Create your priority list by adding properties. Total estimated capital needed: 
          <span class="font-bold">${{ studentStore.totalDraftBoardValue.toLocaleString() }}</span>
        </p>
      </div>
      
      <div v-if="studentStore.draftBoard.length === 0" class="text-center py-8 text-gray-500">
        No properties added to draft board yet.
      </div>
      
      <div v-else class="space-y-2">
        <div 
          v-for="(item, index) in studentStore.draftBoard" 
          :key="item.propertyId"
          class="flex items-center gap-3 p-3 border rounded"
        >
          <span class="font-bold text-lg text-gray-500">{{ index + 1 }}</span>
          <div class="flex-1">
            <p class="font-medium">{{ item.property.address }}</p>
            <p class="text-sm text-gray-600">{{ item.property.city }}, {{ item.property.neighborhood }}</p>
          </div>
          <div class="text-sm">
            <p>Est. Opening: ${{ item.estimatedBid.toLocaleString() }}</p>
            <p class="font-medium">Max Bid: ${{ item.maxBid.toLocaleString() }}</p>
          </div>
          <div class="flex gap-2">
            <button 
              @click="moveUp(index)"
              :disabled="index === 0"
              class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              ↑
            </button>
            <button 
              @click="moveDown(index)"
              :disabled="index === studentStore.draftBoard.length - 1"
              class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              ↓
            </button>
            <button 
              @click="remove(item.propertyId)"
              class="px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-yellow-50 rounded">
        <p class="text-sm text-yellow-800">
          <strong>Available Cash:</strong> ${{ studentStore.cashAvailable.toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStudentStore } from '~/stores/studentStore'

const emit = defineEmits(['close'])
const studentStore = useStudentStore()

function moveUp(index) {
  studentStore.reorderDraftBoard(index, index - 1)
}

function moveDown(index) {
  studentStore.reorderDraftBoard(index, index + 1)
}

function remove(propertyId) {
  studentStore.removeFromDraftBoard(propertyId)
}
</script>