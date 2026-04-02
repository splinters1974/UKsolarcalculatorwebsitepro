<template>
  <div class="flex flex-col gap-4">
    <!-- Address Search -->
    <div class="relative">
      <label class="form-label">Search your address</label>
      <div class="flex gap-2">
        <input
          ref="searchInput"
          v-model="addressQuery"
          type="text"
          class="form-input"
          placeholder="e.g. 10 Downing Street, London"
          @keydown.enter.prevent="searchAddress"
        />
        <button class="btn-primary whitespace-nowrap" @click="searchAddress" :disabled="!mapsLoaded">
          Find
        </button>
      </div>
    </div>

    <!-- Map container -->
    <div class="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style="height: 450px;">
      <div ref="mapContainer" class="w-full h-full bg-gray-100"></div>

      <!-- Loading overlay -->
      <div v-if="!mapsLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div v-if="apiKeyMissing" class="text-center p-6 max-w-sm">
          <div class="text-4xl mb-3">🗝️</div>
          <p class="font-semibold text-gray-800 mb-1">Google Maps API key needed</p>
          <p class="text-sm text-gray-500">Add your key to <code class="bg-gray-200 px-1 rounded">.env</code> as <code class="bg-gray-200 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code></p>
          <button class="btn-secondary mt-4 text-sm" @click="useManualMode">
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

    <!-- Drawing instructions -->
    <div v-if="mapsLoaded && !polygonDrawn" class="bg-solar-50 border border-solar-200 rounded-lg p-4 text-sm text-solar-800">
      <p class="font-semibold mb-1">How to measure your roof:</p>
      <ol class="list-decimal list-inside space-y-1 text-solar-700">
        <li>Search your address above to zoom in</li>
        <li>Click the <strong>polygon tool</strong> (pentagon icon) in the top-right of the map</li>
        <li>Click around the edges of your roof to trace it</li>
        <li>Double-click to complete the shape</li>
      </ol>
    </div>

    <!-- Polygon drawn — show measurements -->
    <div v-if="polygonDrawn" class="grid grid-cols-3 gap-3">
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-solar-600">{{ Math.round(roofAreaM2) }}<span class="text-base font-normal">m²</span></p>
        <p class="text-xs text-gray-500 mt-1">Roof area drawn</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-solar-600">{{ compassDirection }}</p>
        <p class="text-xs text-gray-500 mt-1">Roof orientation</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-solar-600">{{ irradianceLoading ? '…' : irradianceKwhM2y }}</p>
        <p class="text-xs text-gray-500 mt-1">kWh/m²/year</p>
      </div>
    </div>

    <!-- Actions after drawing -->
    <div v-if="polygonDrawn" class="flex items-center gap-3">
      <button class="btn-primary flex-1" @click="$emit('confirmed', mapData)" :disabled="irradianceLoading">
        {{ irradianceLoading ? 'Fetching irradiance data…' : 'Use this roof →' }}
      </button>
      <button class="btn-secondary" @click="clearPolygon">Redraw</button>
    </div>

    <!-- PVGIS error -->
    <p v-if="pvgisError" class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
      ⚠️ Could not fetch live irradiance data — using estimated UK average for your location instead.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadGoogleMaps, calculatePolygonAreaM2, calculateRoofOrientation, headingToCompass, orientationEfficiency } from '@/services/googleMapsService'
import { fetchSolarIrradiance, fallbackIrradiance } from '@/services/pvgisService'

const emit = defineEmits(['confirmed', 'manualMode'])

const mapContainer = ref(null)
const searchInput = ref(null)
const addressQuery = ref('')

const mapsLoaded = ref(false)
const apiKeyMissing = ref(false)
const polygonDrawn = ref(false)
const irradianceLoading = ref(false)
const pvgisError = ref(false)

const roofAreaM2 = ref(0)
const roofHeadingDeg = ref(180)
const irradianceKwhM2y = ref(0)
const lat = ref(0)
const lng = ref(0)

let map = null
let drawingManager = null
let currentPolygon = null

const compassDirection = computed(() => headingToCompass(roofHeadingDeg.value))

const mapData = computed(() => ({
  roofAreaM2: roofAreaM2.value,
  roofHeadingDeg: roofHeadingDeg.value,
  compassDirection: compassDirection.value,
  orientationFactor: orientationEfficiency(roofHeadingDeg.value),
  irradianceKwhM2y: irradianceKwhM2y.value,
  lat: lat.value,
  lng: lng.value
}))

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey.startsWith('PLACEHOLDER')) {
    apiKeyMissing.value = true
    return
  }

  try {
    const maps = await loadGoogleMaps()
    initMap(maps)
    mapsLoaded.value = true
  } catch (err) {
    console.error(err)
    apiKeyMissing.value = true
  }
})

function initMap(maps) {
  map = new maps.Map(mapContainer.value, {
    center: { lat: 52.5, lng: -1.5 }, // Centre of England
    zoom: 6,
    mapTypeId: 'satellite',
    tilt: 0,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true
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
      fillOpacity: 0.35,
      strokeColor: '#d97706',
      strokeWeight: 2,
      editable: true
    }
  })

  drawingManager.setMap(map)

  maps.event.addListener(drawingManager, 'polygoncomplete', onPolygonComplete)
}

async function onPolygonComplete(polygon) {
  if (currentPolygon) currentPolygon.setMap(null)
  currentPolygon = polygon

  drawingManager.setDrawingMode(null)

  roofAreaM2.value = calculatePolygonAreaM2(polygon)
  roofHeadingDeg.value = calculateRoofOrientation(polygon)

  // Get centroid for PVGIS lookup
  const bounds = new window.google.maps.LatLngBounds()
  polygon.getPath().forEach(p => bounds.extend(p))
  const centre = bounds.getCenter()
  lat.value = centre.lat()
  lng.value = centre.lng()

  polygonDrawn.value = true

  // Fetch real irradiance
  await fetchIrradiance()
}

async function fetchIrradiance() {
  irradianceLoading.value = true
  pvgisError.value = false
  try {
    const result = await fetchSolarIrradiance(lat.value, lng.value, 35, roofHeadingDeg.value - 180)
    irradianceKwhM2y.value = result.irradiance
  } catch (err) {
    pvgisError.value = true
    irradianceKwhM2y.value = fallbackIrradiance(lat.value)
  } finally {
    irradianceLoading.value = false
  }
}

function clearPolygon() {
  if (currentPolygon) {
    currentPolygon.setMap(null)
    currentPolygon = null
  }
  polygonDrawn.value = false
  roofAreaM2.value = 0
  irradianceKwhM2y.value = 0
  pvgisError.value = false
}

function searchAddress() {
  if (!window.google || !addressQuery.value.trim()) return
  const geocoder = new window.google.maps.Geocoder()
  geocoder.geocode(
    { address: addressQuery.value + ', UK', region: 'GB' },
    (results, status) => {
      if (status === 'OK' && results[0]) {
        map.setCenter(results[0].geometry.location)
        map.setZoom(19)
        map.setMapTypeId('satellite')
      }
    }
  )
}

function useManualMode() {
  emit('manualMode')
}
</script>
