<template>
  <div class="max-w-5xl mx-auto px-4 py-8">

    <!-- Step indicator -->
    <div v-if="currentStep < 3" class="flex items-center justify-center gap-2 mb-8">
      <template v-for="(label, i) in steps" :key="i">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            :class="currentStep > i ? 'bg-solar-500 text-white' : currentStep === i ? 'bg-solar-100 text-solar-700 ring-2 ring-solar-400' : 'bg-gray-100 text-gray-400'">
            <svg v-if="currentStep > i" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="text-sm font-medium hidden sm:inline transition-colors" :class="currentStep === i ? 'text-solar-700' : currentStep > i ? 'text-gray-600' : 'text-gray-400'">{{ label }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="h-px w-6 sm:w-12 bg-gray-200 flex-shrink-0"></div>
      </template>
    </div>

    <!-- ── Step 0: Map / Manual entry ─────────────────────────────────────── -->
    <div v-if="currentStep === 0" class="space-y-4">

      <!-- Demo banner -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex items-start gap-3 flex-1">
          <span class="text-xl shrink-0">🏭</span>
          <div>
            <p class="font-semibold text-amber-900 text-sm">Want to see results straight away?</p>
            <p class="text-amber-800 text-xs mt-0.5">Load a pre-filled 236 kWp Birmingham warehouse example — no map needed.</p>
          </div>
        </div>
        <button class="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors" @click="loadDemo">
          Load demo scenario
        </button>
      </div>

      <!-- Mobile notice -->
      <div v-if="isMobile" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-800">
        <span>📱</span>
        <div>
          <p class="font-semibold">Map drawing works best on desktop</p>
          <p class="text-blue-700 mt-0.5">Use manual entry below — it's just as accurate for initial estimates.</p>
        </div>
      </div>

      <!-- Map (desktop only) -->
      <div v-if="!isMobile" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Draw your roof(s)</h2>
        <p class="text-sm text-gray-500 mb-4">Search your site address, zoom to satellite view, then trace each roof. Add multiple buildings on the same site for combined results.</p>
        <MapDrawer @confirmed="onSiteConfirmed" @manualMode="showManual = true" />
      </div>

      <!-- Divider -->
      <div v-if="!isMobile && !showManual" class="flex items-center gap-3 text-sm text-gray-400">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span>or enter details manually</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div v-if="!isMobile && !showManual" class="text-center">
        <button class="btn-secondary text-sm" @click="showManual = true">Use manual entry</button>
      </div>

      <!-- Manual entry -->
      <transition name="slide-down">
        <div v-if="showManual || isMobile" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">{{ isMobile ? 'Enter your site details' : 'Manual entry' }}</h3>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">No map required</span>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Total roof area (m²) <span class="text-red-500">*</span></label>
              <input v-model.number="manualInputs.roofAreaM2" type="number" min="50" max="20000" class="form-input" placeholder="e.g. 1500" @blur="manualTouched.roofAreaM2 = true" />
              <p class="text-xs text-gray-400 mt-1">Combined usable roof area across all buildings on site</p>
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
                <option :value="0">Flat (0°) — ballast frames recommended</option>
                <option :value="20">Shallow (20°)</option>
                <option :value="35">Standard (35°) — most common</option>
                <option :value="45">Steep (45°)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Site postcode</label>
              <input v-model="manualInputs.postcode" type="text" class="form-input" placeholder="e.g. B1 1AA" @blur="lookupPostcode" />
              <p class="text-xs text-gray-400 mt-1">Used to estimate local solar irradiance</p>
            </div>
          </div>
          <button class="btn-primary mt-5 w-full py-3" @click="proceedFromManual" :disabled="!manualInputs.roofAreaM2">
            Continue to energy details →
          </button>
        </div>
      </transition>
    </div>

    <!-- ── Step 1: Energy inputs ──────────────────────────────────────────── -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Energy & funding details</h2>
        <p class="text-sm text-gray-500 mb-6">Two quick inputs to tailor your financial projection.</p>

        <!-- Site summary -->
        <div class="bg-solar-50 border border-solar-100 rounded-lg p-4 mb-6">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Site summary</p>
          <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div v-for="b in siteData.buildings" :key="b.name">
              <span class="text-gray-500">{{ b.name }}</span>
              <span class="font-semibold ml-1">{{ Math.round(b.roofAreaM2) }} m² · {{ b.compassDirection }} · {{ b.roofTiltDeg }}°</span>
            </div>
            <div><span class="text-gray-500">Irradiance</span> <span class="font-semibold ml-1">{{ siteData.irradianceKwhM2y }} kWh/m²/yr</span></div>
          </div>
          <button class="text-solar-600 hover:text-solar-700 text-xs underline mt-2" @click="currentStep = 0">Edit roofs</button>
        </div>

        <!-- Unit rate -->
        <div class="mb-6">
          <label class="form-label text-base">Your current electricity unit rate <span class="text-red-500">*</span></label>
          <p class="text-xs text-gray-400 mb-2">Find on your energy bill or check your current contract. Typical commercial rate: 20–30p/kWh.</p>
          <div class="flex items-center gap-2 max-w-xs">
            <input v-model.number="unitRatePence" type="number" min="5" max="100" step="0.1" class="form-input text-lg flex-1" :class="{ 'border-red-400': unitRateError }" placeholder="24.5" />
            <span class="text-gray-500 font-medium">p/kWh</span>
          </div>
          <p v-if="unitRateError" class="text-xs text-red-600 mt-1">{{ unitRateError }}</p>
        </div>

        <!-- Funding model -->
        <div class="mb-6">
          <label class="form-label text-base">Funding model</label>
          <p class="text-xs text-gray-400 mb-3">Capital purchase: you fund and own the system. PPA: developer funds the install, you pay a fixed rate per kWh generated.</p>
          <div class="grid sm:grid-cols-2 gap-3">
            <button type="button" class="rounded-xl border-2 p-4 text-left transition-all"
              :class="fundingModel === 'capital' ? 'border-solar-500 bg-solar-50' : 'border-gray-200 hover:border-solar-300'"
              @click="fundingModel = 'capital'">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" :class="fundingModel === 'capital' ? 'border-solar-500' : 'border-gray-300'">
                  <div v-if="fundingModel === 'capital'" class="w-2 h-2 rounded-full bg-solar-500"></div>
                </div>
                <span class="font-semibold text-gray-900">Capital Purchase</span>
              </div>
              <p class="text-xs text-gray-500">Own the system outright. Best long-term ROI. Upfront investment, fastest payback after break-even.</p>
            </button>
            <button type="button" class="rounded-xl border-2 p-4 text-left transition-all"
              :class="fundingModel === 'ppa' ? 'border-solar-500 bg-solar-50' : 'border-gray-200 hover:border-solar-300'"
              @click="fundingModel = 'ppa'">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" :class="fundingModel === 'ppa' ? 'border-solar-500' : 'border-gray-300'">
                  <div v-if="fundingModel === 'ppa'" class="w-2 h-2 rounded-full bg-solar-500"></div>
                </div>
                <span class="font-semibold text-gray-900">Power Purchase Agreement</span>
              </div>
              <p class="text-xs text-gray-500">No upfront cost. Developer installs and maintains the system. You pay a fixed rate per kWh — typically 20% below your grid rate.</p>
            </button>
          </div>
        </div>

        <!-- PPA duration (if PPA selected) -->
        <div v-if="fundingModel === 'ppa'" class="mb-6">
          <label class="form-label">PPA contract duration</label>
          <div class="flex gap-2 flex-wrap">
            <button v-for="d in [10, 15, 20, 25]" :key="d" type="button"
              class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
              :class="ppaDuration === d ? 'bg-solar-500 border-solar-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-solar-400'"
              @click="ppaDuration = d">
              {{ d }} years{{ d === 20 ? ' (default)' : '' }}
            </button>
          </div>
        </div>

        <button class="btn-primary w-full py-3 text-base" @click="proceedToResults">
          Calculate & see results →
        </button>
      </div>
      <button class="btn-secondary text-sm" @click="currentStep = 0">← Back to roof details</button>
    </div>

    <!-- ── Step 2: Results ────────────────────────────────────────────────── -->
    <div v-if="currentStep === 2">
      <ResultsPanel
        :results="calculationResults"
        :site-data="siteData"
        :unit-rate-pence="unitRatePence"
        :funding-model="fundingModel"
        :ppa-duration="ppaDuration"
        @getReport="currentStep = 3"
        @restart="restart"
      />
      <button class="btn-secondary mt-4 text-sm" @click="currentStep = 1">← Edit energy details</button>
    </div>

    <!-- ── Step 3: Contact form (report request) ──────────────────────────── -->
    <div v-if="currentStep === 3">
      <div class="card">
        <UserDetailsForm
          :calculation-summary="formSummary"
          @submitted="onDetailsSubmitted"
        />
      </div>
      <button class="btn-secondary mt-4 text-sm" @click="currentStep = 2">← Back to results</button>
    </div>

    <!-- ── Step 4: Confirmation ───────────────────────────────────────────── -->
    <div v-if="currentStep === 4">
      <SubmissionConfirmation
        :email="userDetails.email"
        :results="calculationResults"
        :generating-pdf="generatingPdf"
        @downloadPdf="downloadPdf"
        @viewResults="currentStep = 2"
        @restart="restart"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import MapDrawer              from '@/components/MapDrawer.vue'
import UserDetailsForm        from '@/components/UserDetailsForm.vue'
import ResultsPanel           from '@/components/ResultsPanel.vue'
import SubmissionConfirmation from '@/components/SubmissionConfirmation.vue'
import { calculateSolar }     from '@/services/calculatorService'
import { fallbackIrradiance, fallbackMonthly } from '@/services/pvgisService'
import { orientationEfficiency } from '@/services/googleMapsService'
import { isMapUnusable }      from '@/services/deviceService'
import { validateUnitRate }   from '@/services/validationService'
import { storageService }     from '@/services/storageService'
import { generatePDF }        from '@/services/pdfService'

const steps = ['Draw roofs', 'Energy details', 'Your results']

const currentStep = ref(0)
const showManual  = ref(false)
const isMobile    = ref(false)

// Site data from map or manual entry
const siteData           = ref(null)
const calculationResults = ref(null)
const userDetails        = ref(null)
const generatingPdf      = ref(false)

// Energy inputs
const unitRatePence = ref(storageService.load('unitRate', 24.5))
const fundingModel  = ref(storageService.load('fundingModel', 'capital'))
const ppaDuration   = ref(storageService.load('ppaDuration', 20))

const unitRateError = computed(() => {
  const { error } = validateUnitRate(unitRatePence.value)
  return error
})

const formSummary = computed(() => ({
  ...(siteData.value ?? {}),
  unitRatePence: unitRatePence.value,
  fundingModel:  fundingModel.value,
  ppaDuration:   ppaDuration.value,
  ...(calculationResults.value ?? {})
}))

// Persist energy inputs to localStorage
watch(unitRatePence, v => storageService.save('unitRate', v))
watch(fundingModel,  v => storageService.save('fundingModel', v))
watch(ppaDuration,   v => storageService.save('ppaDuration', v))

// Manual entry state
const COMPASS_TO_HEADING = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }
const manualInputs = reactive({ roofAreaM2: null, compassDirection: 'S', roofTiltDeg: 35, postcode: '', _lat: 52.0 })
const manualTouched = reactive({ roofAreaM2: false })

onMounted(() => {
  isMobile.value = isMapUnusable()
  window.addEventListener('resize', () => { isMobile.value = isMapUnusable() })
})

// ── Postcode → lat ────────────────────────────────────────────────────────
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
function onSiteConfirmed(data) {
  siteData.value = data
  currentStep.value = 1
}

function proceedFromManual() {
  if (!manualInputs.roofAreaM2) return
  const heading    = COMPASS_TO_HEADING[manualInputs.compassDirection] ?? 180
  const lat        = manualInputs._lat ?? 52.0
  const irradiance = fallbackIrradiance(lat)
  const monthly    = fallbackMonthly(irradiance)

  siteData.value = {
    buildings: [{
      name:             'Building 1',
      roofAreaM2:       manualInputs.roofAreaM2,
      compassDirection: manualInputs.compassDirection,
      orientationFactor: orientationEfficiency(heading),
      roofTiltDeg:      manualInputs.roofTiltDeg,
      roofHeadingDeg:   heading
    }],
    irradianceKwhM2y: irradiance,
    monthlyData:      monthly,
    lat, lng: -1.5
  }
  currentStep.value = 1
}

function proceedToResults() {
  if (unitRateError.value) return
  runCalculation()
  currentStep.value = 2
}

function runCalculation() {
  if (!siteData.value) return
  calculationResults.value = calculateSolar({
    buildings:        siteData.value.buildings,
    irradianceKwhM2y: siteData.value.irradianceKwhM2y,
    unitRatePence:    unitRatePence.value,
    ppaDiscountPct:   20
  })
}

function onDetailsSubmitted(details) {
  userDetails.value = details
  downloadPdf()
  currentStep.value = 4
}

async function downloadPdf() {
  generatingPdf.value = true
  try {
    await generatePDF({
      results:       calculationResults.value,
      siteData:      siteData.value,
      userDetails:   userDetails.value ?? { name: 'Download', company: 'Unknown', email: '', jobTitle: '', telephone: '' },
      unitRatePence: unitRatePence.value,
      fundingModel:  fundingModel.value,
      ppaDuration:   ppaDuration.value
    })
  } finally {
    generatingPdf.value = false
  }
}

function loadDemo() {
  const irradiance = fallbackIrradiance(52.5)
  siteData.value = {
    buildings: [{
      name: 'Warehouse A',
      roofAreaM2: 1500,
      compassDirection: 'S',
      orientationFactor: 1.0,
      roofTiltDeg: 20,
      roofHeadingDeg: 180
    }],
    irradianceKwhM2y: irradiance,
    monthlyData: fallbackMonthly(irradiance),
    lat: 52.5, lng: -1.8
  }
  unitRatePence.value = 24.5
  runCalculation()
  currentStep.value = 2
}

function restart() {
  currentStep.value = 0
  siteData.value = null
  calculationResults.value = null
  userDetails.value = null
  showManual.value = false
  Object.assign(manualInputs, { roofAreaM2: null, compassDirection: 'S', roofTiltDeg: 35, postcode: '', _lat: 52.0 })
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
