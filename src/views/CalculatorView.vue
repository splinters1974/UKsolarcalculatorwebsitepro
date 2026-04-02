<template>
  <div class="max-w-4xl mx-auto px-4 py-8">

    <!-- Step indicator -->
    <div class="flex items-center justify-center gap-2 mb-8">
      <template v-for="(stepLabel, i) in steps" :key="i">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
            :class="currentStep > i
              ? 'bg-solar-500 text-white'
              : currentStep === i
                ? 'bg-solar-100 text-solar-700 ring-2 ring-solar-400'
                : 'bg-gray-100 text-gray-400'"
          >
            <svg v-if="currentStep > i" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-sm font-medium hidden sm:inline transition-colors"
            :class="currentStep === i ? 'text-solar-700' : currentStep > i ? 'text-gray-600' : 'text-gray-400'"
          >{{ stepLabel }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="h-px w-6 sm:w-12 bg-gray-200 flex-shrink-0"></div>
      </template>
    </div>

    <!-- ── Step 1: Map + Roof drawing ───────────────────────────────────── -->
    <div v-if="currentStep === 0" class="space-y-4">
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Draw your roof</h2>
        <p class="text-sm text-gray-500 mb-6">
          Search your address, zoom in on satellite view, then trace the roof outline.
        </p>
        <MapDrawer @confirmed="onMapConfirmed" @manualMode="showManual = true" />
      </div>

      <!-- Manual entry fallback -->
      <transition name="slide-down">
        <div v-if="showManual" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">Manual entry</h3>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">No API key required</span>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Roof area (m²) <span class="text-red-500">*</span></label>
              <input
                v-model.number="manualInputs.roofAreaM2"
                type="number" min="5" max="5000"
                class="form-input"
                placeholder="e.g. 40"
              />
              <p class="text-xs text-gray-400 mt-1">Measure on a plan or estimate from floor area</p>
            </div>
            <div>
              <label class="form-label">Roof orientation</label>
              <select v-model="manualInputs.compassDirection" class="form-input">
                <option value="S">South — best (100%)</option>
                <option value="SE">South-East (96%)</option>
                <option value="SW">South-West (96%)</option>
                <option value="E">East (85%)</option>
                <option value="W">West (85%)</option>
                <option value="NE">North-East (70%)</option>
                <option value="NW">North-West (70%)</option>
                <option value="N">North — worst (60%)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Roof pitch</label>
              <select v-model.number="manualInputs.roofTiltDeg" class="form-input">
                <option :value="0">Flat (0°)</option>
                <option :value="20">Shallow (20°)</option>
                <option :value="35">Standard (35°)</option>
                <option :value="45">Steep (45°)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Approximate postcode</label>
              <input
                v-model="manualInputs.postcode"
                type="text"
                class="form-input"
                placeholder="e.g. SO14 1AA"
                @blur="lookupPostcode"
              />
              <p class="text-xs text-gray-400 mt-1">Used to estimate local solar irradiance</p>
            </div>
            <div class="sm:col-span-2">
              <label class="form-label">Annual electricity bill (£)</label>
              <input
                v-model.number="manualInputs.annualBillGbp"
                type="number" min="0" max="50000"
                class="form-input"
                placeholder="e.g. 1200"
              />
              <p class="text-xs text-gray-400 mt-1">Used to estimate your bill reduction percentage</p>
            </div>
          </div>
          <button
            class="btn-primary mt-5 w-full py-3"
            @click="proceedFromManual"
            :disabled="!manualInputs.roofAreaM2"
          >
            Continue with manual data →
          </button>
        </div>
      </transition>
    </div>

    <!-- ── Step 1b: Bill input (after map confirmed) ─────────────────────── -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-1">One last detail</h2>
        <p class="text-sm text-gray-500 mb-6">
          Your annual electricity bill lets us estimate how much of your usage solar will cover.
        </p>

        <!-- Roof summary pill -->
        <div class="bg-solar-50 border border-solar-100 rounded-lg p-4 mb-6 flex flex-wrap gap-4 text-sm">
          <div>
            <span class="text-gray-500">Roof area</span>
            <span class="font-semibold ml-2">{{ Math.round(mapDataConfirmed.roofAreaM2) }} m²</span>
          </div>
          <div>
            <span class="text-gray-500">Orientation</span>
            <span class="font-semibold ml-2">{{ mapDataConfirmed.compassDirection }}</span>
          </div>
          <div>
            <span class="text-gray-500">Pitch</span>
            <span class="font-semibold ml-2">{{ mapDataConfirmed.roofTiltDeg }}°</span>
          </div>
          <div>
            <span class="text-gray-500">Irradiance</span>
            <span class="font-semibold ml-2">{{ mapDataConfirmed.irradianceKwhM2y }} kWh/m²/yr</span>
          </div>
          <button class="text-solar-600 hover:text-solar-700 text-xs underline ml-auto" @click="currentStep = 0">
            Edit
          </button>
        </div>

        <div class="max-w-sm">
          <label class="form-label">Annual electricity bill (£)</label>
          <input
            v-model.number="annualBillGbp"
            type="number" min="0" max="50000"
            class="form-input text-lg"
            placeholder="e.g. 1200"
          />
          <p class="text-xs text-gray-400 mt-1">
            Find this on your latest energy bill. Average UK home: ~£1,200/year.
          </p>
        </div>

        <button class="btn-primary mt-6 w-full py-3" @click="currentStep = 2">
          Continue to your details →
        </button>
      </div>
      <button class="btn-secondary text-sm" @click="currentStep = 0">← Back to map</button>
    </div>

    <!-- ── Step 2: User Details ──────────────────────────────────────────── -->
    <div v-if="currentStep === 2">
      <div class="card">
        <UserDetailsForm
          :calculation-summary="{ ...mapDataConfirmed, annualBillGbp }"
          @submitted="onDetailsSubmitted"
        />
      </div>
      <button class="btn-secondary mt-4 text-sm" @click="currentStep = 1">← Back</button>
    </div>

    <!-- ── Step 3: Results ───────────────────────────────────────────────── -->
    <div v-if="currentStep === 3">
      <ResultsPanel
        :results="calculationResults"
        :map-data="mapDataConfirmed"
        :user-details="userDetails"
        :annual-bill-gbp="annualBillGbp"
        @restart="restart"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import MapDrawer from '@/components/MapDrawer.vue'
import UserDetailsForm from '@/components/UserDetailsForm.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'
import { calculateSolar } from '@/services/calculatorService'
import { fallbackIrradiance, fallbackMonthly } from '@/services/pvgisService'
import { orientationEfficiency } from '@/services/googleMapsService'

// Step labels — 4 steps now (map, bill, details, results)
const steps = ['Draw roof', 'Bill info', 'Your details', 'Results']
const currentStep = ref(0)
const showManual = ref(false)

// Data from each step
const mapDataConfirmed = ref(null)
const userDetails = ref(null)
const calculationResults = ref(null)
const annualBillGbp = ref(1200)

// Manual mode state
const compassToHeading = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }
const manualInputs = reactive({
  roofAreaM2: null,
  compassDirection: 'S',
  roofTiltDeg: 35,
  postcode: '',
  annualBillGbp: 1200
})

// ── Step handlers ────────────────────────────────────────────────────────

function onMapConfirmed(data) {
  mapDataConfirmed.value = data
  currentStep.value = 1
}

async function lookupPostcode() {
  // Rough lat from postcode for irradiance — UK postcode area prefix → lat
  const prefix = manualInputs.postcode.trim().toUpperCase().slice(0, 2).replace(/\d/g, '')
  const latByArea = {
    AB: 57.1, DD: 56.5, EH: 55.9, G: 55.8, KY: 56.2, FK: 56.0, PA: 55.9,
    DG: 55.1, TD: 55.6, CA: 54.8, NE: 54.9, SR: 54.9, DH: 54.8, TS: 54.5,
    HG: 54.1, YO: 53.9, LS: 53.8, BD: 53.8, HX: 53.7, WF: 53.7, HD: 53.6,
    DN: 53.5, S: 53.4, HU: 53.7, LN: 53.2, NG: 52.9, DE: 52.9, ST: 52.9,
    SK: 53.4, M: 53.5, OL: 53.5, BL: 53.6, WN: 53.5, PR: 53.8, FY: 53.8,
    LA: 54.1, BB: 53.7, CH: 53.2, CW: 53.1, SY: 52.7, TF: 52.7, WV: 52.6,
    WS: 52.6, B: 52.5, CV: 52.4, LE: 52.6, PE: 52.6, NR: 52.6, IP: 52.1,
    CO: 51.9, CM: 51.7, SS: 51.5, RM: 51.5, IG: 51.5, E: 51.5, N: 51.5,
    NW: 51.5, W: 51.5, SW: 51.5, SE: 51.5, EC: 51.5, WC: 51.5, BR: 51.4,
    DA: 51.4, ME: 51.3, TN: 51.1, CT: 51.3, BN: 50.8, PO: 50.8, SO: 50.9,
    RG: 51.4, GU: 51.2, KT: 51.4, SM: 51.4, CR: 51.4, SL: 51.5, OX: 51.7,
    MK: 52.0, LU: 51.9, AL: 51.7, SG: 51.9, EN: 51.7, WD: 51.7, HP: 51.7,
    NN: 52.2, CB: 52.2, GL: 51.8, HR: 52.1, WR: 52.2, DY: 52.5,
    BS: 51.4, BA: 51.4, TA: 51.0, EX: 50.7, PL: 50.4, TR: 50.1, TQ: 50.4,
    DT: 50.7, SP: 51.0, SN: 51.6, CF: 51.5, SA: 51.7, NP: 51.6, LD: 52.2,
    SY: 52.7, LL: 53.2, CH: 53.2, BT: 54.6
  }
  const lat = latByArea[prefix] ?? 52.0
  manualInputs._lat = lat
}

function proceedFromManual() {
  const heading = compassToHeading[manualInputs.compassDirection] ?? 180
  const lat = manualInputs._lat ?? 52.0
  const irradiance = fallbackIrradiance(lat)
  const monthly = fallbackMonthly(irradiance)

  annualBillGbp.value = manualInputs.annualBillGbp

  mapDataConfirmed.value = {
    roofAreaM2: manualInputs.roofAreaM2,
    roofHeadingDeg: heading,
    compassDirection: manualInputs.compassDirection,
    orientationFactor: orientationEfficiency(heading),
    irradianceKwhM2y: irradiance,
    roofTiltDeg: manualInputs.roofTiltDeg,
    monthlyData: monthly,
    lat,
    lng: -1.5
  }
  currentStep.value = 2 // skip bill step (already collected)
}

function onDetailsSubmitted(details) {
  userDetails.value = details

  calculationResults.value = calculateSolar({
    roofAreaM2: mapDataConfirmed.value.roofAreaM2,
    irradianceKwhM2y: mapDataConfirmed.value.irradianceKwhM2y,
    orientationFactor: mapDataConfirmed.value.orientationFactor,
    roofTiltDeg: mapDataConfirmed.value.roofTiltDeg ?? 35,
    annualBillGbp: annualBillGbp.value
  })

  currentStep.value = 3
}

function restart() {
  currentStep.value = 0
  mapDataConfirmed.value = null
  userDetails.value = null
  calculationResults.value = null
  showManual.value = false
  annualBillGbp.value = 1200
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
