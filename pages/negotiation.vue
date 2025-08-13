<!-- pages/negotiation.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Property Negotiations</h1>
            <p class="text-sm text-gray-600">
              Session: {{ sessionCode }} | Student: {{ studentName }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              :to="`/student-dashboard?code=${sessionCode}&student=${studentId}`"
              class="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-2 text-gray-600">
          <div class="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span>Loading negotiation data...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Negotiation</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button
            @click="loadNegotiationData"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Property Selection (if no specific property) -->
      <div v-else-if="!activeProperty && availableProperties.length > 0">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Select Property to Negotiate</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="property in availableProperties"
            :key="property.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            @click="selectProperty(property)"
          >
            <!-- Property Image -->
            <img 
              :src="property.imageUrl || '/api/placeholder/400/200'" 
              :alt="property.address"
              class="w-full h-48 object-cover rounded-t-lg"
            >
            
            <!-- Property Info -->
            <div class="p-4">
              <h3 class="font-semibold text-lg text-gray-900">{{ property.address }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ property.city }}, {{ property.neighborhood }}</p>
              
              <!-- Property Stats -->
              <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span class="text-gray-500">Beds/Baths:</span>
                  <span class="ml-1 font-medium">{{ property.bedrooms }}/{{ property.bathrooms }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Sq Ft:</span>
                  <span class="ml-1 font-medium">{{ property.squareFeet }}</span>
                </div>
              </div>

              <!-- Occupant Info -->
              <div v-if="property.occupant" class="border-t pt-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-sm">{{ property.occupant.name }}</p>
                    <p class="text-xs text-gray-500">{{ property.occupant.occupation }}</p>
                  </div>
                </div>
                
                <div class="mt-3">
                  <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {{ formatArchetype(property.occupant.archetype) }}
                  </span>
                  <span class="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Prefers: {{ formatOutcome(property.occupant.preferredOutcome) }}
                  </span>
                </div>
              </div>

              <!-- Negotiation Status -->
              <div class="mt-3 pt-3 border-t">
                <div v-if="getPropertyNegotiationStatus(property.id) === 'not-started'">
                  <span class="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                    Negotiation Required
                  </span>
                </div>
                <div v-else-if="getPropertyNegotiationStatus(property.id) === 'in-progress'">
                  <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    In Progress
                  </span>
                </div>
                <div v-else-if="getPropertyNegotiationStatus(property.id) === 'completed'">
                  <span class="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Properties Available -->
      <div v-else-if="!activeProperty && availableProperties.length === 0">
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6m-3 4h.01" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No Properties Require Negotiation</h3>
          <p class="mt-1 text-sm text-gray-500">
            Either you haven't won any properties yet, or all your properties are vacant.
          </p>
          <div class="mt-6">
            <router-link 
              :to="`/student-dashboard?code=${sessionCode}&student=${studentId}`"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Dashboard
            </router-link>
          </div>
        </div>
      </div>

      <!-- Active Negotiation -->
      <div v-else-if="activeProperty">
        <NegotiationSimulator 
          :property="activeProperty"
          :student-id="studentId"
          @complete="handleNegotiationComplete"
          @cancel="activeProperty = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionManager } from '~/features/auction/classroom/sessionManager';
import NegotiationSimulator from '~/features/auction/components/negotiation/NegotiationSimulator.vue';
import type { 
  AuctionProperty, 
  ClassroomSession, 
  StudentState,
  NegotiationOutcome 
} from '~/types/auction.types';

// Routing
const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref('');
const session = ref<ClassroomSession | null>(null);
const student = ref<StudentState | null>(null);
const activeProperty = ref<AuctionProperty | null>(null);
const negotiationAttempts = ref<any[]>([]);

// URL parameters
const sessionCode = computed(() => route.query.code as string);
const studentId = computed(() => route.query.student as string);
const propertyId = computed(() => route.query.property as string);

// Computed
const studentName = computed(() => student.value?.name || 'Unknown Student');

const availableProperties = computed(() => {
  if (!session.value || !student.value) return [];
  
  return session.value.winners
    .filter(winner => winner.winnerId === student.value?.id)
    .map(winner => winner.property)
    .filter(property => property.occupant) // Only properties with occupants need negotiation
    .filter(property => property.occupancyStatus !== 'VACANT');
});

// Methods
async function loadNegotiationData() {
  loading.value = true;
  error.value = '';
  
  try {
    // Validate required parameters
    if (!sessionCode.value || !studentId.value) {
      throw new Error('Missing required session code or student ID');
    }
    
    // Load session data
    const sessionData = sessionManager.getSession(sessionCode.value);
    if (!sessionData) {
      throw new Error('Session not found. Please check your session code.');
    }
    
    session.value = sessionData;
    
    // Load student data
    const studentData = sessionData.students.get(studentId.value);
    if (!studentData) {
      throw new Error('Student not found in this session.');
    }
    
    student.value = studentData;
    
    // If specific property ID is provided, load that property
    if (propertyId.value) {
      const property = availableProperties.value.find(p => p.id === propertyId.value);
      if (property) {
        activeProperty.value = property;
      } else {
        error.value = 'Property not found or not available for negotiation.';
      }
    }
    
    // Load any existing negotiation attempts from localStorage
    loadNegotiationHistory();
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}

function loadNegotiationHistory() {
  try {
    const key = `negotiations_${sessionCode.value}_${studentId.value}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      negotiationAttempts.value = JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Failed to load negotiation history:', err);
  }
}

function saveNegotiationHistory() {
  try {
    const key = `negotiations_${sessionCode.value}_${studentId.value}`;
    localStorage.setItem(key, JSON.stringify(negotiationAttempts.value));
  } catch (err) {
    console.warn('Failed to save negotiation history:', err);
  }
}

function selectProperty(property: AuctionProperty) {
  activeProperty.value = property;
  
  // Update URL without navigation
  const newQuery = { ...route.query, property: property.id };
  router.replace({ query: newQuery });
}

function handleNegotiationComplete(outcome: NegotiationOutcome) {
  // Save negotiation attempt
  const attempt = {
    propertyId: activeProperty.value?.id,
    studentId: studentId.value,
    startTime: new Date(),
    endTime: new Date(),
    outcome,
    inProgress: false
  };
  
  negotiationAttempts.value.push(attempt);
  saveNegotiationHistory();
  
  // Update property redemption status
  if (activeProperty.value && outcome.success) {
    activeProperty.value.redemptionStatus = 'AGREEMENT_REACHED';
  }
  
  // Return to property selection
  activeProperty.value = null;
  
  // Remove property from URL
  const newQuery = { ...route.query };
  delete newQuery.property;
  router.replace({ query: newQuery });
}

function getPropertyNegotiationStatus(propertyId: string): 'not-started' | 'in-progress' | 'completed' {
  const attempts = negotiationAttempts.value.filter(a => a.propertyId === propertyId);
  
  if (attempts.length === 0) {
    return 'not-started';
  }
  
  const latestAttempt = attempts[attempts.length - 1];
  if (latestAttempt.inProgress) {
    return 'in-progress';
  }
  
  if (latestAttempt.outcome?.success) {
    return 'completed';
  }
  
  return 'not-started'; // Failed attempts can be retried
}

function formatArchetype(archetype: string): string {
  return archetype.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatOutcome(outcome: string): string {
  return outcome.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Lifecycle
onMounted(() => {
  loadNegotiationData();
});

// Set page title
useHead({
  title: 'Property Negotiations - Our City Auctions'
});
</script>