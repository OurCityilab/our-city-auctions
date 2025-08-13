<!-- features/auction/components/negotiation/NegotiationSimulator.vue -->
<template>
  <div class="negotiation-simulator bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold mb-2">Negotiating for {{ property.address }}</h2>
          <p class="text-blue-100">{{ property.city }}, {{ property.neighborhood }}</p>
        </div>
        <button
          @click="$emit('cancel')"
          class="text-white hover:text-gray-200 transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex h-[600px]" v-if="!negotiationComplete">
      <!-- Left Panel: Occupant Profile -->
      <div class="w-1/3 border-r border-gray-200 p-6 bg-gray-50">
        <div class="text-center mb-6">
          <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">{{ occupant.name }}</h3>
          <p class="text-sm text-gray-600">{{ occupant.occupation }}</p>
        </div>

        <!-- Profile Details -->
        <div class="space-y-4">
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Demographics</h4>
            <div class="text-sm space-y-1">
              <p><span class="text-gray-600">Age:</span> {{ occupant.age }}</p>
              <p><span class="text-gray-600">Family Size:</span> {{ occupant.familySize }}</p>
              <p><span class="text-gray-600">Monthly Income:</span> ${{ occupant.monthlyIncome.toLocaleString() }}</p>
              <p><span class="text-gray-600">Months Behind:</span> {{ occupant.monthsDelinquent }}</p>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Situation</h4>
            <p class="text-sm text-gray-700 leading-relaxed">{{ occupant.story }}</p>
          </div>

          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Preferred Outcome</h4>
            <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {{ formatOutcome(occupant.preferredOutcome) }}
            </span>
          </div>
        </div>

        <!-- Trust and Stress Meters -->
        <div class="mt-6 space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Trust Level</span>
              <span class="text-sm text-gray-600">{{ trustLevel }}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500"
                :class="trustColor"
                :style="{ width: `${(trustLevel / 10) * 100}%` }"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Stress Level</span>
              <span class="text-sm text-gray-600">{{ stressLevel }}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500"
                :class="stressColor"
                :style="{ width: `${(stressLevel / 10) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Conversation -->
      <div class="flex-1 flex flex-col">
        <!-- Conversation History -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- Round Display -->
          <div class="text-center text-sm text-gray-500 mb-4">
            Round {{ currentRound + 1 }} of {{ maxRounds }}
          </div>

          <!-- Conversation Messages -->
          <div v-for="(round, index) in completedRounds" :key="index" class="space-y-3">
            <!-- Occupant Statement -->
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1 bg-gray-100 rounded-lg p-3">
                <p class="text-gray-900">{{ round.occupantStatement }}</p>
              </div>
            </div>

            <!-- Player Response (if chosen) -->
            <div v-if="round.playerChoice" class="flex items-start space-x-3 justify-end">
              <div class="flex-1 bg-blue-500 text-white rounded-lg p-3 max-w-lg">
                <p>{{ round.playerChoice.text }}</p>
                <div class="mt-2 flex items-center space-x-2">
                  <span class="px-2 py-1 bg-blue-400 rounded text-xs">
                    {{ formatApproach(round.playerChoice.approach) }}
                  </span>
                  <span v-if="round.trustChange !== 0" class="text-xs">
                    Trust {{ round.trustChange > 0 ? '+' : '' }}{{ round.trustChange }}
                  </span>
                  <span v-if="round.stressChange !== 0" class="text-xs">
                    Stress {{ round.stressChange > 0 ? '+' : '' }}{{ round.stressChange }}
                  </span>
                </div>
              </div>
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Occupant Response -->
            <div v-if="round.occupantResponse" class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1 bg-gray-100 rounded-lg p-3">
                <p class="text-gray-900">{{ round.occupantResponse }}</p>
              </div>
            </div>

            <!-- Educational Note -->
            <div v-if="round.educationalNote" class="bg-yellow-50 border-l-4 border-yellow-400 p-3 ml-11">
              <p class="text-sm text-yellow-800">{{ round.educationalNote }}</p>
            </div>
          </div>

          <!-- Current Round -->
          <div v-if="currentRoundData && !awaitingResponse" class="space-y-3">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1 bg-gray-100 rounded-lg p-3">
                <p class="text-gray-900">{{ currentRoundData.occupantStatement }}</p>
              </div>
            </div>
          </div>

          <!-- Response Processing -->
          <div v-if="awaitingResponse" class="flex items-center justify-center py-4">
            <div class="flex items-center space-x-2 text-gray-600">
              <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Processing response...</span>
            </div>
          </div>
        </div>

        <!-- Response Options -->
        <div v-if="currentRoundData && !awaitingResponse" class="border-t border-gray-200 p-6">
          <h4 class="font-semibold text-gray-900 mb-4">How do you respond?</h4>
          <div class="space-y-3">
            <button
              v-for="option in currentRoundData.playerOptions"
              :key="option.id"
              @click="selectResponse(option)"
              :disabled="option.disabled"
              class="w-full text-left p-4 border rounded-lg transition-colors"
              :class="{
                'border-gray-200 hover:border-blue-300 hover:bg-blue-50': !option.disabled,
                'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed': option.disabled
              }"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium" :class="option.disabled ? 'text-gray-400' : 'text-gray-900'">
                  {{ formatApproach(option.approach) }} Approach
                </span>
                <span 
                  class="px-2 py-1 text-xs rounded"
                  :class="getApproachColor(option.approach)"
                >
                  {{ option.approach }}
                </span>
              </div>
              <p class="text-sm" :class="option.disabled ? 'text-gray-400' : 'text-gray-700'">
                "{{ option.text }}"
              </p>
              <div v-if="option.disabled && option.disabledReason" class="mt-2 text-xs text-red-500">
                {{ option.disabledReason }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Negotiation Complete -->
    <div v-else class="p-8">
      <NegotiationResults 
        :outcome="finalOutcome"
        :property="property"
        :occupant="occupant"
        @restart="restartNegotiation"
        @complete="$emit('complete', finalOutcome)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NegotiationEngine } from '../../core/negotiationEngine';
import NegotiationResults from './NegotiationResults.vue';
import type { 
  AuctionProperty, 
  OccupantProfile, 
  NegotiationApproach,
  NegotiationOutcome 
} from '../../../types/auction.types';

// Props
const props = defineProps<{
  property: AuctionProperty;
  studentId: string;
}>();

// Emits
const emit = defineEmits<{
  complete: [outcome: NegotiationOutcome];
  cancel: [];
}>();

// State
const negotiationEngine = ref<NegotiationEngine | null>(null);
const currentRoundData = ref<any>(null);
const completedRounds = ref<any[]>([]);
const awaitingResponse = ref(false);
const negotiationComplete = ref(false);
const finalOutcome = ref<NegotiationOutcome | null>(null);

// Computed
const occupant = computed(() => props.property.occupant!);
const maxRounds = 5;

const currentRound = computed(() => {
  return negotiationEngine.value?.getState().currentRound || 0;
});

const trustLevel = computed(() => {
  return negotiationEngine.value?.getState().trustLevel || 5;
});

const stressLevel = computed(() => {
  return negotiationEngine.value?.getState().stressLevel || 5;
});

const trustColor = computed(() => {
  if (trustLevel.value <= 3) return 'bg-red-500';
  if (trustLevel.value <= 6) return 'bg-yellow-500';
  return 'bg-green-500';
});

const stressColor = computed(() => {
  if (stressLevel.value <= 3) return 'bg-green-500';
  if (stressLevel.value <= 6) return 'bg-yellow-500';
  return 'bg-red-500';
});

// Methods
function initializeNegotiation() {
  if (!occupant.value) {
    console.error('No occupant found for property');
    return;
  }

  negotiationEngine.value = new NegotiationEngine(occupant.value);
  currentRoundData.value = negotiationEngine.value.startNegotiation();
}

async function selectResponse(option: any) {
  if (!negotiationEngine.value || option.disabled) return;

  awaitingResponse.value = true;

  // Add slight delay for realism
  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = negotiationEngine.value.processChoice(option.id);
  
  // Add the completed round
  const completedRound = {
    ...currentRoundData.value,
    playerChoice: option,
    occupantResponse: result.response,
    trustChange: result.trustChange,
    stressChange: result.stressChange,
    educationalNote: result.educationalNote
  };
  
  completedRounds.value.push(completedRound);

  if (result.outcome) {
    // Negotiation is complete
    finalOutcome.value = result.outcome;
    negotiationComplete.value = true;
  } else if (result.nextRound) {
    // Continue to next round
    currentRoundData.value = result.nextRound;
  }

  awaitingResponse.value = false;
}

function restartNegotiation() {
  completedRounds.value = [];
  negotiationComplete.value = false;
  finalOutcome.value = null;
  initializeNegotiation();
}

function formatApproach(approach: NegotiationApproach): string {
  switch (approach) {
    case 'EMPATHETIC': return 'Empathetic';
    case 'BUSINESS': return 'Business';
    case 'AGGRESSIVE': return 'Aggressive';
    case 'COLLABORATIVE': return 'Collaborative';
    default: return approach;
  }
}

function formatOutcome(outcome: string): string {
  return outcome.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getApproachColor(approach: NegotiationApproach): string {
  switch (approach) {
    case 'EMPATHETIC': return 'bg-green-100 text-green-800';
    case 'BUSINESS': return 'bg-blue-100 text-blue-800';
    case 'AGGRESSIVE': return 'bg-red-100 text-red-800';
    case 'COLLABORATIVE': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Lifecycle
onMounted(() => {
  initializeNegotiation();
});
</script>

<style scoped>
.negotiation-simulator {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>