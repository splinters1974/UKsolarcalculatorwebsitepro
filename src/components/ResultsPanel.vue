<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Your solar estimate</h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ results.totalPanelCount }} panels · {{ results.totalSystemKwp }} kWp ·
          {{ results.buildingCount }} building{{ results.buildingCount !== 1 ? 's' : '' }}
        </p>
      </div>
      <button class="btn-primary flex items-center gap-2 text-sm flex-shrink-0" @click="$emit('getReport')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download PDF report
      </button>
    </div>

    <!-- Key metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-3xl font-bold text-solar-500">{{ results.totalPanelCount }}</p>
        <p class="text-sm text-gray-500 mt-1">Solar panels</p>
        <p class="text-xs text-gray-400">{{ results.totalSystemKwp }} kWp system</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-solar-500">{{ formatNumber(results.annualGenerationKwh) }}</p>
        <p class="text-sm text-gray-500 mt-1">kWh/year</p>
        <p class="text-xs text-gray-400">Estimated generation</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-green-600">{{ formatGbp(results.capital.annualSavings) }}</p>
        <p class="text-sm text-gray-500 mt-1">Annual savings</p>
        <p class="text-xs text-gray-400">Self-consumption at {{ unitRatePence }}p/kWh</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-blue-600">{{ results.capital.paybackYears }}yr</p>
        <p class="text-sm text-gray-500 mt-1">Payback period</p>
        <p class="text-xs text-gray-400">Capital purchase</p>
      </div>
    </div>

    <!-- Funding model tabs -->
    <div>
      <div class="flex gap-0 border-b border-gray-200">
        <button
          class="px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="activeTab === 'capital'
            ? 'border-solar-500 text-solar-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'capital'"
        >Capital Purchase</button>
        <button
          class="px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="activeTab === 'ppa'
            ? 'border-solar-500 text-solar-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'ppa'"
        >PPA (No-Cost Install)</button>
      </div>

      <!-- ── Capital tab ── -->
      <div v-if="activeTab === 'capital'" class="pt-5 space-y-4">

        <!-- Financial breakdown -->
        <div class="card">
          <h3 class="font-semibold text-gray-900 mb-4">Capital purchase breakdown</h3>
          <div class="space-y-0">
            <div v-for="row in capitalRows" :key="row.label"
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

        <!-- SEG export income — additional benefit callout -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div class="text-2xl flex-shrink-0">⚡</div>
          <div>
            <p class="font-semibold text-amber-800 text-sm">Additional benefit: Smart Export Guarantee (SEG)</p>
            <p class="text-sm text-amber-700 mt-0.5">
              Your estimated export income is <strong>{{ formatGbp(results.capital.exportIncomeSEG) }}/yr</strong>
              ({{ formatNumber(results.exportedKwh) }} kWh exported at 5p/kWh).
              This is included in your payback calculation above.
            </p>
          </div>
        </div>

        <!-- 30-year profit highlight -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-sm text-green-700 font-medium">30-year net profit</p>
              <p class="text-3xl font-bold text-green-800 mt-1">{{ formatGbp(results.capital.thirtyYearProfit) }}</p>
              <p class="text-xs text-green-600 mt-1">
                {{ formatGbp(results.capital.thirtyYearGross) }} gross receipts minus
                {{ formatGbp(results.capital.installCostGbp) }} install cost
              </p>
            </div>
            <div class="text-5xl">💰</div>
          </div>
        </div>

        <!-- 30-year bar chart -->
        <div class="card">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 class="font-semibold text-gray-900 text-sm">30-year annual benefit projection</h3>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 rounded-sm bg-amber-400"></span>Pre-payback
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-3 rounded-sm bg-green-500"></span>Post-payback
              </span>
            </div>
          </div>
          <div class="flex items-end gap-px" style="height: 80px;">
            <div
              v-for="yr in results.capital.yearByYear"
              :key="yr.year"
              class="flex-1 flex flex-col items-center justify-end"
              :title="`Year ${yr.year}: ${formatGbp(yr.annualBenefit)}`"
            >
              <div
                class="w-full rounded-t"
                :class="yr.year <= paybackYearCeil ? 'bg-amber-400' : 'bg-green-500'"
                :style="{ height: `${Math.max(2, Math.round((yr.annualBenefit / maxCapitalBenefit) * 68))}px` }"
              ></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
            <span>Yr 1</span><span>Yr 10</span><span>Yr 20</span><span>Yr 30</span>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Assumes 3%/yr grid price rise · 0.5%/yr panel degradation
          </p>
        </div>

      </div>

      <!-- ── PPA tab ── -->
      <div v-if="activeTab === 'ppa'" class="pt-5 space-y-4">

        <div class="card">
          <h3 class="font-semibold text-gray-900 mb-4">Power Purchase Agreement</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p class="text-xs text-gray-400 mb-0.5">Your grid rate</p>
              <p class="text-xl font-bold text-gray-900">
                {{ unitRatePence }}p<span class="text-sm font-normal text-gray-500">/kWh</span>
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-0.5">PPA rate (20% discount)</p>
              <p class="text-xl font-bold text-solar-600">
                {{ results.ppa.ppaRatePence }}p<span class="text-sm font-normal text-gray-500">/kWh</span>
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-0.5">Year 1 saving</p>
              <p class="text-xl font-bold text-green-600">{{ formatGbp(results.ppa.annualSavingY1) }}</p>
            </div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>No upfront cost.</strong> The developer funds and owns the system.
            You pay only for the solar you use at the agreed PPA rate — always below your grid tariff.
          </div>
        </div>

        <!-- Contract duration selector -->
        <div class="card">
          <p class="text-sm font-medium text-gray-700 mb-3">Contract duration</p>
          <div class="flex gap-2 mb-4 flex-wrap">
            <button
              v-for="d in [10, 15, 20, 25]"
              :key="d"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="selectedPpaDuration === d
                ? 'bg-solar-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="selectedPpaDuration = d"
            >{{ d }} years</button>
          </div>

          <div v-if="activePpaContract" class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">Total saving over {{ selectedPpaDuration }} years</p>
              <p class="text-2xl font-bold text-green-600">{{ formatGbp(activePpaContract.totalSaving) }}</p>
            </div>

            <!-- PPA bar chart -->
            <div class="flex items-end gap-px mt-2" style="height: 70px;">
              <div
                v-for="yr in activePpaContract.yearByYear"
                :key="yr.year"
                class="flex-1 flex flex-col items-center justify-end"
                :title="`Year ${yr.year}: ${formatGbp(yr.annualSaving)}`"
              >
                <div
                  class="w-full rounded-t bg-solar-400"
                  :style="{ height: `${Math.max(2, Math.round((yr.annualSaving / maxPpaSaving) * 58))}px` }"
                ></div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-400 px-0.5">
              <span>Yr 1</span>
              <span>Yr {{ Math.ceil(selectedPpaDuration / 2) }}</span>
              <span>Yr {{ selectedPpaDuration }}</span>
            </div>
            <p class="text-xs text-gray-400">
              Annual saving grows as grid prices rise while your PPA rate stays fixed.
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- Monthly generation chart -->
    <div v-if="scaledMonthly.length" class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 text-sm">Estimated monthly generation</h3>
        <span class="text-xs text-gray-400">kWh · {{ results.totalSystemKwp }} kWp system</span>
      </div>
      <div class="flex items-end gap-1.5" style="height: 100px;">
        <div
          v-for="m in scaledMonthly"
          :key="m.monthName"
          class="flex-1 flex flex-col items-center justify-end gap-1"
        >
          <span class="text-gray-500 font-medium" style="font-size:9px">{{ m.kwh }}</span>
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

    <!-- Buildings breakdown (only when >1 building) -->
    <div v-if="results.buildings.length > 1" class="card">
      <h3 class="font-semibold text-gray-900 mb-4 text-sm">Buildings breakdown</h3>
      <div class="space-y-0">
        <div
          v-for="b in results.buildings"
          :key="b.name"
          class="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 text-sm"
        >
          <div>
            <p class="font-medium text-gray-800">{{ b.name }}</p>
            <p class="text-xs text-gray-400">{{ Math.round(b.roofAreaM2) }} m² · {{ b.compassDirection }} · {{ b.roofTiltDeg }}° pitch</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ b.systemKwp }} kWp</p>
            <p class="text-xs text-gray-400">{{ formatNumber(b.annualKwh) }} kWh/yr</p>
          </div>
        </div>
      </div>
    </div>

    <!-- System details -->
    <div class="card">
      <h3 class="font-semibold text-gray-900 mb-4 text-sm">System details</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
        <div v-for="detail in systemDetails" :key="detail.label">
          <p class="text-gray-500">{{ detail.label }}</p>
          <p class="font-semibold text-gray-800">{{ detail.value }}</p>
        </div>
      </div>
    </div>

    <!-- Environmental impact -->
    <div class="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
      <div class="text-3xl flex-shrink-0">🌳</div>
      <div>
        <p class="font-semibold text-green-800">Environmental impact</p>
        <p class="text-sm text-green-700 mt-1">
          Your system would save <strong>{{ formatNumber(results.annualCo2KgSaved) }} kg of CO₂</strong> per year —
          equivalent to planting <strong>{{ results.treesEquivalent }} trees</strong> annually.
          Over 30 years that's <strong>{{ formatNumber(results.annualCo2KgSaved * 30) }} kg</strong> of CO₂ avoided.
        </p>
      </div>
    </div>

    <!-- Download CTA -->
    <div class="bg-solar-50 border border-solar-200 rounded-xl p-6 text-center">
      <p class="font-semibold text-solar-800 mb-1">Ready to take this to your stakeholders?</p>
      <p class="text-sm text-solar-700 mb-4">
        Download a professional PDF report to share with your board, finance team, or landlord.
      </p>
      <button class="btn-primary px-8 py-3 inline-flex items-center gap-2" @click="$emit('getReport')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download PDF report
      </button>
    </div>

    <!-- Disclaimer -->
    <p class="text-xs text-gray-400 leading-relaxed">
      Estimates are indicative only. Actual generation and savings depend on shading, system specification, roof condition,
      and occupancy patterns. Solar irradiance from PVGIS (European Commission). Financial projection over 30-year operational
      lifespan with 0.5%/yr degradation and 3%/yr grid price escalation. Obtain a professional site survey before committing
      to a purchase or PPA.
    </p>

    <!-- Restart -->
    <button class="btn-secondary w-full" @click="$emit('restart')">
      ← Calculate another site
    </button>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatGbp, formatNumber } from '@/services/calculatorService'

const props = defineProps({
  results:       { type: Object, required: true },
  siteData:      { type: Object, required: true },
  unitRatePence: { type: Number, required: true },
  fundingModel:  { type: String, default: 'capital' },
  ppaDuration:   { type: Number, default: 20 }
})

defineEmits(['getReport', 'restart'])

const activeTab           = ref(props.fundingModel === 'ppa' ? 'ppa' : 'capital')
const selectedPpaDuration = ref(props.ppaDuration)

// Capital chart
const maxCapitalBenefit = computed(() =>
  Math.max(...props.results.capital.yearByYear.map(y => y.annualBenefit), 1)
)
const paybackYearCeil = computed(() => Math.ceil(props.results.capital.paybackYears))

// PPA contract
const activePpaContract = computed(() =>
  props.results.ppa.contracts[selectedPpaDuration.value] ?? null
)
const maxPpaSaving = computed(() => {
  if (!activePpaContract.value) return 1
  return Math.max(...activePpaContract.value.yearByYear.map(y => y.annualSaving), 1)
})

// Monthly generation scaled to system kWp
const scaledMonthly = computed(() => {
  const data = props.siteData.monthlyData ?? []
  if (!data.length) return []
  const kWp  = props.results.totalSystemKwp
  const scaled = data.map(m => ({ ...m, kwh: Math.round(m.yieldKwh * kWp) }))
  const maxKwh = Math.max(...scaled.map(m => m.kwh), 1)
  return scaled.map(m => ({
    ...m,
    barHeight:  Math.max(4, Math.round((m.kwh / maxKwh) * 72)),
    isTopMonth: m.kwh === maxKwh
  }))
})

// Capital table rows
const capitalRows = computed(() => [
  {
    label: 'Estimated install cost',
    note:  `${props.results.totalSystemKwp} kWp · ${props.results.totalPanelCount} panels`,
    value: formatGbp(props.results.capital.installCostGbp),
    color: 'text-gray-900'
  },
  {
    label: 'Annual savings (self-consumed solar)',
    note:  `${formatNumber(props.results.selfConsumedKwh)} kWh/yr at ${props.unitRatePence}p/kWh`,
    value: `+${formatGbp(props.results.capital.annualSavings)}`,
    color: 'text-green-600'
  },
  {
    label: 'Total annual benefit (incl. SEG export)',
    note:  'Used for payback calculation',
    value: formatGbp(props.results.capital.totalAnnualBenefit),
    color: 'text-green-700 font-bold'
  },
  {
    label: 'Estimated payback period',
    note:  'Typical commercial: 7–12 years',
    value: `${props.results.capital.paybackYears} years`,
    color: 'text-blue-600'
  }
])

// System detail rows
const systemDetails = computed(() => {
  const r = props.results
  const s = props.siteData
  return [
    { label: 'Total roof area',    value: `${Math.round(r.totalRoofAreaM2)} m²` },
    { label: 'Usable area (70%)',  value: `${r.totalUsableAreaM2} m²` },
    { label: 'Solar irradiance',   value: `${s.irradianceKwhM2y} kWh/m²/yr` },
    { label: 'System size',        value: `${r.totalSystemKwp} kWp` },
    { label: 'Number of panels',   value: `${r.totalPanelCount} × 450W` },
    { label: 'Annual generation',  value: `${formatNumber(r.annualGenerationKwh)} kWh` },
    { label: 'Self-consumed (75%)',value: `${formatNumber(r.selfConsumedKwh)} kWh/yr` },
    { label: 'Exported (25%)',     value: `${formatNumber(r.exportedKwh)} kWh/yr` },
    { label: 'CO₂ saved/year',     value: `${formatNumber(r.annualCo2KgSaved)} kg` }
  ]
})
</script>
