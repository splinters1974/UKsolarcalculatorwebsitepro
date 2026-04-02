<template>
  <div class="flex flex-col gap-4">

    <!-- Address Search with Places Autocomplete -->
    <div>
      <label class="form-label">Search your address</label>
      <div class="flex gap-2">
        <div class="relative flex-1">
          <input
            ref="searchInput"
            v-model="addressQuery"
            type="text"
            class="form-input pr-8"
            placeholder="Start typing your address…"
            autocomplete="off"
          />
          <button
            v-if="addressQuery"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="clearSearch"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-1">UK addresses only. Search zooms directly to your building.</p>
    </div>

    <!-- Roof tilt selector -->
    <div>
      <label class="form-label">Roof pitch</label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="opt in tiltOptions"
          :key="opt.value"
          type="button"
          class="rounded-lg border text-sm py-2 px-2 text-center transition-colors"
          :class="selectedTilt === opt.value
            ? 'bg-solar-500 border-solar-500 text-white font-semibold'
            : 'bg-white border-gray-300 text-gray-700 hover:border-solar-400'"
          @click="selectedTilt = opt.value"
        >
          <div class="font-semibold">{{ opt.label }}</div>
          <div class="text-xs opacity-75">{{ opt.desc }}</div>
        </button>
      </div>
    </div>

    <!-- Map container -->
    <div class="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style="height: 450px;">
      <div ref="mapContainer" class="w-full h-full bg-gray-100"></div>

      <!-- Loading / error overlay -->
      <div v-if="!mapsLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div v-if="apiKeyMissing" class="text-center p-6 max-w-sm">
          <div class="text-5xl mb-3">🗝️</div>
          <p class="font-semibold text-gray-800 mb-1">Google Maps API key needed</p>
          <p class="text-sm text-gray-500 mb-4">
            Add your key to <code class="bg-gray-200 px-1 rounded">.env</code> as<br/>
            <code class="bg-gray-200 px-1 rounded text-xs">VITE_GOOGLE_MAPS_API_KEY</code>
          </p>
          <button class="btn-secondary text-sm" @click="$emit('manualMode')">
            Use manual entry instead →
          </button>
        </div>
        <div v-else class="flex items-center gap-3 text-gray-500">
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading map…
        </div>
      </div>
    </div>

    <!-- Drawing instructions (before polygon drawn) -->
    <transition name="fade">
      <div v-if="mapsLoaded && !polygonDrawn" class="bg-solar-50 border border-solar-200 rounded-lg p-4 text-sm text-solar-800">
        <p class="font-semibold mb-2">How to measure your roof:</p>
        <ol class="list-decimal list-inside space-y-1 text-solar-700">
          <li>Search your address above — the map will zoom to your building</li>
          <li>Click the <strong>pentagon icon</strong> in the map's top-right toolbar</li>
          <li>Click around the roof outline — each click places a point</li>
          <li>Double-click the last point (or click the first) to finish</li>
          <li>You can drag the yellow handles to adjust the shape</li>
        </ol>
      </div>
    </transition>

    <!-- Measurement summary (after polygon drawn) -->
    <transition name="fade">
      <div v-if="polygonDrawn" class="space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <div class="card text-center py-3">
            <p class="text-2xl font-bold text-solar-600">
              {{ Math.round(roofAreaM2) }}<span class="text-base font-normal">m²</span>
            </p>
            <p class="text-xs text-gray-500 mt-1">Roof area drawn</p>
          </div>
          <div class="card text-center py-3">
            <p class="text-2xl font-bold text-solar-600">{{ compassDirection }}</p>
            <p class="text-xs text-gray-500 mt-1">Roof orientation</p>
            <p class="text-xs text-gray-400">{{ Math.round(orientationFactorPct) }}% efficient</p>
          </div>
          <div class="card text-center py-3">
            <div v-if="irradianceLoading" class="flex items-center justify-center h-8">
              <svg class="animate-spin h-5 w-5 text-solar-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
            <p v-else class="text-2xl font-bold text-solar-600">{{ irradianceKwhM2y }}</p>
            <p class="text-xs text-gray-500 mt-1">kWh/m²/year</p>
            <p class="text-xs text-gray-400">Solar irradiance</p>
          </div>
        </div>

        <!-- PVGIS error notice -->
        <div v-if="pvgisError" class="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <span class="text-base">⚠️</span>
          <span>Could not fetch live irradiance data — using estimated UK average for your latitude instead. Results will still be a good guide.</span>
        </div>

        <!-- Monthly mini-bars (if PVGIS data available) -->
        <div v-if="monthlyData.length && !pvgisError" class="card py-3">
          <p class="text-xs font-semibold text-gray-600 mb-3">Estimated monthly generation profile</p>
          <div class="flex items-end gap-1 h-14">
            <div
              v-for="m in monthlyData"
              :key="m.month"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-t"
                :style="{ height: `${(m.yieldKwh / maxMonthlyYield) * 48}px`, background: '#f59e0b' }"
                :title="`${m.monthName}: ${m.yieldKwh} kWh/kWp`"
              ></div>
              <span class="text-gray-400" style="font-size:9px">{{ m.monthName }}</span>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-2 text-right">kWh per kWp installed · source: PVGIS</p>
        </div>

        <div class="flex gap-3">
          <button
            class="btn-primary flex-1 py-3"
            @click="confirmRoof"
            :disabled="irradianceLoading"
          >
            {{ irradianceLoading ? 'Fetching solar data…' : 'Use this roof →' }}
          </button>
          <button class="btn-secondary px-4" @click="clearPolygon" title="Redraw">
            ↺ Redraw
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  loadGoogleMaps,
  calculatePolygonAreaM2,
  calculateRoofOrientation,
  headingToCompass,
  orientationEfficiency
} from '@/services/googleMapsService'
import { fetchSolarData, fallbackIrradiance, fallbackMonthly, annotateMonths } from '@/services/pvgisService'

const emit = defineEmits(['confirmed', 'manualMode'])

// Refs
const mapContainer = ref(null)
const searchInput   = ref(null)
const addressQuery  = ref('')

// State
const mapsLoaded       = ref(false)
const apiKeyMissing    = ref(false)
const polygonDrawn     = ref(false)
const irradianceLoading = ref(false)
const pvgisError       = ref(false)

// Roof data
const roofAreaM2        = ref(0)
const roofHeadingDeg    = ref(180)
const irradianceKwhM2y  = ref(0)
const monthlyData       = ref([])
const lat = ref(52.0)
const lng = ref(-1.5)

// Roof tilt
const selectedTilt = ref(35)
const tiltOptions = [
  { value: 0,  label: 'Flat',   desc: '0°' },
  { value: 20, label: 'Shallow', desc: '20°' },
  { value: 35, label: 'Standard', desc: '35°' },
  { value: 45, label: 'Steep',  desc: '45°' }
]

// Google Maps instances
let map = null
let drawingManager = null
let autocomplete = null
let currentPolygon = null

// Computed
const compassDirection = computed(() => headingToCompass(roofHeadingDeg.value))
const orientationFactorPct = computed(() => orientationEfficiency(roofHeadingDeg.value) * 100)
const maxMonthlyYield = computed(() => Math.max(...monthlyData.value.map(m => m.yieldKwh), 1))

const pvgisAzimuth = computed(() => {
  const h = roofHeadingDeg.value
  return h > 180 ? h - 360 : h
})

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey.startsWith('PLACEHOLDER')) {
    apiKeyMissing.value = true
    return
  }

  try {
    await loadGoogleMaps()
    initMap()
    initAutocomplete()
    mapsLoaded.value = true
  } catch (err) {
    console.error('Maps load failed:', err)
    apiKeyMissing.value = true
  }
})

function initMap() {
  const maps = window.google.maps
  map = new maps.Map(mapContainer.value, {
    center: { lat: 52.5, lng: -1.5 },
    zoom: 6,
    mapTypeId: 'satellite',
    tilt: 0,
    disableDefaultUI: false,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeControlOptions: {
      style: maps.MapTypeControlStyle.DROPDOWN_MENU,
      mapTypeIds: ['satellite', 'roadmap', 'hybrid']
    }
  })

  drawingManager = new maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: true,
    drawingControlOptions: {
      position: maps.ControlPosition.TOP_RIGHT,
      drawingModes: [maps.drawing.OverlayType.POLYGON]
    },
    polygonOptions: {
      fillColor: '#f59e0b',
      fillOpacity: 0.30,
      strokeColor: '#d97706',
      strokeWeight: 2,
      editable: true,
      draggable: true
    }
  })

  drawingManager.setMap(map)
  maps.event.addListener(drawingManager, 'polygoncomplete', onPolygonComplete)
}

function initAutocomplete() {
  if (!searchInput.value || !window.google) return

  autocomplete = new window.google.maps.places.Autocomplete(searchInput.value, {
    componentRestrictions: { country: 'gb' },
    fields: ['geometry', 'formatted_address'],
    types: ['geocode', 'establishment']
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry?.location) return

    addressQuery.value = place.formatted_address || ''
    map.setCenter(place.geometry.location)
    map.setZoom(19)
    map.setMapTypeId('satellite')
  })
}

async function onPolygonComplete(polygon) {
  if (currentPolygon) currentPolygon.setMap(null)
  currentPolygon = polygon
  drawingManager.setDrawingMode(null)

  // Listen for edits to recalculate
  window.google.maps.event.addListener(polygon.getPath(), 'set_at', recalculateFromPolygon)
  window.google.maps.event.addListener(polygon.getPath(), 'insert_at', recalculateFromPolygon)

  await recalculateFromPolygon()
  polygonDrawn.value = true
}

async function recalculateFromPolygon() {
  roofAreaM2.value = calculatePolygonAreaM2(currentPolygon)
  roofHeadingDeg.value = calculateRoofOrientation(currentPolygon)

  // Get centroid
  const bounds = new window.google.maps.LatLngBounds()
  currentPolygon.getPath().forEach(p => bounds.extend(p))
  const centre = bounds.getCenter()
  lat.value = centre.lat()
  lng.value = centre.lng()

  await fetchIrradiance()
}

async function fetchIrradiance() {
  irradianceLoading.value = true
  pvgisError.value = false
  monthlyData.value = []

  try {
    const result = await fetchSolarData(lat.value, lng.value, selectedTilt.value, pvgisAzimuth.value)
    irradianceKwhM2y.value = result.annual.irradiance || result.annual.yieldPerKwp
    monthlyData.value = annotateMonths(result.monthly)
  } catch (err) {
    console.warn('PVGIS fetch failed, using fallback:', err)
    pvgisError.value = true
    irradianceKwhM2y.value = fallbackIrradiance(lat.value)
    const fallback = fallbackMonthly(fallbackIrradiance(lat.value))
    monthlyData.value = fallback
  } finally {
    irradianceLoading.value = false
  }
}

function confirmRoof() {
  emit('confirmed', {
    roofAreaM2: roofAreaM2.value,
    roofHeadingDeg: roofHeadingDeg.value,
    compassDirection: compassDirection.value,
    orientationFactor: orientationEfficiency(roofHeadingDeg.value),
    irradianceKwhM2y: irradianceKwhM2y.value,
    roofTiltDeg: selectedTilt.value,
    monthlyData: monthlyData.value,
    lat: lat.value,
    lng: lng.value
  })
}

function clearPolygon() {
  if (currentPolygon) {
    currentPolygon.setMap(null)
    currentPolygon = null
  }
  polygonDrawn.value = false
  roofAreaM2.value = 0
  irradianceKwhM2y.value = 0
  monthlyData.value = []
  pvgisError.value = false
}

function clearSearch() {
  addressQuery.value = ''
  if (searchInput.value) searchInput.value.focus()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
