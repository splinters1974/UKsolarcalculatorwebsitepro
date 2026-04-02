/**
 * Netlify Serverless Function: PVGIS Proxy
 *
 * Proxies requests to the PVGIS API server-side.
 * Benefits:
 *   - Avoids any future CORS issues with PVGIS
 *   - Centralises API versioning (swap PVGIS endpoint here, not in client)
 *   - Can add caching later to reduce repeat calls for same location
 *
 * Endpoint: /.netlify/functions/pvgis-proxy
 * Query params: lat, lon, angle, aspect
 */

const PVGIS_BASE = 'https://re.jrc.ec.europa.eu/api/v5_2'

export default async (request) => {
  // Only allow GET
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const url = new URL(request.url)
  const lat    = url.searchParams.get('lat')
  const lon    = url.searchParams.get('lon')
  const angle  = url.searchParams.get('angle')  || '35'
  const aspect = url.searchParams.get('aspect') || '0'

  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: 'lat and lon are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Basic UK bounds check
  const latNum = parseFloat(lat)
  const lonNum = parseFloat(lon)
  if (latNum < 49 || latNum > 61 || lonNum < -8 || lonNum > 2) {
    return new Response(JSON.stringify({ error: 'Coordinates outside UK bounds' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const pvgisParams = new URLSearchParams({
    lat,
    lon,
    peakpower: 1,
    loss: 14,
    angle,
    aspect,
    outputformat: 'json',
    browser: 0,
    monthlydata: 1   // request monthly breakdown
  })

  try {
    const response = await fetch(`${PVGIS_BASE}/PVcalc?${pvgisParams}`, {
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`PVGIS responded with ${response.status}`)
    }

    const data = await response.json()

    // Shape the response — pull out what the client needs
    const annualTotals = data.outputs.totals.fixed
    const monthly = data.outputs.monthly?.fixed ?? []

    const shaped = {
      annual: {
        irradiance: Math.round(annualTotals.H_y ?? 0),
        yieldPerKwp: Math.round(annualTotals.E_y),
        fullLoadHours: Math.round(annualTotals.E_y) // same as yield for 1kWp ref
      },
      monthly: monthly.map(m => ({
        month: m.month,
        irradiance: +(m.H_m ?? 0).toFixed(1),
        yieldKwh: +(m.E_m ?? 0).toFixed(1)
      })),
      meta: {
        lat: latNum,
        lon: lonNum,
        angle: parseFloat(angle),
        aspect: parseFloat(aspect)
      }
    }

    return new Response(JSON.stringify(shaped), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400' // cache 24h — irradiance doesn't change
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/.netlify/functions/pvgis-proxy'
}
