<!-- features/auction/components/moderator/ModeratorConsole.vue -->
<template>
  <div class="moderator-console min-h-screen bg-gray-900 text-white">
    <!-- Header Bar -->
    <div class="bg-gray-800 border-b border-gray-700 p-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Moderator Console</h1>
          <p class="text-gray-400">Session: {{ session?.code }} | Phase: {{ session?.currentPhase }}</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm text-gray-400">Time Remaining</p>
            <p class="text-3xl font-mono">{{ formatTime(phaseTimeRemaining) }}</p>
          </div>
          <button 
            @click="toggleHotkeys"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Hotkeys: {{ hotkeysEnabled ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex h-[calc(100vh-80px)]">
      <!-- Left Panel: Phase Control & Current Property -->
      <div class="w-1/3 border-r border-gray-700 p-6">
        <!-- Phase Control -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Phase Control</h2>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="phase in availablePhases"
              :key="phase"
              @click="transitionToPhase(phase)"
              :class="[
                'px-4 py-3 rounded font-medium transition',
                session?.currentPhase === phase 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              ]"
              :disabled="!canTransitionTo(phase)"
            >
              {{ phase }}
            </button>
          </div>
        </div>

        <!-- Current Property (During Bidding) -->
        <div v-if="session?.currentPhase === 'BIDDING'" class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">Current Property</h3>
          <div v-if="currentProperty">
            <img 
              :src="currentProperty.imageUrl" 
              :alt="currentProperty.address"
              class="w-full h-48 object-cover rounded mb-3"
            >
            <p class="font-bold text-xl">{{ currentProperty.address }}</p>
            <p class="text-gray-400">{{ currentProperty.city }}, {{ currentProperty.neighborhood }}</p>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">Beds/Baths:</span>
                <span class="ml-2">{{ currentProperty.bedrooms }}/{{ currentProperty.bathrooms }}</span>
              </div>
              <div>
                <span class="text-gray-500">Sq Ft:</span>
                <span class="ml-2">{{ currentProperty.squareFeet }}</span>
              </div>
              <div>
                <span class="text-gray-500">Year:</span>
                <span class="ml-2">{{ currentProperty.yearBuilt }}</span>
              </div>
              <div>
                <span class="text-gray-500">Type:</span>
                <span class="ml-2">{{ currentProperty.propertyType }}</span>
              </div>
            </div>
            <div class="mt-4 p-3 bg-green-900 rounded">
              <p class="text-green-400 text-sm">Opening Bid</p>
              <p class="text-3xl font-bold">${{ currentProperty.openingBid.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- Market Events -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-3">Market Events</h3>
          <div class="space-y-2">
            <button 
              @click="triggerMarketEvent('FACTORY_CLOSING')"
              class="w-full px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-left"
            >
              🏭 Factory Closing (-20%)
            </button>
            <button 
              @click="triggerMarketEvent('NEW_DEVELOPMENT')"
              class="w-full px-3 py-2 bg-green-900 hover:bg-green-800 rounded text-left"
            >
              🏗️ New Development (+15%)
            </button>
          </div>
        </div>
      </div>

      <!-- Center Panel: Quick Bid Entry -->
      <div class="flex-1 p-6">
        <h2 class="text-xl font-semibold mb-4">Quick Bid Entry</h2>
        
        <!-- Hotkey Guide -->
        <div class="bg-gray-800 rounded p-3 mb-4 text-sm">
          <span class="text-gray-400">Hotkeys:</span>
          <span class="ml-2">1-30 = Student</span>
          <span class="ml-4">Enter = Record</span>
          <span class="ml-4">G = Going Once</span>
          <span class="ml-4">W = Going Twice</span>
          <span class="ml-4">S = Sold</span>
        </div>

        <!-- Bid Entry Form -->
        <div class="bg-gray-800 rounded-lg p-6">
          <!-- Student Selector -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">Student (Press 1-30 or select)</label>
            <div class="flex gap-2">
              <input
                v-model="studentInput"
                @keydown="handleStudentHotkey"
                placeholder="# or name"
                class="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref="studentField"
              >
              <select 
                v-model="selectedStudentId"
                class="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student</option>
                <option v-for="student in students" :key="student.id" :value="student.id">
                  #{{ student.paddleNumber }} - {{ student.name }}
                </option>
              </select>
            </div>
            <div v-if="selectedStudent" class="mt-2 text-green-400">
              Selected: {{ selectedStudent.name }} (Paddle #{{ selectedStudent.paddleNumber }})
            </div>
          </div>

          <!-- Bid Amount -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">Bid Amount</label>
            <div class="flex gap-2">
              <input
                v-model.number="bidAmount"
                @keydown.enter="recordBid"
                type="number"
                :min="minimumBid"
                :step="1000"
                placeholder="Enter amount"
                class="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref="amountField"
              >
            </div>
            <div class="flex gap-2 mt-2">
              <button
                v-for="increment in [1000, 5000, 10000, 25000]"
                :key="increment"
                @click="bidAmount = currentHighBid + increment"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                +${{ (increment/1000) }}k
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="recordBid"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
            >
              RECORD BID (Enter)
            </button>
            <button 
              @click="goingOnce"
              class="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded font-semibold"
            >
              GOING ONCE (G)
            </button>
            <button 
              @click="goingTwice"
              class="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded font-semibold"
            >
              GOING TWICE (W)
            </button>
            <button 
              @click="sold"
              class="px-6 py-3 bg-green-600 hover:bg-green-500 rounded font-semibold"
            >
              SOLD! (S)
            </button>
          </div>
        </div>

        <!-- Current Bids -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-3">Current Property Bids</h3>
          <div class="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div v-if="currentPropertyBids.length === 0" class="text-gray-500 text-center py-8">
              No bids yet
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="bid in currentPropertyBids" 
                :key="bid.id"
                :class="[
                  'flex justify-between items-center p-2 rounded',
                  bid.isWinning ? 'bg-green-900' : 'bg-gray-700'
                ]"
              >
                <span>{{ bid.studentName }}</span>
                <span class="font-bold">${{ bid.amount.toLocaleString() }}</span>
                <span class="text-sm text-gray-400">{{ formatTimestamp(bid.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dramatic Reveals -->
        <div v-if="propertyJustSold && currentProperty" class="mt-6">
          <h3 class="text-lg font-semibold mb-3">Dramatic Reveals</h3>
          <div class="flex gap-3">
            <button
              v-if="currentProperty.hiddenDamage"
              @click="revealSecret('HIDDEN_DAMAGE')"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded"
            >
              💥 Reveal Hidden Damage
            </button>
            <button
              v-if="currentProperty.occupant"
              @click="revealSecret('OCCUPANT_STORY')"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
            >
              👥 Reveal Occupant
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Student List & Winners -->
      <div class="w-1/3 border-l border-gray-700 p-6">
        <!-- Student List -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">Students ({{ students.length }})</h3>
          <div class="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div class="space-y-2">
              <div 
                v-for="student in students" 
                :key="student.id"
                class="flex justify-between items-center p-2 bg-gray-700 rounded"
              >
                <div>
                  <span class="font-medium">#{{ student.paddleNumber }}</span>
                  <span class="ml-2">{{ student.name }}</span>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-400">Cash</p>
                  <p class="font-mono">${{ student.cashAvailable.toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Winners Board -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Properties Sold ({{ winners.length }})</h3>
          <div class="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div v-if="winners.length === 0" class="text-gray-500 text-center py-8">
              No properties sold yet
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="winner in winners" 
                :key="winner.propertyId"
                class="p-3 bg-gray-700 rounded"
              >
                <p class="font-medium">{{ winner.property.address }}</p>
                <p class="text-sm text-gray-400">{{ winner.property.city }}</p>
                <div class="mt-2 flex justify-between">
                  <span class="text-green-400">{{ winner.winnerName }}</span>
                  <span class="font-bold">${{ winner.winningBid.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  GamePhase
} from '../../types/auction.types';

// Props
const props = defineProps<{
  sessionCode: string;
}>();

// State
const session = ref<ClassroomSession | null>(null);
const students = ref<StudentState[]>([]);
const currentProperty = ref<AuctionProperty | null>(null);
const selectedStudentId = ref('');
const studentInput = ref('');
const bidAmount = ref(0);
const hotkeysEnabled = ref(true);
const propertyJustSold = ref(false);
const phaseTimeRemaining = ref(0);
const updateInterval = ref<NodeJS.Timeout | null>(null);

// Refs
const studentField = ref<HTMLInputElement>();
const amountField = ref<HTMLInputElement>();

// Computed
const availablePhases = computed(() => [
  'LOBBY', 'PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE'
] as GamePhase[]);

const selectedStudent = computed(() => {
  if (!selectedStudentId.value || !session.value) return null;
  return session.value.students.get(selectedStudentId.value);
});

const currentPropertyBids = computed(() => {
  if (!session.value || !currentProperty.value) return [];
  return session.value.publicBids
    .filter(bid => bid.propertyId === currentProperty.value?.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
});

const currentHighBid = computed(() => {
  const bids = currentPropertyBids.value;
  return bids.length > 0 ? bids[0].amount : currentProperty.value?.openingBid || 0;
});

const minimumBid = computed(() => {
  return currentHighBid.value + (session.value?.settings.bidIncrement || 1000);
});

const winners = computed(() => {
  return session.value?.winners || [];
});

// Methods
function loadSession() {
  const s = sessionManager.getSession(props.sessionCode);
  if (s) {
    session.value = s;
    students.value = Array.from(s.students.values());
    
    // Load current property if in bidding phase
    if (s.currentPhase === 'BIDDING' && s.currentPropertyIndex < s.properties.length) {
      currentProperty.value = s.properties[s.currentPropertyIndex];
    }
  }
}

function updateTimer() {
  if (session.value) {
    phaseTimeRemaining.value = sessionManager.getPhaseTimeRemaining(props.sessionCode);
  }
}

function transitionToPhase(phase: GamePhase) {
  if (sessionManager.transitionPhase(props.sessionCode, phase)) {
    loadSession();
    console.log(`Transitioned to ${phase}`);
  }
}

function canTransitionTo(phase: GamePhase): boolean {
  if (!session.value) return false;
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    'LOBBY': ['PREVIEW'],
    'PREVIEW': ['ANNOUNCEMENT'],
    'ANNOUNCEMENT': ['BANKING'],
    'BANKING': ['BIDDING'],
    'BIDDING': ['REDEMPTION'],
    'REDEMPTION': ['COMPLETE'],
    'COMPLETE': ['LOBBY']
  };
  return validTransitions[session.value.currentPhase]?.includes(phase) || false;
}

function handleStudentHotkey(event: KeyboardEvent) {
  if (!hotkeysEnabled.value) return;
  
  // Numbers 1-30 select students
  if (event.key >= '0' && event.key <= '9') {
    const input = studentInput.value + event.key;
    const num = parseInt(input);
    if (num <= 30) {
      const student = students.value.find(s => s.paddleNumber === num);
      if (student) {
        selectedStudentId.value = student.id;
        studentInput.value = '';
        amountField.value?.focus();
        event.preventDefault();
      }
    }
  }
}

function recordBid() {
  if (!selectedStudentId.value || !bidAmount.value || !currentProperty.value) {
    alert('Please select a student and enter a bid amount');
    return;
  }
  
  const bid = sessionManager.recordBid(
    props.sessionCode,
    currentProperty.value.id,
    selectedStudentId.value,
    bidAmount.value
  );
  
  if (bid) {
    console.log(`Recorded bid: ${bid.studentName} - ${bid.amount}`);
    loadSession();
    
    // Clear form for next bid
    selectedStudentId.value = '';
    studentInput.value = '';
    bidAmount.value = minimumBid.value;
    studentField.value?.focus();
  }
}

function goingOnce() {
  console.log('Going once...');
  // Could trigger visual/audio cue
}

function goingTwice() {
  console.log('Going twice...');
  // Could trigger visual/audio cue
}

function sold() {
  if (currentPropertyBids.value.length === 0) {
    alert('No bids to finalize');
    return;
  }
  
  const winningBid = currentPropertyBids.value[0];
  const sale = sessionManager.finalizeSale(
    props.sessionCode,
    currentProperty.value!.id,
    winningBid.studentId,
    winningBid.amount,
    true // Assume cash verified for now
  );
  
  if (sale) {
    console.log(`SOLD to ${sale.winnerName} for ${sale.winningBid}`);
    propertyJustSold.value = true;
    
    // Move to next property after delay
    setTimeout(() => {
      propertyJustSold.value = false;
      if (session.value && session.value.currentPropertyIndex < session.value.properties.length) {
        currentProperty.value = session.value.properties[session.value.currentPropertyIndex];
      } else {
        currentProperty.value = null;
      }
      loadSession();
    }, 3000);
  }
}

function revealSecret(type: 'HIDDEN_DAMAGE' | 'OCCUPANT_STORY') {
  if (!currentProperty.value) return;
  
  const secret = sessionManager.revealSecret(
    props.sessionCode,
    currentProperty.value.id,
    type
  );
  
  if (secret) {
    alert(secret.message);
    // In production, this would trigger a dramatic visual on the projector
  }
}

function triggerMarketEvent(type: string) {
  // For demo, affect current property's city
  const cities = currentProperty.value ? [currentProperty.value.city] : ['Detroit'];
  const impact = type === 'FACTORY_CLOSING' ? -20 : 15;
  
  const event = sessionManager.triggerMarketShock(
    props.sessionCode,
    type as any,
    cities,
    impact
  );
  
  if (event) {
    alert(`Market Event: ${event.title}\n${event.description}`);
    loadSession();
  }
}

function toggleHotkeys() {
  hotkeysEnabled.value = !hotkeysEnabled.value;
}

function formatTime(seconds: number): string {
  if (seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatTimestamp(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString();
}

// Global hotkeys
function handleGlobalHotkey(event: KeyboardEvent) {
  if (!hotkeysEnabled.value || event.target instanceof HTMLInputElement) return;
  
  switch(event.key.toLowerCase()) {
    case 'g':
      goingOnce();
      break;
    case 'w':
      goingTwice();
      break;
    case 's':
      sold();
      break;
  }
}

// Lifecycle
onMounted(() => {
  loadSession();
  
  // Set up timer update
  updateInterval.value = setInterval(updateTimer, 1000);
  
  // Set up global hotkeys
  document.addEventListener('keydown', handleGlobalHotkey);
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
  document.removeEventListener('keydown', handleGlobalHotkey);
});
</script>

<style scoped>
.moderator-console {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>