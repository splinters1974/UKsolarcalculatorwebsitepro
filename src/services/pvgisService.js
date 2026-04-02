/**
 * PVGIS Service
 * Fetches real solar irradiance data via our Netlify proxy function.
 * Falls back to direct PVGIS call if running locally without Netlify.
 * PVGIS docs: https://re.jrc.ec.europa.eu/pvg_tools/en/tools.html
 */

const PROXY_URL = '/.netlify/functions/pvgis-proxy'
const PVGIS_DIRECT = 'https://re.jrc.ec.europa.eu/api/v5_2'

/**
 * Fetch solar data for a UK location.
 *
 * @param {number} lat          - Latitude
 * @param {number} lng          - Longitude
 * @param {number} roofTilt     - Roof angle in degrees (0=flat, 35=typical, 45=steep)
 * @param {number} azimuth      - Degrees from South (-180 to 180; 0=South, -90=East, 90=West)
 * @returns {Promise<PVGISResult>}
 */
export async function fetchSolarData(lat, lng, roofTilt = 35, azimuth = 0) {
  // Try proxy first (works on Netlify), fall back to direct for local dev
  const useProxy = !window.location.hostname.includes('localhost') ||
                   window.location.port === ''

  let data
  if (useProxy) {
    data = await fetchViaProxy(lat, lng, roofTilt, azimuth)
  } else {
    data = await fetchDirect(lat, lng, roofTilt, azimuth)
  }
  return data
}

async function fetchViaProxy(lat, lng, roofTilt, azimuth) {
  const params = new URLSearchParams({
    lat: lat.toFixed(5),
    lon: lng.toFixed(5),
    angle: roofTilt,
    aspect: azimuth
  })

  const response = await fetch(`${PROXY_URL}?${params}`)
  if (!response.ok) throw new Error(`Proxy error: ${response.status}`)
  return await response.json()
}

async function fetchDirect(lat, lng, roofTilt, azimuth) {
  const params = new URLSearchParams({
    lat: lat.toFixed(5),
    lon: lng.toFixed(5),
    peakpower: 1,
    loss: 14,
    angle: roofTilt,
    aspect: azimuth,
    outputformat: 'json',
    browser: 0,
    monthlydata: 1
  })

  const response = await fetch(`${PVGIS_DIRECT}/PVcalc?${params}`)
  if (!response.ok) throw new Error(`PVGIS error: ${response.status}`)
  const raw = await response.json()

  const annualTotals = raw.outputs.totals.fixed
  const monthly = raw.outputs.monthly?.fixed ?? []

  return {
    annual: {
      irradiance: Math.round(annualTotals.H_y ?? 0),
      yieldPerKwp: Math.round(annualTotals.E_y),
      fullLoadHours: Math.round(annualTotals.E_y)
    },
    monthly: monthly.map(m => ({
      month: m.month,
      irradiance: +(m.H_m ?? 0).toFixed(1),
      yieldKwh: +(m.E_m ?? 0).toFixed(1)
    })),
    meta: { lat, lon: lng, angle: roofTilt, aspect: azimuth }
  }
}

/**
 * Fallback UK irradiance estimate by latitude band (if PVGIS unreachable).
 * Based on UK Met Office averages (kWh/m²/year on optimally tilted surface).
 */
export function fallbackIrradiance(lat) {
  if (lat > 57.5) return 840      // Scottish Highlands
  if (lat > 56)   return 900      // Central Scotland
  if (lat > 54.5) return 950      // Northern England
  if (lat > 53)   return 990      // Yorkshire / North Midlands
  if (lat > 51.5) return 1050     // South Midlands / London
  if (lat > 50.5) return 1100     // South England
  return 1150                      // South Coast / Cornwall
}

/**
 * Build fallback monthly profile when PVGIS is unavailable.
 * Uses typical UK seasonal distribution (% of annual).
 */
export function fallbackMonthly(annualYieldPerKwp) {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const seasonal = [0.03, 0.045, 0.075, 0.095, 0.115, 0.12, 0.115, 0.105, 0.085, 0.06, 0.035, 0.025]
  return seasonal.map((pct, i) => ({
    month: i + 1,
    monthName: monthNames[i],
    yieldKwh: +(annualYieldPerKwp * pct).toFixed(1)
  }))
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/**
 * Annotate monthly data with month names.
 */
export function annotateMonths(monthlyArray) {
  return monthlyArray.map(m => ({
    ...m,
    monthName: MONTH_NAMES[(m.month - 1) % 12]
  }))
}
