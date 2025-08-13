<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <NuxtPage />
    
    <!-- Global notifications -->
    <UNotifications />
    
    <!-- Loading overlay for page transitions -->
    <div 
      v-if="pending" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 text-center">
        <div class="animate-spin h-8 w-8 border-4 border-auction-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Loading auction data...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Global app setup
useHead({
  titleTemplate: '%s - Our City Auctions',
  meta: [
    { name: 'description', content: 'Educational real estate auction simulation for Wayne County properties' },
    { name: 'author', content: 'Our City Auctions Educational Platform' },
  ],
})

// Global loading state
const { pending } = useLazyAsyncData('app-init', async () => {
  // Initialize any global state here
  return true
})

// Handle errors gracefully
onErrorCaptured((error) => {
  console.error('Global error captured:', error)
  // Could send to error reporting service
  return false
})
</script>

<style>
/* Global styles */
html {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Auction-specific global styles */
.auction-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200;
}

.auction-card:hover {
  @apply shadow-md border-auction-300;
}

.auction-button {
  @apply px-4 py-2 rounded-md font-medium transition-colors duration-200;
}

.auction-button-primary {
  @apply auction-button bg-auction-600 text-white hover:bg-auction-700;
}

.auction-button-secondary {
  @apply auction-button bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.phase-indicator {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
}

.currency-display {
  @apply font-mono font-semibold;
}

/* Property grid responsive layout */
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Bid entry optimizations */
.bid-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-lg;
}

.bid-input:focus {
  @apply outline-none ring-2 ring-auction-500 border-auction-500;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .property-grid {
    grid-template-columns: 1fr;
  }
  
  .student-dashboard {
    grid-template-columns: 1fr;
  }
}

/* Print styles for cash cards */
@media print {
  .no-print {
    display: none !important;
  }
  
  .cash-card {
    page-break-inside: avoid;
    margin: 0.5rem;
  }
}
</style>