<template>
  <div class="printable-bid-sheet">
    <!-- Screen View -->
    <div class="screen-view">
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-2">Printable Bid Sheet</h3>
        <p class="text-gray-600 text-sm">Generate a paper bid sheet for manual tracking</p>
      </div>
      
      <button
        @click="generateAndPrint"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
      >
        <Icon name="heroicons:printer" class="w-5 h-5" />
        Generate & Print Bid Sheet
      </button>
      
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600">The bid sheet will include:</p>
        <ul class="mt-2 text-sm text-gray-700 space-y-1">
          <li>• Your name and paddle number</li>
          <li>• All properties from your draft board</li>
          <li>• Estimated and maximum bid amounts</li>
          <li>• Space to record actual bids</li>
          <li>• Checkboxes to mark won properties</li>
        </ul>
      </div>
    </div>

    <!-- Print View (Hidden on Screen) -->
    <div class="print-view" id="printable-content">
      <div class="print-header">
        <h1>Wayne County Auction - Bid Tracking Sheet</h1>
        <div class="session-info">
          <div>
            <strong>Session:</strong> {{ sessionCode }}
          </div>
          <div>
            <strong>Date:</strong> {{ currentDate }}
          </div>
        </div>
        <div class="student-info">
          <div>
            <strong>Student Name:</strong> {{ studentName }}
          </div>
          <div>
            <strong>Paddle #:</strong> {{ paddleNumber }}
          </div>
        </div>
      </div>

      <table class="bid-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Property Address</th>
            <th>City</th>
            <th>Est. Opening</th>
            <th>My Max</th>
            <th>Actual Bid</th>
            <th>Won</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in draftBoardItems" :key="item.propertyId">
            <td>{{ index + 1 }}</td>
            <td class="address-cell">{{ item.property.address }}</td>
            <td>{{ item.property.city }}</td>
            <td>${{ item.estimatedBid?.toLocaleString() || '___' }}</td>
            <td>${{ item.maxBid?.toLocaleString() || '___' }}</td>
            <td class="write-in">_________</td>
            <td class="checkbox-cell">☐</td>
          </tr>
          <!-- Add empty rows if draft board has fewer than 20 items -->
          <tr v-for="n in Math.max(0, 20 - draftBoardItems.length)" :key="'empty-' + n">
            <td>{{ draftBoardItems.length + n }}</td>
            <td class="write-in">_________________________</td>
            <td class="write-in">____________</td>
            <td class="write-in">_________</td>
            <td class="write-in">_________</td>
            <td class="write-in">_________</td>
            <td class="checkbox-cell">☐</td>
          </tr>
        </tbody>
      </table>

      <div class="print-footer">
        <div class="summary-section">
          <h3>Session Summary</h3>
          <div class="summary-grid">
            <div>Total Properties Targeted: _____</div>
            <div>Properties Won: _____</div>
            <div>Total Amount Spent: $__________</div>
            <div>Cash Remaining: $__________</div>
          </div>
        </div>
        
        <div class="notes-section">
          <h3>Notes</h3>
          <div class="notes-lines">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '~/stores/gameStore'
import { useStudentStore } from '~/stores/studentStore'

const gameStore = useGameStore()
const studentStore = useStudentStore()

const sessionCode = computed(() => gameStore.session?.code || 'N/A')
const studentName = computed(() => studentStore.currentStudent?.name || 'Student')
const paddleNumber = computed(() => studentStore.currentStudent?.paddleNumber || 'N/A')
const draftBoardItems = computed(() => studentStore.draftBoard || [])
const currentDate = computed(() => new Date().toLocaleDateString())

function generateAndPrint() {
  // Trigger print dialog
  window.print()
}
</script>

<style>
/* Screen styles */
.screen-view {
  @apply block;
}

.print-view {
  @apply hidden;
}

/* Print styles */
@media print {
  /* Hide everything except print content */
  body * {
    visibility: hidden;
  }
  
  .print-view,
  .print-view * {
    visibility: visible;
  }
  
  .screen-view {
    display: none !important;
  }
  
  .print-view {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: white;
    color: black;
    font-family: Arial, sans-serif;
  }
  
  /* Print layout */
  @page {
    size: letter;
    margin: 0.5in;
  }
  
  .print-header {
    margin-bottom: 20px;
    border-bottom: 2px solid black;
    padding-bottom: 10px;
  }
  
  .print-header h1 {
    font-size: 18pt;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .session-info,
  .student-info {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 10pt;
  }
  
  .bid-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-bottom: 20px;
  }
  
  .bid-table th {
    border: 1px solid black;
    padding: 5px;
    background: #f0f0f0;
    font-weight: bold;
    text-align: left;
  }
  
  .bid-table td {
    border: 1px solid black;
    padding: 5px;
    height: 25px;
  }
  
  .address-cell {
    min-width: 150px;
  }
  
  .write-in {
    border-bottom: 1px solid #999;
  }
  
  .checkbox-cell {
    text-align: center;
    font-size: 14pt;
  }
  
  .print-footer {
    margin-top: 30px;
  }
  
  .summary-section {
    margin-bottom: 20px;
  }
  
  .summary-section h3 {
    font-size: 12pt;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    font-size: 10pt;
  }
  
  .notes-section h3 {
    font-size: 12pt;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .notes-lines .line {
    border-bottom: 1px solid #999;
    height: 25px;
    margin-bottom: 5px;
  }
}
</style>