<template>
  <div class="max-w-4xl mx-auto px-4 py-8">

    <!-- Step indicator -->
    <div class="flex items-center justify-center gap-2 mb-8">
      <template v-for="(stepLabel, i) in steps" :key="i">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            :class="currentStep > i
              ? 'bg-solar-500 text-white'
              : currentStep === i
                ? 'bg-solar-100 text-solar-700 ring-2 ring-solar-500'
                : 'bg-gray-100 text-gray-400'"
          >
            <svg v-if="currentStep > i" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="text-sm font-medium hidden sm:inline"
            :class="currentStep === i ? 'text-solar-700' : currentStep > i ? 'text-gray-600' : 'text-gray-400'">
            {{ stepLabel }}
          </span>
        </div>
        <div v-if="i < steps.length - 1" class="h-px w-6 sm:w-12 bg-gray-200 flex-shrink-0"></div>
      </template>
    </div>

    <!-- Step 1: Map / Roof Drawing -->
    <div v-if="currentStep === 0">
      <div class="card mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Draw your roof</h2>
        <p class="text-sm text-gray-500 mb-6">Search your address, zoom in, then trace the roof outline using the polygon drawing tool.</p>
        <MapDrawer @confirmed="onMapConfirmed" @manualMode="switchToManual" />
      </div>

      <!-- Manual mode fallback -->
      <div v-if="showManual" class="card mt-4">
        <h3 class="font-semibold text-gray-900 mb-4">Manual entry</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Roof area (m²) <span class="text-red-500">*</span></label>
            <input v-model.number="manualInputs.roofAreaM2" type="number" min="5" max="2000" class="form-input" placeholder="e.g. 40" />
          </div>
          <div>
            <label class="form-label">Roof orientation</label>
            <select v-model="manualInputs.compassDirection" class="form-input">
              <option value="S">South (best)</option>
              <option value="SE">South-East</option>
              <option value="SW">South-West</option>
              <option value="E">East</option>
              <option value="W">West</option>
              <option value="N">North</option>
            </select>
          </div>
          <div>
            <label class="form-label">Approximate postcode</label>
            <input v-model="manualInputs.postcode" type="text" class="form-input" placeholder="e.g. SO14 1AA" />
          </div>
          <div>
            <label class="form-label">Annual electricity bill (£)</label>
            <input v-model.number="manualInputs.annualBillGbp" type="number" min="0" max="10000" class="form-input" placeholder="1200" />
          </div>
        </div>
        <button class="btn-primary mt-4 w-full" @click="proceedFromManual" :disabled="!manualInputs.roofAreaM2">
          Continue with manual data →
        </button>
      </div>
    </div>

    <!-- Step 2: Your Details -->
    <div v-if="currentStep === 1">
      <div class="card">
        <UserDetailsForm :calculation-summary="mapDataConfirmed" @submitted="onDetailsSubmitted" />
      </div>
      <button class="btn-secondary mt-4 text-sm" @click="currentStep = 0">← Back to map</button>
    </div>

    <!-- Step 3: Results -->
    <div v-if="currentStep === 2">
      <ResultsPanel
        :results="calculationResults"
        :map-data="mapDataConfirmed"
        :user-details="userDetails"
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
import { fallbackIrradiance } from '@/services/pvgisService'
import { orientationEfficiency } from '@/services/googleMapsService'

const steps = ['Draw roof', 'Your details', 'Results']
const currentStep = ref(0)
const showManual = ref(false)

const mapDataConfirmed = ref(null)
const userDetails = ref(null)
const calculationResults = ref(null)

const manualInputs = reactive({
  roofAreaM2: null,
  compassDirection: 'S',
  postcode: '',
  annualBillGbp: 1200
})

// Compass → approximate heading
const compassToHeading = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }

function onMapConfirmed(data) {
  mapDataConfirmed.value = data
  currentStep.value = 1
}

function switchToManual() {
  showManual.value = true
}

function proceedFromManual() {
  const heading = compassToHeading[manualInputs.compassDirection] ?? 180
  // Use lat 52 (midlands) if no postcode given for irradiance fallback
  const irradiance = fallbackIrradiance(52)

  mapDataConfirmed.value = {
    roofAreaM2: manualInputs.roofAreaM2,
    roofHeadingDeg: heading,
    compassDirection: manualInputs.compassDirection,
    orientationFactor: orientationEfficiency(heading),
    irradianceKwhM2y: irradiance,
    lat: 52,
    lng: -1.5
  }
  currentStep.value = 1
}

function onDetailsSubmitted(details) {
  userDetails.value = details

  // Run calculation
  calculationResults.value = calculateSolar({
    roofAreaM2: mapDataConfirmed.value.roofAreaM2,
    irradianceKwhM2y: mapDataConfirmed.value.irradianceKwhM2y,
    orientationFactor: mapDataConfirmed.value.orientationFactor,
    roofTiltDeg: 35,
    annualBillGbp: 1200
  })

  currentStep.value = 2
}

function restart() {
  currentStep.value = 0
  mapDataConfirmed.value = null
  userDetails.value = null
  calculationResults.value = null
  showManual.value = false
}
</script>
