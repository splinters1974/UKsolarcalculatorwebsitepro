<template>
  <div class="text-center py-8 px-4">
    <!-- Animated tick -->
    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
      </svg>
    </div>

    <h2 class="text-2xl font-bold text-gray-900 mb-2">Report on its way!</h2>
    <p class="text-gray-500 mb-1">
      We've sent your solar estimate to <strong class="text-gray-800">{{ email }}</strong>.
    </p>
    <p class="text-sm text-gray-400 mb-8">
      Check your spam folder if it doesn't arrive within a few minutes.
    </p>

    <!-- Summary card -->
    <div class="bg-solar-50 border border-solar-200 rounded-xl p-6 max-w-sm mx-auto text-left mb-8 space-y-3">
      <h3 class="font-semibold text-solar-800 text-sm uppercase tracking-wide">Your estimate summary</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">System size</span>
          <span class="font-semibold">{{ results.systemKwp }} kWp · {{ results.panelCount }} panels</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Annual generation</span>
          <span class="font-semibold">{{ formatNumber(results.annualGenerationKwh) }} kWh</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Annual benefit</span>
          <span class="font-semibold text-green-700">{{ formatGbp(results.totalAnnualBenefit) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Payback period</span>
          <span class="font-semibold">{{ results.paybackYears }} years</span>
        </div>
        <div class="border-t border-solar-200 pt-2 flex justify-between">
          <span class="text-gray-600">25-year benefit</span>
          <span class="font-bold text-green-700">{{ formatGbp(results.twentyFiveYearBenefit) }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        class="btn-primary px-6 py-2.5 flex items-center justify-center gap-2"
        @click="$emit('downloadPdf')"
        :disabled="generatingPdf"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        {{ generatingPdf ? 'Generating…' : 'Download PDF report' }}
      </button>
      <button class="btn-secondary px-6 py-2.5" @click="$emit('viewResults')">
        View full results
      </button>
    </div>

    <button class="mt-6 text-sm text-gray-400 hover:text-gray-600 underline" @click="$emit('restart')">
      Calculate another property
    </button>
  </div>
</template>

<script setup>
import { formatGbp, formatNumber } from '@/services/calculatorService'

defineProps({
  email:        { type: String, required: true },
  results:      { type: Object, required: true },
  generatingPdf:{ type: Boolean, default: false }
})

defineEmits(['downloadPdf', 'viewResults', 'restart'])
</script>
