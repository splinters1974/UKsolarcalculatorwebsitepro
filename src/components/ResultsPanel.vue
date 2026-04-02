<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Your solar estimate</h2>
      <button class="btn-secondary text-sm flex items-center gap-2" @click="downloadPDF" :disabled="generatingPdf">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        {{ generatingPdf ? 'Generating…' : 'Download PDF' }}
      </button>
    </div>

    <!-- Key metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-3xl font-bold text-solar-500">{{ results.panelCount }}</p>
        <p class="text-sm text-gray-500 mt-1">Panels</p>
        <p class="text-xs text-gray-400">{{ results.systemKwp }} kWp system</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-solar-500">{{ formatNumber(results.annualGenerationKwh) }}</p>
        <p class="text-sm text-gray-500 mt-1">kWh/year</p>
        <p class="text-xs text-gray-400">Estimated generation</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-green-600">{{ formatGbp(results.totalAnnualBenefit) }}</p>
        <p class="text-sm text-gray-500 mt-1">Annual benefit</p>
        <p class="text-xs text-gray-400">Savings + export income</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-blue-600">{{ results.paybackYears }}yr</p>
        <p class="text-sm text-gray-500 mt-1">Payback period</p>
        <p class="text-xs text-gray-400">Typical 7–12 years UK</p>
      </div>
    </div>

    <!-- Financial breakdown -->
    <div class="card">
      <h3 class="font-semibold text-gray-900 mb-4">Financial breakdown</h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-600">Estimated install cost</span>
          <span class="font-semibold">{{ formatGbp(results.installCostGbp) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-600">Annual savings (self-consumption)</span>
          <span class="font-semibold text-green-600">+{{ formatGbp(results.savingsFromSelfConsumption) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-600">Annual export income (SEG)</span>
          <span class="font-semibold text-green-600">+{{ formatGbp(results.exportIncome) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-600">Estimated bill reduction</span>
          <span class="font-semibold text-green-600">~{{ results.billReductionPct }}%</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-sm font-semibold text-gray-800">25-year total benefit</span>
          <span class="font-bold text-lg text-green-700">{{ formatGbp(results.twentyFiveYearBenefit) }}</span>
        </div>
      </div>
    </div>

    <!-- System details -->
    <div class="card">
      <h3 class="font-semibold text-gray-900 mb-4">System details</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-500">Total roof area drawn</p>
          <p class="font-semibold">{{ Math.round(mapData.roofAreaM2) }} m²</p>
        </div>
        <div>
          <p class="text-gray-500">Usable roof area</p>
          <p class="font-semibold">{{ results.usableAreaM2 }} m²</p>
        </div>
        <div>
          <p class="text-gray-500">Roof orientation</p>
          <p class="font-semibold">{{ mapData.compassDirection || '—' }}</p>
        </div>
        <div>
          <p class="text-gray-500">Solar irradiance</p>
          <p class="font-semibold">{{ mapData.irradianceKwhM2y }} kWh/m²/yr</p>
        </div>
        <div>
          <p class="text-gray-500">System size</p>
          <p class="font-semibold">{{ results.systemKwp }} kWp</p>
        </div>
        <div>
          <p class="text-gray-500">CO₂ saved/year</p>
          <p class="font-semibold">{{ formatNumber(results.annualCo2KgSaved) }} kg</p>
        </div>
      </div>
    </div>

    <!-- Environment -->
    <div class="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
      <div class="text-3xl">🌳</div>
      <div>
        <p class="font-semibold text-green-800">Environmental impact</p>
        <p class="text-sm text-green-700 mt-1">
          Your system would save <strong>{{ formatNumber(results.annualCo2KgSaved) }} kg of CO₂</strong> per year —
          equivalent to planting <strong>{{ results.treesEquivalent }} trees</strong> annually.
        </p>
      </div>
    </div>

    <!-- Disclaimer -->
    <p class="text-xs text-gray-400 leading-relaxed">
      This estimate is for guidance only. Actual generation and savings will vary based on panel placement, shading, roof pitch,
      and system specification. Solar irradiance data sourced from PVGIS (European Commission). Financial figures based on
      Ofgem cap unit rates and Smart Export Guarantee averages at time of calculation. Always obtain a professional survey.
    </p>

    <!-- Start again -->
    <button class="btn-secondary w-full" @click="$emit('restart')">
      Calculate another property
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatGbp, formatNumber } from '@/services/calculatorService'
import { generatePDF } from '@/services/pdfService'

const props = defineProps({
  results: { type: Object, required: true },
  mapData: { type: Object, required: true },
  userDetails: { type: Object, required: true }
})

const emit = defineEmits(['restart'])

const generatingPdf = ref(false)

async function downloadPDF() {
  generatingPdf.value = true
  try {
    await generatePDF({
      results: props.results,
      mapData: props.mapData,
      userDetails: props.userDetails
    })
  } finally {
    generatingPdf.value = false
  }
}
</script>
