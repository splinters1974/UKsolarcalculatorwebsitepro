<template>
  <div class="max-w-4xl mx-auto px-4 py-8">

    <!-- Step indicator (hidden on confirmation screen) -->
    <div v-if="currentStep < 4" class="flex items-center justify-center gap-2 mb-8">
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

    <!-- ── Demo mode banner ──────────────────────────────────────────────── -->
    <div v-if="currentStep === 0" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
      <div class="flex items-start gap-3 flex-1">
        <span class="text-xl shrink-0">🏭</span>
        <div>
          <p class="font-semibold text-amber-900 text-sm">Want to see results straight away?</p>
          <p class="text-amber-800 text-xs mt-0.5">Load a pre-filled 236 kWp Birmingham warehouse example — no map or API key needed.</p>
        </div>
      </div>
      <button
        class="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        @click="loadDemo"
      >
        Load demo scenario
      </button>
    </div>

    <!-- ── Step 0: Map + Roof drawing ────────────────────────────────────── -->
    <div v-if="currentStep === 0" class="space-y-4">

      <!-- Mobile notice -->
      <div v-if="isMobile" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-800">
        <span class="text-base">📱</span>
        <div>
          <p class="font-semibold">Map drawing works best on desktop</p>
          <p class="text-blue-700 mt-0.5">On a smaller screen, use manual entry below to get your estimate — it's just as accurate.</p>
        </div>
      </div>

      <div v-if="!isMobile" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Draw your roof</h2>
        <p class="text-sm text-gray-500 mb-6">Search your address, zoom to your building on satellite view, then trace the roof outline.</p>
        <MapDrawer @confirmed="onMapConfirmed" @manualMode="showManual = true" />
      </div>

      <!-- Manual divider -->
      <div v-if="!isMobile && !showManual" class="flex items-center gap-3 text-sm text-gray-400">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span>or enter details manually</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div v-if="!isMobile && !showManual" class="text-center">
        <button class="btn-secondary text-sm" @click="showManual = true">Use manual entry</button>
      </div>

      <!-- Manual entry (always shown on mobile) -->
      <transition name="slide-down">
        <div v-if="showManual || isMobile" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">{{ isMobile ? 'Enter your roof details' : 'Manual entry' }}</h3>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">No map required</span>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Roof area (m²) <span class="text-red-500">*</span></label>
              <input
                v-model.number="manualInputs.roofAreaM2"
                type="number" min="5" max="5000"
                class="form-input"
                :class="{ 'border-red-400': manualTouched.roofAreaM2 && !manualInputs.roofAreaM2 }"
                placeholder="e.g. 40"
                @blur="manualTouched.roofAreaM2 = true"
              />
              <p class="text-xs text-gray-400 mt-1">Estimate from floor plan or Google Maps</p>
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
                <option value="N">North — poorest (60%)</option>
              </select>
            </div>

            <div>
              <label class="form-label">Roof pitch</label>
              <select v-model.number="manualInputs.roofTiltDeg" class="form-input">
                <option :value="0">Flat (0°)</option>
                <option :value="20">Shallow (20°)</option>
                <option :value="35">Standard (35°) — most common</option>
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
              <p class="text-xs text-gray-400 mt-1">Find on your latest energy bill. UK average ~£1,200/yr</p>
            </div>
          </div>

          <!-- Edge case warnings for manual inputs -->
          <AlertBanner
            v-if="manualWarnings.length"
            :messages="manualWarnings"
            variant="warning"
            class="mt-4"
          />

          <button
            class="btn-primary mt-5 w-full py-3"
            @click="proceedFromManual"
            :disabled="!manualInputs.roofAreaM2"
          >
            Continue →
          </button>
        </div>
      </transition>
    </div>

    <!-- ── Step 1: Bill input (after map confirmed, desktop only) ────────── -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-1">One last detail</h2>
        <p class="text-sm text-gray-500 mb-6">Your annual electricity bill lets us estimate how much of it solar will cover.</p>

        <!-- Roof summary -->
        <div class="bg-solar-50 border border-solar-100 rounded-lg p-4 mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm items-center">
          <div><span class="text-gray-500">Area</span> <span class="font-semibold ml-1">{{ Math.round(mapDataConfirmed.roofAreaM2) }} m²</span></div>
          <div><span class="text-gray-500">Orientation</span> <span class="font-semibold ml-1">{{ mapDataConfirmed.compassDirection }}</span></div>
          <div><span class="text-gray-500">Pitch</span> <span class="font-semibold ml-1">{{ mapDataConfirmed.roofTiltDeg }}°</span></div>
          <div><span class="text-gray-500">Irradiance</span> <span class="font-semibold ml-1">{{ mapDataConfirmed.irradianceKwhM2y }} kWh/m²/yr</span></div>
          <button class="text-solar-600 hover:text-solar-700 text-xs underline ml-auto" @click="currentStep = 0">Edit</button>
        </div>

        <!-- Validation warnings from map data -->
        <AlertBanner
          v-if="roofWarnings.length"
          :messages="roofWarnings"
          variant="warning"
          class="mb-4"
        />

        <div class="max-w-xs">
          <label class="form-label">Annual electricity bill (£)</label>
          <input
            v-model.number="annualBillGbp"
            type="number" min="0" max="50000"
            class="form-input text-lg"
            :class="{ 'border-red-400': billError }"
            placeholder="e.g. 1200"
          />
          <p v-if="billError" class="text-xs text-red-600 mt-1">{{ billError }}</p>
          <p v-else class="text-xs text-gray-400 mt-1">UK average home: ~£1,200/year. Commercial sites vary.</p>
        </div>

        <button class="btn-primary mt-6 w-full py-3" @click="proceedFromBill">Continue to your details →</button>
      </div>
      <button class="btn-secondary text-sm" @click="currentStep = 0">← Back to map</button>
    </div>

    <!-- ── Step 2: User Details ───────────────────────────────────────────── -->
    <div v-if="currentStep === 2">
      <div class="card">
        <UserDetailsForm
          :calculation-summary="formSummary"
          @submitted="onDetailsSubmitted"
        />
      </div>
      <button class="btn-secondary mt-4 text-sm" @click="currentStep = isMobile ? 0 : 1">← Back</button>
    </div>

    <!-- ── Step 3: Confirmation ───────────────────────────────────────────── -->
    <div v-if="currentStep === 3">
      <SubmissionConfirmation
        :email="userDetails.email"
        :results="calculationResults"
        :generating-pdf="generatingPdf"
        @downloadPdf="downloadPdf"
        @viewResults="currentStep = 4"
        @restart="restart"
      />
    </div>

    <!-- ── Step 4: Full Results ───────────────────────────────────────────── -->
    <div v-if="currentStep === 4">
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
import { ref, reactive, computed, onMounted } from 'vue'
import MapDrawer              from '@/components/MapDrawer.vue'
import UserDetailsForm        from '@/components/UserDetailsForm.vue'
import ResultsPanel           from '@/components/ResultsPanel.vue'
import SubmissionConfirmation from '@/components/SubmissionConfirmation.vue'
import AlertBanner            from '@/components/AlertBanner.vue'
import { calculateSolar }     from '@/services/calculatorService'
import { fallbackIrradiance, fallbackMonthly } from '@/services/pvgisService'
import { orientationEfficiency } from '@/services/googleMapsService'
import { isMapUnusable }      from '@/services/deviceService'
import { validateRoofInputs, validateBillInput } from '@/services/validationService'
import { generatePDF }        from '@/services/pdfService'

// Steps: map(0), bill(1), details(2), confirmation(3), full-results(4)
const steps    = ['Draw roof', 'Bill info', 'Your details', 'Results']
const currentStep = ref(0)
const showManual  = ref(false)
const isMobile    = ref(false)

// Core data
const mapDataConfirmed   = ref(null)
const userDetails        = ref(null)
const calculationResults = ref(null)
const annualBillGbp      = ref(1200)
const generatingPdf      = ref(false)

// Bill validation
const billError = computed(() => {
  const { error } = validateBillInput(annualBillGbp.value)
  return error
})

// Roof warnings (from map data)
const roofWarnings = computed(() => {
  if (!mapDataConfirmed.value) return []
  const { warnings } = validateRoofInputs({
    roofAreaM2:        mapDataConfirmed.value.roofAreaM2,
    irradianceKwhM2y:  mapDataConfirmed.value.irradianceKwhM2y,
    roofTiltDeg:       mapDataConfirmed.value.roofTiltDeg ?? 35,
    orientationFactor: mapDataConfirmed.value.orientationFactor
  })
  return warnings
})

// Summary passed to UserDetailsForm (includes calculated results for Formspree payload)
const formSummary = computed(() => ({
  ...mapDataConfirmed.value,
  annualBillGbp: annualBillGbp.value,
  ...(calculationResults.value ?? {})
}))

// Manual mode state
const compassToHeading = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }
const manualInputs = reactive({
  roofAreaM2: null, compassDirection: 'S', roofTiltDeg: 35,
  postcode: '', annualBillGbp: 1200, _lat: 52.0
})
const manualTouched = reactive({ roofAreaM2: false })

const manualWarnings = computed(() => {
  if (!manualInputs.roofAreaM2) return []
  const heading = compassToHeading[manualInputs.compassDirection] ?? 180
  const { warnings } = validateRoofInputs({
    roofAreaM2:        manualInputs.roofAreaM2,
    irradianceKwhM2y:  fallbackIrradiance(manualInputs._lat ?? 52),
    roofTiltDeg:       manualInputs.roofTiltDeg,
    orientationFactor: orientationEfficiency(heading)
  })
  return warnings
})

onMounted(() => {
  isMobile.value = isMapUnusable()
  window.addEventListener('resize', () => { isMobile.value = isMapUnusable() })
})

// ── Postcode → lat lookup ────────────────────────────────────────────────
function lookupPostcode() {
  const prefix = manualInputs.postcode.trim().toUpperCase().replace(/\d.*$/, '').slice(0, 2)
  const latByArea = {
    AB:57.1,DD:56.5,EH:55.9,G:55.8,KY:56.2,FK:56.0,PA:55.9,DG:55.1,TD:55.6,
    CA:54.8,NE:54.9,SR:54.9,DH:54.8,TS:54.5,HG:54.1,YO:53.9,LS:53.8,BD:53.8,
    HX:53.7,WF:53.7,HD:53.6,DN:53.5,S:53.4,HU:53.7,LN:53.2,NG:52.9,DE:52.9,
    ST:52.9,SK:53.4,M:53.5,OL:53.5,BL:53.6,WN:53.5,PR:53.8,FY:53.8,LA:54.1,
    BB:53.7,CH:53.2,CW:53.1,TF:52.7,WV:52.6,WS:52.6,B:52.5,CV:52.4,LE:52.6,
    PE:52.6,NR:52.6,IP:52.1,CO:51.9,CM:51.7,SS:51.5,RM:51.5,IG:51.5,E:51.5,
    N:51.5,NW:51.5,W:51.5,SW:51.5,SE:51.5,EC:51.5,WC:51.5,BR:51.4,DA:51.4,
    ME:51.3,TN:51.1,CT:51.3,BN:50.8,PO:50.8,SO:50.9,RG:51.4,GU:51.2,KT:51.4,
    SM:51.4,CR:51.4,SL:51.5,OX:51.7,MK:52.0,LU:51.9,AL:51.7,SG:51.9,EN:51.7,
    WD:51.7,HP:51.7,NN:52.2,CB:52.2,GL:51.8,HR:52.1,WR:52.2,DY:52.5,BS:51.4,
    BA:51.4,TA:51.0,EX:50.7,PL:50.4,TR:50.1,TQ:50.4,DT:50.7,SP:51.0,SN:51.6,
    CF:51.5,SA:51.7,NP:51.6,LD:52.2,LL:53.2,BT:54.6,SY:52.7
  }
  manualInputs._lat = latByArea[prefix] ?? 52.0
}

// ── Step handlers ─────────────────────────────────────────────────────────
function onMapConfirmed(data) {
  mapDataConfirmed.value = data
  // Pre-run calculation so formSummary is populated before step 2
  runCalculation()
  currentStep.value = 1
}

function proceedFromManual() {
  if (!manualInputs.roofAreaM2) return
  const heading   = compassToHeading[manualInputs.compassDirection] ?? 180
  const lat       = manualInputs._lat ?? 52.0
  const irradiance = fallbackIrradiance(lat)
  const monthly   = fallbackMonthly(irradiance)

  annualBillGbp.value = manualInputs.annualBillGbp

  mapDataConfirmed.value = {
    roofAreaM2:       manualInputs.roofAreaM2,
    roofHeadingDeg:   heading,
    compassDirection: manualInputs.compassDirection,
    orientationFactor: orientationEfficiency(heading),
    irradianceKwhM2y: irradiance,
    roofTiltDeg:      manualInputs.roofTiltDeg,
    monthlyData:      monthly,
    lat, lng: -1.5
  }
  runCalculation()
  currentStep.value = 2  // skip bill step — already collected
}

function proceedFromBill() {
  if (billError.value) return
  currentStep.value = 2
}

function runCalculation() {
  if (!mapDataConfirmed.value) return
  calculationResults.value = calculateSolar({
    roofAreaM2:       mapDataConfirmed.value.roofAreaM2,
    irradianceKwhM2y: mapDataConfirmed.value.irradianceKwhM2y,
    orientationFactor: mapDataConfirmed.value.orientationFactor,
    roofTiltDeg:      mapDataConfirmed.value.roofTiltDeg ?? 35,
    annualBillGbp:    annualBillGbp.value
  })
}

function onDetailsSubmitted(details) {
  userDetails.value = details
  // Recalculate with final bill value (may have changed on bill step)
  runCalculation()
  currentStep.value = 3
}

async function downloadPdf() {
  generatingPdf.value = true
  try {
    await generatePDF({
      results:       calculationResults.value,
      mapData:       mapDataConfirmed.value,
      userDetails:   userDetails.value,
      annualBillGbp: annualBillGbp.value,
      monthlyData:   mapDataConfirmed.value?.monthlyData ?? []
    })
  } finally {
    generatingPdf.value = false
  }
}

function loadDemo() {
  // Pre-fill a realistic 236 kWp Birmingham warehouse scenario
  Object.assign(manualInputs, {
    roofAreaM2:       1500,    // m² — medium warehouse roof
    compassDirection: 'S',     // south-facing
    roofTiltDeg:      20,      // shallow ballasted tilt — typical commercial flat
    postcode:         'B1 1AA',
    annualBillGbp:    85000,   // £85k/yr — realistic commercial
    _lat:             52.5     // Birmingham
  })
  proceedFromManual()
}

function restart() {
  currentStep.value = 0
  mapDataConfirmed.value = null
  userDetails.value = null
  calculationResults.value = null
  showManual.value = false
  annualBillGbp.value = 1200
  Object.assign(manualInputs, {
    roofAreaM2: null, compassDirection: 'S', roofTiltDeg: 35,
    postcode: '', annualBillGbp: 1200, _lat: 52.0
  })
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
