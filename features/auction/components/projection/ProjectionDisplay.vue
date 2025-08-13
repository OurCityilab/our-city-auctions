<!-- features/auction/components/projection/ProjectionDisplay.vue -->
<template>
  <div class="projection-display min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white overflow-hidden">
    <!-- Header -->
    <div class="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20">
      <div class="max-w-screen-2xl mx-auto px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold">Wayne County Auction</h1>
            <p class="text-xl text-blue-200 mt-1">{{ session?.name || 'Live Auction' }}</p>
          </div>
          <div class="flex items-center space-x-8">
            <!-- Current Phase -->
            <div class="text-center">
              <p class="text-lg text-blue-200">Current Phase</p>
              <p class="text-3xl font-bold">{{ formatPhase(session?.currentPhase) }}</p>
            </div>
            <!-- Timer -->
            <div class="text-center">
              <p class="text-lg text-blue-200">Time Remaining</p>
              <p class="text-5xl font-mono font-bold">{{ formatTime(phaseTimeRemaining) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-screen-2xl mx-auto px-8 py-6">
      <!-- Preview Phase -->
      <div v-if="session?.currentPhase === 'PREVIEW'" class="text-center py-20">
        <div class="animate-pulse">
          <h2 class="text-6xl font-bold mb-8">Research Phase</h2>
          <p class="text-3xl text-blue-200">Students are researching properties...</p>
          <div class="mt-12 inline-flex items-center space-x-4">
            <div class="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-2xl">{{ studentsResearching }} students active</span>
          </div>
        </div>
      </div>

      <!-- Announcement Phase -->
      <div v-else-if="session?.currentPhase === 'ANNOUNCEMENT'" class="py-8">
        <h2 class="text-5xl font-bold text-center mb-8">Opening Bids Revealed</h2>
        <div class="grid grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          <div 
            v-for="(property, index) in announcementProperties" 
            :key="property.id"
            class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 transform transition-all duration-500"
            :style="{ animationDelay: `${index * 100}ms` }"
            :class="{ 'animate-slide-in': true }"
          >
            <p class="text-lg font-bold">{{ property.address }}</p>
            <p class="text-blue-200">{{ property.city }}</p>
            <p class="text-3xl font-bold text-green-400 mt-2">
              ${{ property.openingBid.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Banking Phase -->
      <div v-else-if="session?.currentPhase === 'BANKING'" class="text-center py-20">
        <h2 class="text-6xl font-bold mb-8">Banking Window Open</h2>
        <p class="text-3xl text-blue-200 mb-8">Students are withdrawing funds...</p>
        <div class="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
          <div 
            v-for="student in activeStudents" 
            :key="student.id"
            class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4"
          >
            <p class="font-bold">#{{ student.paddleNumber }}</p>
            <p class="text-green-400 text-xl">
              ${{ student.cashWithdrawn.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Bidding Phase -->
      <div v-else-if="session?.currentPhase === 'BIDDING'" class="grid grid-cols-2 gap-8">
        <!-- Left: Current Property -->
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
          <h2 class="text-3xl font-bold mb-6">Now Auctioning</h2>
          <div v-if="currentProperty">
            <img 
              :src="currentProperty.imageUrl || '/api/placeholder/600/400'" 
              :alt="currentProperty.address"
              class="w-full h-64 object-cover rounded-lg mb-6"
            >
            <h3 class="text-4xl font-bold mb-2">{{ currentProperty.address }}</h3>
            <p class="text-2xl text-blue-200 mb-4">{{ currentProperty.city }}, {{ currentProperty.neighborhood }}</p>
            
            <div class="grid grid-cols-2 gap-4 mb-6 text-xl">
              <div>
                <span class="text-blue-200">Bedrooms:</span>
                <span class="ml-2 font-bold">{{ currentProperty.bedrooms }}</span>
              </div>
              <div>
                <span class="text-blue-200">Bathrooms:</span>
                <span class="ml-2 font-bold">{{ currentProperty.bathrooms }}</span>
              </div>
              <div>
                <span class="text-blue-200">Square Feet:</span>
                <span class="ml-2 font-bold">{{ currentProperty.squareFeet }}</span>
              </div>
              <div>
                <span class="text-blue-200">Year Built:</span>
                <span class="ml-2 font-bold">{{ currentProperty.yearBuilt }}</span>
              </div>
            </div>

            <div class="bg-green-500 bg-opacity-20 rounded-lg p-6">
              <p class="text-2xl text-green-200">Opening Bid</p>
              <p class="text-5xl font-bold text-green-400">
                ${{ currentProperty.openingBid.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Live Bidding -->
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
          <h2 class="text-3xl font-bold mb-6">Live Bidding</h2>
          
          <!-- Current Highest Bid -->
          <div v-if="currentHighestBid" class="bg-yellow-500 bg-opacity-20 rounded-lg p-6 mb-6 animate-pulse">
            <p class="text-2xl text-yellow-200">Current Highest Bid</p>
            <p class="text-6xl font-bold text-yellow-400">
              ${{ currentHighestBid.amount.toLocaleString() }}
            </p>
            <p class="text-2xl mt-2">{{ currentHighestBid.studentName }}</p>
          </div>

          <!-- Bid History -->
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <TransitionGroup name="bid-list">
              <div 
                v-for="bid in recentBids" 
                :key="bid.id"
                class="bg-white bg-opacity-5 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p class="text-xl font-bold">{{ bid.studentName }}</p>
                  <p class="text-blue-200">Paddle #{{ getPaddleNumber(bid.studentId) }}</p>
                </div>
                <p class="text-2xl font-bold">
                  ${{ bid.amount.toLocaleString() }}
                </p>
              </div>
            </TransitionGroup>
          </div>

          <!-- Going Once/Twice/Sold Animation -->
          <div v-if="auctionStatus" class="mt-8 text-center">
            <p class="text-6xl font-bold animate-bounce" :class="auctionStatusColor">
              {{ auctionStatus }}
            </p>
          </div>
        </div>
      </div>

      <!-- Redemption Phase -->
      <div v-else-if="session?.currentPhase === 'REDEMPTION'" class="text-center py-20">
        <h2 class="text-6xl font-bold mb-8">Redemption Period</h2>
        <p class="text-3xl text-blue-200">Students negotiating with occupants...</p>
      </div>

      <!-- Complete Phase -->
      <div v-else-if="session?.currentPhase === 'COMPLETE'" class="py-8">
        <h2 class="text-5xl font-bold text-center mb-8">Auction Complete!</h2>
        
        <!-- Winners Summary -->
        <div class="grid grid-cols-3 gap-6 mb-12">
          <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <p class="text-2xl text-blue-200">Properties Sold</p>
            <p class="text-5xl font-bold">{{ winners.length }}</p>
          </div>
          <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <p class="text-2xl text-blue-200">Total Value</p>
            <p class="text-5xl font-bold">${{ totalSalesValue.toLocaleString() }}</p>
          </div>
          <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <p class="text-2xl text-blue-200">Active Bidders</p>
            <p class="text-5xl font-bold">{{ activeBidders }}</p>
          </div>
        </div>

        <!-- Top Winners -->
        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
          <h3 class="text-3xl font-bold mb-6">Top Investors</h3>
          <div class="space-y-4">
            <div 
              v-for="(winner, index) in topWinners" 
              :key="winner.studentId"
              class="flex justify-between items-center p-4 bg-white bg-opacity-5 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <span class="text-3xl font-bold">{{ index + 1 }}</span>
                <span class="text-2xl">{{ winner.name }}</span>
              </div>
              <div class="text-right">
                <p class="text-xl text-blue-200">{{ winner.propertiesWon }} properties</p>
                <p class="text-2xl font-bold">${{ winner.totalSpent.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Market Event Overlay -->
    <Transition name="fade">
      <div v-if="activeMarketEvent" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-12 max-w-4xl mx-auto animate-shake">
          <h2 class="text-5xl font-bold mb-6">📰 BREAKING NEWS</h2>
          <p class="text-3xl mb-4">{{ activeMarketEvent.title }}</p>
          <p class="text-2xl text-yellow-200">{{ activeMarketEvent.description }}</p>
        </div>
      </div>
    </Transition>

    <!-- Dramatic Reveal Overlay -->
    <Transition name="fade">
      <div v-if="activeReveal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-12 max-w-4xl mx-auto animate-pulse">
          <h2 class="text-5xl font-bold mb-6">💥 DRAMATIC REVEAL</h2>
          <p class="text-3xl">{{ activeReveal.message }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { sessionManager } from '../../classroom/sessionManager';
import type { 
  ClassroomSession, 
  StudentState, 
  AuctionProperty,
  BidRecord,
  WinnerRecord,
  MarketEvent,
  RevealedSecret
} from '../../types/auction.types';

// Props
const props = defineProps<{
  sessionCode: string;
}>();

// State
const session = ref<ClassroomSession | null>(null);
const currentProperty = ref<AuctionProperty | null>(null);
const phaseTimeRemaining = ref(0);
const auctionStatus = ref(''); // 'GOING ONCE', 'GOING TWICE', 'SOLD!'
const activeMarketEvent = ref<MarketEvent | null>(null);
const activeReveal = ref<RevealedSecret | null>(null);
const updateInterval = ref<NodeJS.Timeout | null>(null);

// Computed
const studentsResearching = computed(() => {
  if (!session.value) return 0;
  return Array.from(session.value.students.values())
    .filter(s => s.researchCredits < 30).length;
});

const activeStudents = computed(() => {
  if (!session.value) return [];
  return Array.from(session.value.students.values())
    .filter(s => s.cashWithdrawn > 0);
});

const announcementProperties = computed(() => {
  if (!session.value) return [];
  return session.value.properties.slice(0, 15); // Show first 15
});

const currentHighestBid = computed(() => {
  if (!session.value || !currentProperty.value) return null;
  const bids = session.value.publicBids
    .filter(b => b.propertyId === currentProperty.value?.id)
    .sort((a, b) => b.amount - a.amount);
  return bids[0] || null;
});

const recentBids = computed(() => {
  if (!session.value || !currentProperty.value) return [];
  return session.value.publicBids
    .filter(b => b.propertyId === currentProperty.value?.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(-5) // Show last 5 bids
    .reverse();
});

const winners = computed(() => {
  return session.value?.winners || [];
});

const totalSalesValue = computed(() => {
  return winners.value.reduce((sum, w) => sum + w.winningBid, 0);
});

const activeBidders = computed(() => {
  if (!session.value) return 0;
  const bidders = new Set(session.value.publicBids.map(b => b.studentId));
  return bidders.size;
});

const topWinners = computed(() => {
  if (!session.value) return [];
  
  const winnerMap = new Map<string, any>();
  
  session.value.winners.forEach(w => {
    if (!winnerMap.has(w.winnerId)) {
      const student = session.value!.students.get(w.winnerId);
      winnerMap.set(w.winnerId, {
        studentId: w.winnerId,
        name: student?.name || 'Unknown',
        propertiesWon: 0,
        totalSpent: 0
      });
    }
    
    const winner = winnerMap.get(w.winnerId);
    winner.propertiesWon++;
    winner.totalSpent += w.winningBid;
  });
  
  return Array.from(winnerMap.values())
    .sort((a, b) => b.propertiesWon - a.propertiesWon)
    .slice(0, 5);
});

const auctionStatusColor = computed(() => {
  if (auctionStatus.value === 'GOING ONCE') return 'text-yellow-400';
  if (auctionStatus.value === 'GOING TWICE') return 'text-orange-400';
  if (auctionStatus.value === 'SOLD!') return 'text-green-400';
  return '';
});

// Methods
function loadSession() {
  const s = sessionManager.getSession(props.sessionCode);
  if (s) {
    session.value = s;
    
    // Load current property if in bidding phase
    if (s.currentPhase === 'BIDDING' && s.currentPropertyIndex < s.properties.length) {
      currentProperty.value = s.properties[s.currentPropertyIndex];
    }
    
    // Check for recent market events
    const recentEvent = s.marketShocks[s.marketShocks.length - 1];
    if (recentEvent && Date.now() - recentEvent.timestamp.getTime() < 10000) {
      showMarketEvent(recentEvent);
    }
    
    // Check for recent reveals
    const recentReveal = s.revealedSecrets[s.revealedSecrets.length - 1];
    if (recentReveal && Date.now() - recentReveal.revealedAt.getTime() < 10000) {
      showReveal(recentReveal);
    }
  }
}

function updateTimer() {
  if (session.value) {
    phaseTimeRemaining.value = sessionManager.getPhaseTimeRemaining(props.sessionCode);
  }
}

function showMarketEvent(event: MarketEvent) {
  activeMarketEvent.value = event;
  setTimeout(() => {
    activeMarketEvent.value = null;
  }, event.duration * 1000);
}

function showReveal(reveal: RevealedSecret) {
  activeReveal.value = reveal;
  setTimeout(() => {
    activeReveal.value = null;
  }, 5000);
}

function getPaddleNumber(studentId: string): number {
  const student = session.value?.students.get(studentId);
  return student?.paddleNumber || 0;
}

function formatPhase(phase?: string): string {
  if (!phase) return '';
  return phase.replace('_', ' ');
}

function formatTime(seconds: number): string {
  if (seconds < 0) return '∞';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Lifecycle
onMounted(() => {
  loadSession();
  
  // Set up timer update
  updateInterval.value = setInterval(() => {
    updateTimer();
    loadSession(); // Also reload session data for live updates
  }, 1000);
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
});
</script>

<style scoped>
/* Animations */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Transitions */
.bid-list-enter-active,
.bid-list-leave-active {
  transition: all 0.3s ease;
}

.bid-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.bid-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>