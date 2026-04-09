<template>
  <div class="flex flex-col gap-4">

    <!-- Address Search -->
    <div>
      <label class="form-label">Search your site address</label>
      <div class="relative">
        <input ref="searchInput" v-model="addressQuery" type="text" class="form-input pr-8" placeholder="Start typing your address…" autocomplete="off" />
        <button v-if="addressQuery" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="clearSearch" type="button">✕</button>
      </div>
      <p class="text-xs text-gray-400 mt-1">UK addresses only. Search zooms to your site.</p>
    </div>

    <!-- Map -->
    <div class="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style="height: 450px;">
      <div ref="mapContainer" class="w-full h-full bg-gray-100"></div>
      <div v-if="!mapsLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div v-if="apiKeyMissing" class="text-center p-6 max-w-sm">
          <div class="text-5xl mb-3">🗝️</div>
          <p class="font-semibold text-gray-800 mb-1">Google Maps API key needed</p>
          <p class="text-sm text-gray-500 mb-4">Add your key to <code class="bg-gray-200 px-1 rounded">.env</code> as <code class="bg-gray-200 px-1 rounded text-xs">VITE_GOOGLE_MAPS_API_KEY</code></p>
          <button class="btn-secondary text-sm" @click="$emit('manualMode')">Use manual entry instead →</button>
        </div>
        <div v-else class="flex items-center gap-3 text-gray-500">
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          Loading map…
        </div>
      </div>
    </div>

    <!-- Drawing instructions -->
    <transition name="fade">
      <div v-if="mapsLoaded && buildings.length === 0" class="bg-solar-50 border border-solar-200 rounded-lg p-4 text-sm text-solar-800">
        <p class="font-semibold mb-2">How to map your roofs:</p>
        <ol class="list-decimal list-inside space-y-1 text-solar-700">
          <li>Search your site address above</li>
          <li>Click the <strong>pentagon icon</strong> in the map toolbar (top-right)</li>
          <li>Click around the roof outline — each click places a point</li>
          <li>Double-click to finish the shape</li>
          <li>Use <strong>Add another building</strong> to trace additional roofs on the same site</li>
        </ol>
      </div>
    </transition>

    <!-- PVGIS loading -->
    <div v-if="irradianceLoading" class="flex items-center gap-3 text-sm text-solar-700 bg-solar-50 border border-solar-200 rounded-lg p-3">
      <svg class="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
      Fetching solar irradiance for this location from PVGIS…
    </div>

    <!-- PVGIS error -->
    <div v-if="pvgisError" class="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <span class="shrink-0">⚠️</span>
      <span>Could not fetch live irradiance data — using estimated UK average for this latitude. Results remain a reliable guide.</span>
    </div>

    <!-- Buildings list -->
    <transition name="fade">
      <div v-if="buildings.length > 0" class="space-y-3">

        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Buildings on this site</h3>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ buildings.length }} building{{ buildings.length !== 1 ? 's' : '' }} · {{ Math.round(totalRoofArea) }} m² total</span>
        </div>

        <!-- Per-building card -->
        <div v-for="b in buildings" :key="b.id" class="card border-l-4 border-solar-400 py-3">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-800 text-sm">{{ b.name }}</span>
            <button class="text-xs text-red-500 hover:text-red-700 underline" @click="removeBuilding(b.id)">Remove</button>
          </div>
          <div class="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p class="text-gray-400 mb-1">Roof area</p>
              <p class="font-bold text-gray-800 text-sm">{{ Math.round(b.roofAreaM2) }} m²</p>
              <p class="text-gray-400">~{{ Math.floor(b.roofAreaM2 * 0.70 / 2.0) }} panels est.</p>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Orientation</p>
              <select v-model="b.compassDirection" class="form-input text-xs py-1 px-2 w-full" @change="updateBuildingOrientation(b)">
                <option value="S">South (100%)</option>
                <option value="SE">SE (96%)</option>
                <option value="SW">SW (96%)</option>
                <option value="E">East (85%)</option>
                <option value="W">West (85%)</option>
                <option value="NE">NE (70%)</option>
                <option value="NW">NW (70%)</option>
                <option value="N">North (60%)</option>
              </select>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Roof pitch</p>
              <select v-model.number="b.roofTiltDeg" class="form-input text-xs py-1 px-2 w-full">
                <option :value="0">Flat (0°)</option>
                <option :value="20">Shallow (20°)</option>
                <option :value="35">Standard (35°)</option>
                <option :value="45">Steep (45°)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Site summary -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card text-center py-3">
            <p class="text-xl font-bold text-solar-600">{{ Math.round(totalRoofArea) }}<span class="text-sm font-normal">m²</span></p>
            <p class="text-xs text-gray-500 mt-0.5">Total roof area</p>
          </div>
          <div class="card text-center py-3">
            <p class="text-xl font-bold text-solar-600">~{{ estimatedPanels }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Est. panels</p>
          </div>
          <div class="card text-center py-3">
            <div v-if="irradianceLoading" class="flex justify-center h-7 items-center">
              <svg class="animate-spin h-4 w-4 text-solar-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            </div>
            <p v-else class="text-xl font-bold text-solar-600">{{ siteIrradiance }}</p>
            <p class="text-xs text-gray-500 mt-0.5">kWh/m²/yr</p>
          </div>
        </div>

        <!-- Monthly profile -->
        <div v-if="monthlyData.length && !pvgisError" class="card py-3">
          <p class="text-xs font-semibold text-gray-600 mb-3">Monthly irradiance profile (kWh/kWp · PVGIS)</p>
          <div class="flex items-end gap-1 h-14">
            <div v-for="m in monthlyData" :key="m.month" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-t" :style="{ height: `${(m.yieldKwh / maxMonthlyYield) * 48}px`, background: '#f59e0b' }"></div>
              <span class="text-gray-400" style="font-size:9px">{{ m.monthName }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button class="btn-secondary flex-1 text-sm" @click="enableDrawing" :disabled="irradianceLoading">
            + Add another building
          </button>
          <button class="btn-primary flex-1 py-3" @click="confirmAllBuildings" :disabled="irradianceLoading">
            {{ irradianceLoading ? 'Fetching data…' : 'Confirm site →' }}
          </button>
        </div>

      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadGoogleMaps, calculatePolygonAreaM2, calculateRoofOrientation, headingToCompass, orientationEfficiency } from '@/services/googleMapsService'
import { fetchSolarData, fallbackIrradiance, fallbackMonthly, annotateMonths } from '@/services/pvgisService'

const emit = defineEmits(['confirmed', 'manualMode'])

const mapContainer = ref(null)
const searchInput  = ref(null)
const addressQuery = ref('')

const mapsLoaded        = ref(false)
const apiKeyMissing     = ref(false)
const irradianceLoading = ref(false)
const pvgisError        = ref(false)

const siteIrradiance = ref(0)
const monthlyData    = ref([])
const siteLat        = ref(52.0)
const siteLng        = ref(-1.5)
const pvgisFetched   = ref(false)

const buildings = ref([])

const COMPASS_TO_HEADING = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }

let map            = null
let drawingManager = null
let autocomplete   = null

const totalRoofArea   = computed(() => buildings.value.reduce((s, b) => s + b.roofAreaM2, 0))
const estimatedPanels = computed(() => Math.floor(totalRoofArea.value * 0.70 / 2.0))
const maxMonthlyYield = computed(() => Math.max(...monthlyData.value.map(m => m.yieldKwh), 1))

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey.startsWith('PLACEHOLDER')) { apiKeyMissing.value = true; return }
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
    center: { lat: 52.5, lng: -1.5 }, zoom: 6, mapTypeId: 'satellite', tilt: 0,
    streetViewControl: false, mapTypeControl: true, fullscreenControl: true, zoomControl: true,
    mapTypeControlOptions: { style: maps.MapTypeControlStyle.DROPDOWN_MENU, mapTypeIds: ['satellite', 'roadmap', 'hybrid'] }
  })
  drawingManager = new maps.drawing.DrawingManager({
    drawingMode: null, drawingControl: true,
    drawingControlOptions: { position: maps.ControlPosition.TOP_RIGHT, drawingModes: [maps.drawing.OverlayType.POLYGON] },
    polygonOptions: { fillColor: '#f59e0b', fillOpacity: 0.30, strokeColor: '#d97706', strokeWeight: 2, editable: true, draggable: false }
  })
  drawingManager.setMap(map)
  maps.event.addListener(drawingManager, 'polygoncomplete', onPolygonComplete)
}

function initAutocomplete() {
  if (!searchInput.value || !window.google) return
  autocomplete = new window.google.maps.places.Autocomplete(searchInput.value, {
    componentRestrictions: { country: 'gb' }, fields: ['geometry', 'formatted_address'], types: ['geocode', 'establishment']
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
  drawingManager.setDrawingMode(null)
  polygon.setEditable(false)

  const areaM2     = calculatePolygonAreaM2(polygon)
  const headingDeg = calculateRoofOrientation(polygon)

  buildings.value.push({
    id: Date.now() + Math.random(),
    name: `Building ${buildings.value.length + 1}`,
    roofAreaM2: areaM2,
    roofHeadingDeg: headingDeg,
    compassDirection: headingToCompass(headingDeg),
    orientationFactor: orientationEfficiency(headingDeg),
    roofTiltDeg: 35,
    polygonRef: polygon
  })

  if (!pvgisFetched.value) {
    const bounds = new window.google.maps.LatLngBounds()
    polygon.getPath().forEach(p => bounds.extend(p))
    const centre = bounds.getCenter()
    siteLat.value = centre.lat()
    siteLng.value = centre.lng()
    await fetchIrradiance()
    pvgisFetched.value = true
  }
}

async function fetchIrradiance() {
  irradianceLoading.value = true
  pvgisError.value = false
  monthlyData.value = []
  try {
    const result = await fetchSolarData(siteLat.value, siteLng.value, 35, 0)
    siteIrradiance.value = result.annual.irradiance || result.annual.yieldPerKwp
    monthlyData.value = annotateMonths(result.monthly)
  } catch {
    pvgisError.value = true
    siteIrradiance.value = fallbackIrradiance(siteLat.value)
    monthlyData.value = fallbackMonthly(siteIrradiance.value)
  } finally {
    irradianceLoading.value = false
  }
}

function enableDrawing() {
  if (drawingManager) drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
}

function removeBuilding(id) {
  const idx = buildings.value.findIndex(b => b.id === id)
  if (idx === -1) return
  buildings.value[idx].polygonRef?.setMap(null)
  buildings.value.splice(idx, 1)
  buildings.value.forEach((b, i) => { b.name = `Building ${i + 1}` })
}

function updateBuildingOrientation(building) {
  building.roofHeadingDeg    = COMPASS_TO_HEADING[building.compassDirection] ?? 180
  building.orientationFactor = orientationEfficiency(building.roofHeadingDeg)
}

function confirmAllBuildings() {
  if (!buildings.value.length || irradianceLoading.value) return
  emit('confirmed', {
    buildings: buildings.value.map(b => ({
      name: b.name, roofAreaM2: b.roofAreaM2,
      compassDirection: b.compassDirection, orientationFactor: b.orientationFactor,
      roofTiltDeg: b.roofTiltDeg, roofHeadingDeg: b.roofHeadingDeg
    })),
    irradianceKwhM2y: siteIrradiance.value,
    monthlyData: monthlyData.value,
    lat: siteLat.value, lng: siteLng.value
  })
}

function clearSearch() { addressQuery.value = ''; searchInput.value?.focus() }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
