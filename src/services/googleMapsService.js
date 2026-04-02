/**
 * Google Maps Service
 * Handles loading the Maps API and computing geometry from drawn polygons.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let loadPromise = null

/**
 * Loads the Google Maps JavaScript API (once only).
 */
export function loadGoogleMaps() {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=drawing,places,geometry&callback=__googleMapsCallback`
    script.async = true
    script.defer = true

    window.__googleMapsCallback = () => {
      delete window.__googleMapsCallback
      resolve(window.google.maps)
    }

    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Google Maps API. Check your API key.'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * Calculate the area of a Google Maps polygon in square metres.
 * Uses the spherical geometry library for accuracy.
 */
export function calculatePolygonAreaM2(polygon) {
  const path = polygon.getPath()
  return Math.abs(
    window.google.maps.geometry.spherical.computeArea(path)
  )
}

/**
 * Calculate the orientation (compass bearing) of the longest edge of a polygon.
 * Returns degrees from North (0 = North, 90 = East, 180 = South, 270 = West).
 */
export function calculateRoofOrientation(polygon) {
  const path = polygon.getPath()
  const coords = []
  path.forEach(latlng => coords.push(latlng))

  let maxLength = 0
  let heading = 180 // default to South-facing (optimal UK)

  for (let i = 0; i < coords.length; i++) {
    const a = coords[i]
    const b = coords[(i + 1) % coords.length]
    const length = window.google.maps.geometry.spherical.computeDistanceBetween(a, b)
    if (length > maxLength) {
      maxLength = length
      heading = window.google.maps.geometry.spherical.computeHeading(a, b)
      if (heading < 0) heading += 360
    }
  }

  return Math.round(heading)
}

/**
 * Get a human-readable compass direction from degrees.
 */
export function headingToCompass(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

/**
 * Calculate the orientation efficiency factor (0–1) relative to South.
 * South = 1.0, East/West = ~0.85, North = ~0.60
 */
export function orientationEfficiency(headingDegrees) {
  // Deviation from South (180°)
  const deviation = Math.abs(headingDegrees - 180)
  const normalised = deviation > 180 ? 360 - deviation : deviation
  // cos curve: 0° off south = 1.0, 90° off = ~0.85, 180° (north) = 0.60
  return 0.6 + 0.4 * Math.cos((normalised * Math.PI) / 180)
}
