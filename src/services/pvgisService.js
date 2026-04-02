/**
 * PVGIS Service
 * Fetches real solar irradiance data from the European Commission's PVGIS API.
 * Free, no API key required, rate-limited to ~100 req/min.
 * Docs: https://re.jrc.ec.europa.eu/pvg_tools/en/tools.html
 */

const PVGIS_BASE = 'https://re.jrc.ec.europa.eu/api/v5_2'

/**
 * Fetch annual solar irradiance for a UK lat/lng location.
 * Returns kWh/m²/year of global horizontal irradiance (GHI).
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} roofTilt - Roof angle in degrees (0=flat, 30=typical UK, 45=steep)
 * @param {number} azimuth - Roof orientation in degrees from South (-180 to 180; 0=South)
 * @returns {Promise<{irradiance: number, peakPower: number, raw: object}>}
 */
export async function fetchSolarIrradiance(lat, lng, roofTilt = 35, azimuth = 0) {
  // PVGIS uses azimuth relative to South: 0=South, -90=East, 90=West, 180=North
  const pvgisAzimuth = azimuth > 180 ? azimuth - 360 : azimuth

  const params = new URLSearchParams({
    lat: lat.toFixed(5),
    lon: lng.toFixed(5),
    peakpower: 1,         // 1 kWp reference system
    loss: 14,             // typical system losses %
    angle: roofTilt,
    aspect: pvgisAzimuth,
    outputformat: 'json',
    browser: 0
  })

  const url = `${PVGIS_BASE}/PVcalc?${params}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`PVGIS API error: ${response.status}`)
  }

  const data = await response.json()

  // Annual yield in kWh per kWp installed
  const annualYield = data.outputs.totals.fixed.E_y

  // Irradiance on the tilted plane (Hopt = kWh/m²/year)
  const irradiance = data.outputs.totals.fixed.H_y || estimateFromYield(annualYield)

  return {
    irradiance: Math.round(irradiance),        // kWh/m²/year
    yieldPerKwp: Math.round(annualYield),       // kWh/kWp/year
    raw: data
  }
}

/**
 * Fallback UK irradiance estimate by latitude band if PVGIS fails.
 * Based on UK Met Office averages.
 */
export function fallbackIrradiance(lat) {
  if (lat > 57) return 850       // Scotland (Highland)
  if (lat > 55) return 920       // Scotland (Central)
  if (lat > 53) return 980       // Northern England
  if (lat > 51.5) return 1050   // Midlands
  if (lat > 50.5) return 1100   // South England
  return 1150                    // South Coast / Cornwall
}

function estimateFromYield(yieldPerKwp) {
  // Approximate: irradiance ≈ yield / 0.85 (system efficiency)
  return yieldPerKwp / 0.85
}
