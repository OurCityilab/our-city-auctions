<!-- features/auction/components/student/StudentDashboard.vue -->
<template>
  <div class="student-dashboard min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Property Research Center</h1>
            <p class="text-sm text-gray-600">
              Session: {{ session?.code }} | Phase: {{ session?.currentPhase }}
            </p>
          </div>
          <div class="flex items-center space-x-6">
            <!-- Research Credits -->
            <div class="text-center">
              <p class="text-sm text-gray-500">Research Credits</p>
              <p class="text-2xl font-bold text-blue-600">{{ student?.researchCredits || 0 }}/30</p>
            </div>
            <!-- Cash Available -->
            <div class="text-center">
              <p class="text-sm text-gray-500">Cash Available</p>
              <p class="text-2xl font-bold text-green-600">
                ${{ (student?.cashAvailable || 0).toLocaleString() }}
              </p>
            </div>
            <!-- Phase Timer -->
            <div class="text-center">
              <p class="text-sm text-gray-500">Time Remaining</p>
              <p class="text-2xl font-mono">{{ formatTime(phaseTimeRemaining) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-12 gap-6">
        <!-- Left Sidebar: Draft Board -->
        <div class="col-span-3">
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">My Draft Board</h2>
            
            <!-- Draft Instructions -->
            <div v-if="draftBoard.length === 0" class="text-sm text-gray-500 mb-4">
              Drag properties here to create your priority list
            </div>

            <!-- Draggable Draft List -->
            <draggable 
              v-model="draftBoard" 
              group="properties"
              item-key="id"
              class="space-y-2"
            >
              <template #item="{element, index}">
                <div class="bg-gray-50 rounded p-3 cursor-move hover:bg-gray-100">
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-sm">{{ index + 1 }}.</span>
                    <button 
                      @click="removeFromDraft(element.id)"
                      class="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p class="font-medium text-sm">{{ element.address }}</p>
                  <p class="text-xs text-gray-500">{{ element.city }}</p>
                  
                  <!-- Max Bid Input -->
                  <div class="mt-2">
                    <label class="text-xs text-gray-500">Max Bid</label>
                    <input
                      v-model.number="element.maxBid"
                      type="number"
                      placeholder="Enter max bid"
                      class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                  </div>
                  
                  <!-- Confidence Slider -->
                  <div class="mt-2">
                    <label class="text-xs text-gray-500">
                      Confidence: {{ element.confidence || 3 }}/5
                    </label>
                    <input
                      v-model.number="element.confidence"
                      type="range"
                      min="1"
                      max="5"
                      class="w-full"
                    >
                  </div>
                </div>
              </template>
            </draggable>

            <!-- Draft Statistics -->
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-600">
                Properties Selected: {{ draftBoard.length }}
              </p>
              <p class="text-sm text-gray-600">
                Total Max Bids: ${{ totalMaxBids.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Center: Property Grid -->
        <div class="col-span-6">
          <!-- Filter Bar -->
          <div class="bg-white rounded-lg shadow p-4 mb-4">
            <div class="grid grid-cols-3 gap-3">
              <select 
                v-model="filters.city"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                <option v-for="city in cities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
              
              <select 
                v-model="filters.status"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="researched">Researched</option>
                <option value="not-researched">Not Researched</option>
              </select>
              
              <select 
                v-model="sortBy"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="address">Sort by Address</option>
                <option value="city">Sort by City</option>
                <option value="openingBid">Sort by Opening Bid</option>
              </select>
            </div>
          </div>

          <!-- Property Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="property in filteredProperties"
              :key="property.id"
              draggable="true"
              @dragstart="handleDragStart($event, property)"
              class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              @click="selectProperty(property)"
            >
              <!-- Property Image -->
              <img 
                :src="property.imageUrl || '/api/placeholder/400/200'" 
                :alt="property.address"
                class="w-full h-32 object-cover rounded-t-lg"
              >
              
              <!-- Property Info -->
              <div class="p-4">
                <h3 class="font-semibold text-sm">{{ property.address }}</h3>
                <p class="text-xs text-gray-500">{{ property.city }}, {{ property.neighborhood }}</p>
                
                <!-- Property Stats -->
                <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <span class="text-gray-500">Beds/Baths:</span>
                    <span class="ml-1 font-medium">{{ property.bedrooms }}/{{ property.bathrooms }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Sq Ft:</span>
                    <span class="ml-1 font-medium">{{ property.squareFeet }}</span>
                  </div>
                </div>

                <!-- Research Status -->
                <div class="mt-3">
                  <div v-if="isResearched(property.id)" class="space-y-1">
                    <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Researched
                    </span>
                    
                    <!-- Show discovered info -->
                    <div v-if="getDiscoveredInfo(property.id, 'occupancy')">
                      <span class="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {{ getDiscoveredInfo(property.id, 'occupancy') }}
                      </span>
                    </div>
                    
                    <div v-if="getDiscoveredInfo(property.id, 'liens')">
                      <span class="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        Liens: ${{ getDiscoveredInfo(property.id, 'liens').toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    v-else
                    @click.stop="openResearchModal(property)"
                    class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
                  >
                    Research Property
                  </button>
                </div>

                <!-- Opening Bid (if revealed) -->
                <div v-if="session?.currentPhase !== 'PREVIEW' && property.openingBid" class="mt-3 p-2 bg-green-50 rounded">
                  <p class="text-xs text-gray-500">Opening Bid</p>
                  <p class="text-lg font-bold text-green-600">
                    ${{ property.openingBid.toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Analysis Tools -->
        <div class="col-span-3">
          <!-- Underwriting Calculator -->
          <div class="bg-white rounded-lg shadow p-4 mb-4">
            <h2 class="text-lg font-semibold mb-4">Quick Analysis</h2>
            
            <div v-if="selectedProperty" class="space-y-3">
              <div>
                <p class="font-medium text-sm">{{ selectedProperty.address }}</p>
                <p class="text-xs text-gray-500">{{ selectedProperty.city }}</p>
              </div>

              <!-- Purchase Price Input -->
              <div>
                <label class="text-sm text-gray-600">Purchase Price</label>
                <input
                  v-model.number="analysis.purchasePrice"
                  type="number"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>

              <!-- Renovation Cost Input -->
              <div>
                <label class="text-sm text-gray-600">Est. Renovation Cost</label>
                <input
                  v-model.number="analysis.renovationCost"
                  type="number"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>

              <!-- Strategy Selection -->
              <div>
                <label class="text-sm text-gray-600">Investment Strategy</label>
                <select 
                  v-model="analysis.strategy"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="rental">Rental</option>
                  <option value="flip">Fix & Flip</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>

              <!-- Strategy-Specific Inputs -->
              <div v-if="analysis.strategy === 'rental'">
                <label class="text-sm text-gray-600">Monthly Rent</label>
                <input
                  v-model.number="analysis.monthlyRent"
                  type="number"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>

              <div v-if="analysis.strategy === 'flip'">
                <label class="text-sm text-gray-600">After Repair Value (ARV)</label>
                <input
                  v-model.number="analysis.arv"
                  type="number"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>

              <!-- ROI Calculation -->
              <div class="pt-3 border-t">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Investment:</span>
                    <span class="font-medium">${{ totalInvestment.toLocaleString() }}</span>
                  </div>
                  
                  <div v-if="analysis.strategy === 'rental'" class="flex justify-between">
                    <span class="text-gray-600">Annual Income:</span>
                    <span class="font-medium">${{ (analysis.monthlyRent * 12).toLocaleString() }}</span>
                  </div>
                  
                  <div v-if="analysis.strategy === 'rental'" class="flex justify-between">
                    <span class="text-gray-600">Cap Rate:</span>
                    <span class="font-bold text-green-600">{{ capRate.toFixed(2) }}%</span>
                  </div>
                  
                  <div v-if="analysis.strategy === 'flip'" class="flex justify-between">
                    <span class="text-gray-600">Profit:</span>
                    <span class="font-bold text-green-600">
                      ${{ (analysis.arv - totalInvestment).toLocaleString() }}
                    </span>
                  </div>
                </div>

                <!-- Max Bid Recommendation -->
                <div class="mt-4 p-3 bg-blue-50 rounded">
                  <p class="text-sm text-gray-600">Recommended Max Bid</p>
                  <p class="text-xl font-bold text-blue-600">${{ recommendedMaxBid.toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-400">
              Select a property to analyze
            </div>
          </div>

          <!-- Properties Won -->
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">My Properties</h2>
            
            <div v-if="myProperties.length === 0" class="text-center py-8 text-gray-400">
              No properties won yet
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="property in myProperties" 
                :key="property.id"
                class="p-3 bg-gray-50 rounded"
              >
                <p class="font-medium text-sm">{{ property.address }}</p>
                <p class="text-xs text-gray-500">{{ property.city }}</p>
                <p class="text-sm font-bold text-green-600 mt-1">
                  Won for: ${{ property.winningBid.toLocaleString() }}
                </p>
                
                <!-- Negotiation Status -->
                <div v-if="property.occupant" class="mt-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-600">Occupant: {{ property.occupant.name }}</span>
                    <span 
                      class="px-2 py-1 text-xs rounded"
                      :class="getNegotiationStatusColor(property.redemptionStatus)"
                    >
                      {{ formatRedemptionStatus(property.redemptionStatus) }}
                    </span>
                  </div>
                  
                  <router-link 
                    v-if="property.redemptionStatus !== 'AGREEMENT_REACHED'"
                    :to="`/negotiation?code=${sessionCode}&student=${studentId}&property=${property.id}`"
                    class="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Start Negotiation →
                  </router-link>
                </div>
                <div v-else class="mt-2">
                  <span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    Vacant - No negotiation needed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Negotiations Summary -->
          <div class="bg-white rounded-lg shadow p-4 mt-4">
            <h2 class="text-lg font-semibold mb-4">Negotiations</h2>
            
            <div v-if="negotiationsAvailable.length === 0" class="text-center py-4 text-gray-400">
              No properties require negotiation
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="property in negotiationsAvailable" 
                :key="property.id"
                class="p-3 bg-yellow-50 border border-yellow-200 rounded"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-sm">{{ property.address }}</p>
                    <p class="text-xs text-gray-600">Occupant: {{ property.occupant.name }}</p>
                    <p class="text-xs text-gray-500">{{ property.occupant.archetype.replace(/([A-Z])/g, ' $1') }}</p>
                  </div>
                  <div class="text-right">
                    <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      {{ formatPreferredOutcome(property.occupant.preferredOutcome) }}
                    </span>
                  </div>
                </div>
                
                <router-link 
                  :to="`/negotiation?code=${sessionCode}&student=${studentId}&property=${property.id}`"
                  class="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  Begin Negotiation →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Research Modal -->
    <TransitionRoot :show="showResearchModal" as="template">
      <Dialog @close="showResearchModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-30" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <DialogTitle class="text-lg font-semibold mb-4">
                  Research Property: {{ researchTarget?.address }}
                </DialogTitle>

                <div class="space-y-4">
                  <!-- Research Options -->
                  <div class="grid grid-cols-2 gap-4">
                    <div 
                      v-for="option in researchOptions"
                      :key="option.id"
                      class="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                      :class="{
                        'opacity-50 cursor-not-allowed': !canAffordResearch(option.cost),
                        'border-blue-500 bg-blue-50': selectedResearchOption === option.id
                      }"
                      @click="selectResearchOption(option)"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h3 class="font-medium">{{ option.name }}</h3>
                        <span class="px-2 py-1 text-xs bg-gray-100 rounded">
                          {{ option.cost }} credits
                        </span>
                      </div>
                      <p class="text-sm text-gray-600">{{ option.description }}</p>
                      <div class="mt-2">
                        <p class="text-xs text-gray-500">Reveals:</p>
                        <p class="text-xs font-medium">{{ option.reveals.join(', ') }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Research Button -->
                  <div class="flex justify-between items-center pt-4 border-t">
                    <p class="text-sm text-gray-600">
                      Credits Available: {{ student?.researchCredits || 0 }}
                    </p>
                    <div class="space-x-3">
                      <button
                        @click="showResearchModal = false"
                        class="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        @click="performResearch"
                        :disabled="!selectedResearchOption"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                      >
                        Research Property
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { sessionManager } from '../../classroom/sessionManager';
import type { 
  ClassroomSession, 
  StudentState, 
  AuctionProperty,
  ResearchOption
} from '../../types/auction.types';

// Props
const props = defineProps<{
  sessionCode: string;
  studentId: string;
}>();

// State
const session = ref<ClassroomSession | null>(null);
const student = ref<StudentState | null>(null);
const properties = ref<AuctionProperty[]>([]);
const draftBoard = ref<any[]>([]);
const selectedProperty = ref<AuctionProperty | null>(null);
const showResearchModal = ref(false);
const researchTarget = ref<AuctionProperty | null>(null);
const selectedResearchOption = ref<string>('');
const phaseTimeRemaining = ref(0);
const updateInterval = ref<NodeJS.Timeout | null>(null);

// Filters
const filters = ref({
  city: '',
  status: ''
});
const sortBy = ref('address');

// Analysis state
const analysis = ref({
  purchasePrice: 0,
  renovationCost: 0,
  strategy: 'rental',
  monthlyRent: 0,
  arv: 0
});

// Research options
const researchOptions: ResearchOption[] = [
  {
    id: 'quickPeek',
    name: 'Quick Peek',
    cost: 1,
    reveals: ['occupancy', 'visible condition'],
    description: 'Basic property information'
  },
  {
    id: 'publicRecords',
    name: 'Public Records',
    cost: 2,
    reveals: ['liens', 'debt', 'ownership'],
    description: 'Official records and liens'
  },
  {
    id: 'deepDive',
    name: 'Deep Investigation',
    cost: 3,
    reveals: ['hidden issues', 'redemption status'],
    description: 'Comprehensive property analysis'
  },
  {
    id: 'occupantContact',
    name: 'Contact Occupant',
    cost: 2,
    reveals: ['interior condition', 'cooperation level'],
    description: 'Attempt to reach current occupant (30-70% success rate)'
  }
];

// Computed
const cities = computed(() => {
  const uniqueCities = new Set(properties.value.map(p => p.city));
  return Array.from(uniqueCities).sort();
});

const filteredProperties = computed(() => {
  let filtered = [...properties.value];
  
  if (filters.value.city) {
    filtered = filtered.filter(p => p.city === filters.value.city);
  }
  
  if (filters.value.status === 'researched') {
    filtered = filtered.filter(p => isResearched(p.id));
  } else if (filters.value.status === 'not-researched') {
    filtered = filtered.filter(p => !isResearched(p.id));
  }
  
  // Sort
  filtered.sort((a, b) => {
    if (sortBy.value === 'address') return a.address.localeCompare(b.address);
    if (sortBy.value === 'city') return a.city.localeCompare(b.city);
    if (sortBy.value === 'openingBid') return (a.openingBid || 0) - (b.openingBid || 0);
    return 0;
  });
  
  return filtered;
});

const totalMaxBids = computed(() => {
  return draftBoard.value.reduce((sum, item) => sum + (item.maxBid || 0), 0);
});

const totalInvestment = computed(() => {
  return (analysis.value.purchasePrice || 0) + (analysis.value.renovationCost || 0);
});

const capRate = computed(() => {
  if (!totalInvestment.value) return 0;
  const annualIncome = (analysis.value.monthlyRent || 0) * 12;
  const annualExpenses = annualIncome * 0.4; // Assume 40% expenses
  const noi = annualIncome - annualExpenses;
  return (noi / totalInvestment.value) * 100;
});

const recommendedMaxBid = computed(() => {
  if (analysis.value.strategy === 'rental') {
    // Based on cap rate target of 8%
    const targetCap = 0.08;
    const annualIncome = (analysis.value.monthlyRent || 0) * 12;
    const noi = annualIncome * 0.6; // 60% NOI
    const maxTotal = noi / targetCap;
    return Math.floor(maxTotal - (analysis.value.renovationCost || 0));
  } else if (analysis.value.strategy === 'flip') {
    // 20% profit margin target
    const maxTotal = (analysis.value.arv || 0) * 0.7; // 70% rule
    return Math.floor(maxTotal - (analysis.value.renovationCost || 0));
  }
  return 0;
});

const myProperties = computed(() => {
  if (!session.value || !student.value) return [];
  return session.value.winners
    .filter(w => w.winnerId === student.value?.id)
    .map(w => ({
      ...w.property,
      winningBid: w.winningBid
    }));
});

const negotiationsAvailable = computed(() => {
  return myProperties.value.filter(property => 
    property.occupant && 
    property.occupancyStatus !== 'VACANT' && 
    property.redemptionStatus !== 'AGREEMENT_REACHED'
  );
});

// Methods
function loadSession() {
  const s = sessionManager.getSession(props.sessionCode);
  if (s) {
    session.value = s;
    properties.value = s.properties;
    student.value = s.students.get(props.studentId) || null;
  }
}

function updateTimer() {
  if (session.value) {
    phaseTimeRemaining.value = sessionManager.getPhaseTimeRemaining(props.sessionCode);
  }
}

function selectProperty(property: AuctionProperty) {
  selectedProperty.value = property;
  analysis.value.purchasePrice = property.openingBid || 0;
}

function openResearchModal(property: AuctionProperty) {
  researchTarget.value = property;
  selectedResearchOption.value = '';
  showResearchModal.value = true;
}

function selectResearchOption(option: ResearchOption) {
  if (canAffordResearch(option.cost)) {
    selectedResearchOption.value = option.id;
  }
}

function canAffordResearch(cost: number): boolean {
  return (student.value?.researchCredits || 0) >= cost;
}

function performResearch() {
  if (!selectedResearchOption.value || !researchTarget.value || !student.value) return;
  
  const option = researchOptions.find(o => o.id === selectedResearchOption.value);
  if (!option || !canAffordResearch(option.cost)) return;
  
  // Deduct credits
  student.value.researchCredits -= option.cost;
  
  // Mark property as researched
  researchTarget.value.researchedBy.add(student.value.id);
  
  // Simulate discovering information
  const info: Record<string, any> = {};
  
  if (option.id === 'quickPeek') {
    info.occupancy = researchTarget.value.occupancyStatus;
    info.condition = researchTarget.value.renovationLevel;
  } else if (option.id === 'publicRecords') {
    info.liens = researchTarget.value.primaryLien + (researchTarget.value.secondaryLien || 0);
    info.hasSecondLien = !!researchTarget.value.secondaryLien;
  } else if (option.id === 'deepDive') {
    info.hiddenDamage = researchTarget.value.hiddenDamage;
    info.redemptionStatus = researchTarget.value.redemptionStatus;
  } else if (option.id === 'occupantContact') {
    // Simulate success/failure
    const success = Math.random() < 0.5;
    if (success && researchTarget.value.occupant) {
      info.occupant = researchTarget.value.occupant;
      info.contactSuccess = true;
    } else {
      info.contactSuccess = false;
    }
  }
  
  // Store discovered info
  researchTarget.value.discoveredInfo.set(student.value.id, {
    studentId: student.value.id,
    timestamp: new Date(),
    researchType: option.id as any,
    dataRevealed: info,
    creditsSpent: option.cost,
    sharedWithAlliance: false
  });
  
  // Save to session
  sessionManager.getSession(props.sessionCode);
  
  showResearchModal.value = false;
  loadSession(); // Refresh data
}

function isResearched(propertyId: string): boolean {
  const property = properties.value.find(p => p.id === propertyId);
  return property?.researchedBy.has(props.studentId) || false;
}

function getDiscoveredInfo(propertyId: string, key: string): any {
  const property = properties.value.find(p => p.id === propertyId);
  const info = property?.discoveredInfo.get(props.studentId);
  return info?.dataRevealed[key];
}

function handleDragStart(event: DragEvent, property: AuctionProperty) {
  event.dataTransfer!.effectAllowed = 'copy';
  event.dataTransfer!.setData('property', JSON.stringify(property));
}

function removeFromDraft(propertyId: string) {
  draftBoard.value = draftBoard.value.filter(item => item.id !== propertyId);
}

function formatTime(seconds: number): string {
  if (seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatRedemptionStatus(status: string): string {
  switch (status) {
    case 'NONE': return 'Pending';
    case 'IN_NEGOTIATION': return 'In Progress';
    case 'AGREEMENT_REACHED': return 'Completed';
    default: return status;
  }
}

function formatPreferredOutcome(outcome: string): string {
  return outcome.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getNegotiationStatusColor(status: string): string {
  switch (status) {
    case 'NONE': return 'bg-yellow-100 text-yellow-800';
    case 'IN_NEGOTIATION': return 'bg-blue-100 text-blue-800';
    case 'AGREEMENT_REACHED': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Lifecycle
onMounted(() => {
  loadSession();
  
  // Set up timer update
  updateInterval.value = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
});
</script>

<style scoped>
/* Custom styles for drag and drop */
.draggable-ghost {
  opacity: 0.5;
}

.draggable-drag {
  opacity: 0;
}
</style>