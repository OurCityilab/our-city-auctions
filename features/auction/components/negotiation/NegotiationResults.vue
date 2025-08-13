<!-- features/auction/components/negotiation/NegotiationResults.vue -->
<template>
  <div class="negotiation-results">
    <!-- Outcome Header -->
    <div class="text-center mb-8">
      <div 
        class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
        :class="outcome.success ? 'bg-green-100' : 'bg-red-100'"
      >
        <svg 
          class="w-10 h-10"
          :class="outcome.success ? 'text-green-600' : 'text-red-600'"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            v-if="outcome.success"
            fill-rule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clip-rule="evenodd" 
          />
          <path 
            v-else
            fill-rule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clip-rule="evenodd" 
          />
        </svg>
      </div>
      
      <h2 
        class="text-3xl font-bold mb-2"
        :class="outcome.success ? 'text-green-900' : 'text-red-900'"
      >
        {{ outcome.success ? 'Negotiation Successful!' : 'Negotiation Failed' }}
      </h2>
      
      <p class="text-lg text-gray-600">
        {{ outcome.success ? 'You reached an agreement' : 'Unable to reach agreement' }}
      </p>
    </div>

    <!-- Success Details -->
    <div v-if="outcome.success && outcome.agreement" class="mb-8">
      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-green-900 mb-4">Agreement Reached</h3>
        
        <div class="grid grid-cols-2 gap-6">
          <!-- Agreement Type -->
          <div>
            <h4 class="font-medium text-green-800 mb-2">Agreement Type</h4>
            <p class="text-lg font-semibold text-green-900">
              {{ formatAgreementType(outcome.agreement.type) }}
            </p>
          </div>
          
          <!-- Satisfaction Scores -->
          <div>
            <h4 class="font-medium text-green-800 mb-2">Satisfaction Levels</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>{{ occupant.name }}:</span>
                <span class="font-semibold">{{ outcome.agreement.occupantSatisfaction }}/10</span>
              </div>
              <div class="flex justify-between">
                <span>Investor Benefit:</span>
                <span class="font-semibold">{{ outcome.agreement.investorBenefit }}/10</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Agreement Terms -->
        <div class="mt-6">
          <h4 class="font-medium text-green-800 mb-3">Terms & Conditions</h4>
          <div class="bg-white rounded border p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-for="(value, key) in outcome.agreement.terms" :key="key">
                <span class="text-gray-600">{{ formatTermKey(key) }}:</span>
                <span class="ml-2 font-medium">{{ formatTermValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Future ROI -->
        <div v-if="outcome.futureROI" class="mt-4 p-4 bg-green-100 rounded">
          <div class="flex justify-between items-center">
            <span class="font-medium text-green-800">Projected Annual ROI:</span>
            <span class="text-xl font-bold text-green-900">{{ outcome.futureROI }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Failure Details -->
    <div v-else class="mb-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-red-900 mb-4">Why the Negotiation Failed</h3>
        <p class="text-red-800 leading-relaxed">{{ outcome.reason }}</p>
        
        <div class="mt-4 p-4 bg-red-100 rounded">
          <p class="text-sm text-red-800">
            <strong>Next Steps:</strong> You'll need to pursue formal eviction proceedings, which can take 3-6 months and cost $2,000-5,000 in legal fees. This will also damage your reputation in the community.
          </p>
        </div>
      </div>
    </div>

    <!-- Metrics and Learning -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <!-- Negotiation Metrics -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Negotiation Style</h3>
        
        <div class="space-y-3">
          <div v-for="(count, approach) in outcome.metrics?.approachesUsed" :key="approach">
            <div class="flex justify-between items-center">
              <span class="text-gray-700">{{ formatApproach(approach) }}:</span>
              <span class="font-semibold">{{ count }} times</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full"
                :class="getApproachColor(approach)"
                :style="{ width: `${(count / (outcome.metrics?.roundsCompleted || 1)) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Empathy Score:</span>
              <span class="ml-1 font-semibold">{{ outcome.metrics?.empathyScore || 0 }}</span>
            </div>
            <div>
              <span class="text-gray-600">Aggression Score:</span>
              <span class="ml-1 font-semibold">{{ outcome.metrics?.aggressionScore || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Final State -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Final Relationship State</h3>
        
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-700">Trust Level</span>
              <span class="font-semibold">{{ outcome.metrics?.finalTrustLevel || 0 }}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all"
                :class="getTrustColor(outcome.metrics?.finalTrustLevel || 0)"
                :style="{ width: `${((outcome.metrics?.finalTrustLevel || 0) / 10) * 100}%` }"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-700">Stress Level</span>
              <span class="font-semibold">{{ outcome.metrics?.finalStressLevel || 0 }}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all"
                :class="getStressColor(outcome.metrics?.finalStressLevel || 0)"
                :style="{ width: `${((outcome.metrics?.finalStressLevel || 0) / 10) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Educational Summary -->
    <div v-if="outcome.educationalSummary" class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-blue-900 mb-3">🎓 Key Learning</h3>
      <p class="text-blue-800 leading-relaxed whitespace-pre-line">{{ outcome.educationalSummary }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center space-x-4">
      <button
        @click="$emit('restart')"
        class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
      >
        Try Different Approach
      </button>
      <button
        @click="$emit('complete')"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Continue to Next Property
      </button>
    </div>

    <!-- Quick Tips -->
    <div class="mt-8 text-center">
      <details class="text-sm text-gray-600">
        <summary class="cursor-pointer hover:text-gray-800 transition">
          💡 Negotiation Tips for Next Time
        </summary>
        <div class="mt-4 p-4 bg-yellow-50 rounded-lg text-left">
          <ul class="space-y-2">
            <li><strong>Build Trust First:</strong> Start with empathetic approaches to establish rapport</li>
            <li><strong>Avoid Aggression:</strong> Aggressive tactics almost always backfire and damage relationships</li>
            <li><strong>Find Win-Win Solutions:</strong> The best outcomes help both parties achieve their goals</li>
            <li><strong>Listen Actively:</strong> Understanding their perspective is key to finding solutions</li>
            <li><strong>Be Patient:</strong> Good negotiations take time to develop trust and understanding</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { 
  NegotiationOutcome, 
  AuctionProperty, 
  OccupantProfile,
  NegotiationApproach 
} from '../../../types/auction.types';

// Props
defineProps<{
  outcome: NegotiationOutcome;
  property: AuctionProperty;
  occupant: OccupantProfile;
}>();

// Emits
defineEmits<{
  restart: [];
  complete: [];
}>();

// Methods
function formatApproach(approach: string): string {
  switch (approach) {
    case 'EMPATHETIC': return 'Empathetic';
    case 'BUSINESS': return 'Business';
    case 'AGGRESSIVE': return 'Aggressive';
    case 'COLLABORATIVE': return 'Collaborative';
    default: return approach;
  }
}

function formatAgreementType(type: string): string {
  switch (type) {
    case 'STAY_AS_OWNER': return 'Help Stay as Owner';
    case 'RENT_BACK': return 'Rent Back to Occupant';
    case 'RENT_TO_OWN': return 'Rent-to-Own Agreement';
    case 'CASH_FOR_KEYS': return 'Cash for Keys';
    case 'RELOCATE': return 'Assisted Relocation';
    default: return type.replace(/_/g, ' ');
  }
}

function formatTermKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function formatTermValue(value: any): string {
  if (typeof value === 'number' && value > 1000) {
    return '$' + value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

function getApproachColor(approach: string): string {
  switch (approach) {
    case 'EMPATHETIC': return 'bg-green-500';
    case 'BUSINESS': return 'bg-blue-500';
    case 'AGGRESSIVE': return 'bg-red-500';
    case 'COLLABORATIVE': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

function getTrustColor(level: number): string {
  if (level <= 3) return 'bg-red-500';
  if (level <= 6) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getStressColor(level: number): string {
  if (level <= 3) return 'bg-green-500';
  if (level <= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}
</script>