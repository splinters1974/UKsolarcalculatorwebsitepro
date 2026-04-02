<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Your solar estimate</h2>
        <p class="text-sm text-gray-500 mt-1">Prepared for {{ userDetails.name }}, {{ userDetails.company }}</p>
      </div>
      <button
        class="btn-secondary text-sm flex items-center gap-2 flex-shrink-0"
        @click="downloadPDF"
        :disabled="generatingPdf"
      >
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
        <p class="text-sm text-gray-500 mt-1">Solar panels</p>
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
        <p class="text-xs text-gray-400">Typical UK: 7–12 years</p>
      </div>
    </div>

    <!-- Monthly generation chart -->
    <div v-if="monthlyData.length" class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">Estimated monthly generation</h3>
        <span class="text-xs text-gray-400">kWh · {{ results.systemKwp }} kWp system</span>
      </div>
      <div class="flex items-end gap-1.5" style="height: 120px;">
        <div
          v-for="m in scaledMonthly"
          :key="m.monthName"
          class="flex-1 flex flex-col items-center justify-end gap-1"
        >
          <span class="text-gray-500 font-medium" style="font-size:9px">{{ m.kwhDisplay }}</span>
          <div
            class="w-full rounded-t transition-all"
            :class="m.isTopMonth ? 'bg-solar-500' : 'bg-solar-200'"
            :style="{ height: `${m.barHeight}px` }"
            :title="`${m.monthName}: ${m.kwh} kWh`"
          ></div>
          <span class="text-gray-400" style="font-size:9px">{{ m.monthName }}</span>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-3">Irradiance data: PVGIS (European Commission)</p>
    </div>

    <!-- Financial breakdown -->
    <div class="card">
      <h3 class="font-semibold text-gray-900 mb-4">Financial breakdown</h3>
      <div class="space-y-0">
        <div v-for="row in financialRows" :key="row.label"
          class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
        >
          <div>
            <p class="text-sm text-gray-700">{{ row.label }}</p>
            <p v-if="row.note" class="text-xs text-gray-400">{{ row.note }}</p>
          </div>
          <span class="font-semibold" :class="row.color">{{ row.value }}</span>
        </div>
      </div>
    </div>

    <!-- 25-year total highlight -->
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-green-700 font-medium">25-year total benefit</p>
          <p class="text-3xl font-bold text-green-800 mt-1">{{ formatGbp(results.twentyFiveYearBenefit) }}</p>
          <p class="text-xs text-green-600 mt-1">After {{ formatGbp(results.installCostGbp) }} install cost = net {{ formatGbp(results.twentyFiveYearBenefit - results.installCostGbp) }} profit</p>
        </div>
        <div class="text-5xl">💰</div>
      </div>
    </div>

    <!-- System details -->
    <div class="card">
      <h3 class="font-semibold text-gray-900 mb-4">System details</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
        <div v-for="detail in systemDetails" :key="detail.label">
          <p class="text-gray-500">{{ detail.label }}</p>
          <p class="font-semibold text-gray-800">{{ detail.value }}</p>
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
          Over 25 years that's <strong>{{ formatNumber(results.annualCo2KgSaved * 25) }} kg</strong> of CO₂ avoided.
        </p>
      </div>
    </div>

    <!-- Disclaimer -->
    <p class="text-xs text-gray-400 leading-relaxed">
      This estimate is for guidance only. Actual generation and savings will vary based on shading, panel placement,
      roof pitch, and system specification. Solar irradiance data sourced from PVGIS (European Commission).
      Financial figures based on Ofgem cap unit rates (24.5p/kWh) and Smart Export Guarantee average (15p/kWh)
      at time of calculation. Install cost estimate based on 2024 UK market average. Always obtain a professional survey before purchasing.
    </p>

    <!-- Restart -->
    <button class="btn-secondary w-full" @click="$emit('restart')">
      ← Calculate another property
    </button>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatGbp, formatNumber } from '@/services/calculatorService'
import { generatePDF } from '@/services/pdfService'

const props = defineProps({
  results:       { type: Object, required: true },
  mapData:       { type: Object, required: true },
  userDetails:   { type: Object, required: true },
  annualBillGbp: { type: Number, default: 1200 }
})

const emit = defineEmits(['restart'])
const generatingPdf = ref(false)

// Monthly data — scale to system size
const monthlyData = computed(() => props.mapData.monthlyData ?? [])

const scaledMonthly = computed(() => {
  if (!monthlyData.value.length) return []
  const systemKwp = props.results.systemKwp
  const scaled = monthlyData.value.map(m => ({
    ...m,
    kwh: Math.round(m.yieldKwh * systemKwp)
  }))
  const maxKwh = Math.max(...scaled.map(m => m.kwh), 1)
  const topKwh = maxKwh
  return scaled.map(m => ({
    ...m,
    barHeight: Math.max(4, Math.round((m.kwh / maxKwh) * 90)),
    kwhDisplay: m.kwh >= 100 ? `${m.kwh}` : `${m.kwh}`,
    isTopMonth: m.kwh === topKwh
  }))
})

// Financial rows
const financialRows = computed(() => [
  {
    label: 'Estimated install cost',
    note: `${props.results.systemKwp} kWp · ${props.results.panelCount} panels`,
    value: formatGbp(props.results.installCostGbp),
    color: 'text-gray-900'
  },
  {
    label: 'Annual savings (self-consumption)',
    note: '50% of generation used on-site at 24.5p/kWh',
    value: `+${formatGbp(props.results.savingsFromSelfConsumption)}`,
    color: 'text-green-600'
  },
  {
    label: 'Annual export income',
    note: 'Smart Export Guarantee at 15p/kWh',
    value: `+${formatGbp(props.results.exportIncome)}`,
    color: 'text-green-600'
  },
  {
    label: 'Total annual benefit',
    note: '',
    value: formatGbp(props.results.totalAnnualBenefit),
    color: 'text-green-700 font-bold'
  },
  {
    label: 'Estimated bill reduction',
    note: `Based on £${props.annualBillGbp}/year electricity spend`,
    value: `~${props.results.billReductionPct}%`,
    color: 'text-green-600'
  },
  {
    label: 'Payback period',
    note: 'Time to recoup install cost from savings',
    value: `${props.results.paybackYears} years`,
    color: 'text-blue-600'
  }
])

// System detail rows
const systemDetails = computed(() => [
  { label: 'Roof area drawn',      value: `${Math.round(props.mapData.roofAreaM2)} m²` },
  { label: 'Usable area (70%)',    value: `${props.results.usableAreaM2} m²` },
  { label: 'Roof orientation',     value: props.mapData.compassDirection || '—' },
  { label: 'Roof pitch',           value: `${props.mapData.roofTiltDeg ?? 35}°` },
  { label: 'Solar irradiance',     value: `${props.mapData.irradianceKwhM2y} kWh/m²/yr` },
  { label: 'System size',          value: `${props.results.systemKwp} kWp` },
  { label: 'Number of panels',     value: `${props.results.panelCount} × 400W` },
  { label: 'Annual generation',    value: `${formatNumber(props.results.annualGenerationKwh)} kWh` },
  { label: 'CO₂ saved/year',       value: `${formatNumber(props.results.annualCo2KgSaved)} kg` }
])

async function downloadPDF() {
  generatingPdf.value = true
  try {
    await generatePDF({
      results: props.results,
      mapData: props.mapData,
      userDetails: props.userDetails,
      annualBillGbp: props.annualBillGbp,
      monthlyData: monthlyData.value
    })
  } finally {
    generatingPdf.value = false
  }
}
</script>
