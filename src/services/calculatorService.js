/**
 * Solar Calculator Service — Commercial & Industrial
 * Methodology aligned with uksolarcalculator.co.uk
 * Supports multiple buildings per site, capital purchase and PPA funding models.
 */

// ── Constants ──────────────────────────────────────────────────────────────
const PERFORMANCE_RATIO  = 0.84    // Commercial inverter + wiring efficiency
const USABLE_ROOF_FACTOR = 0.70    // 70% of drawn area (plant, rooflights, margins)
const PANEL_AREA_M2      = 2.0     // m² per 450W commercial bifacial panel
const PANEL_PEAK_WATTS   = 450     // Commercial-grade module (Wp)
const COST_PER_KWP       = 800     // £/kWp — commercial bulk pricing incl. labour
const SELF_CONSUMPTION   = 0.75    // 75% self-consumed on-site (commercial daytime loads)
const ANNUAL_DEGRADATION = 0.005   // 0.5%/yr panel output degradation
const PROJECTION_YEARS   = 30      // 30-year operational lifespan
const SEG_TARIFF_P       = 5       // p/kWh Smart Export Guarantee (additional benefit)
const GRID_ESCALATION    = 0.03    // 3%/yr assumed grid price rise
const PPA_DISCOUNT       = 0.20    // PPA rate = grid rate × (1 - PPA_DISCOUNT) = 80% of grid
const CO2_KG_PER_KWH     = 0.233   // UK grid carbon intensity 2024 (DESNZ)

/**
 * Calculate generation for a single building.
 */
function calcBuilding(building, irradianceKwhM2y) {
  const { roofAreaM2, orientationFactor = 0.95 } = building
  const usableAreaM2 = roofAreaM2 * USABLE_ROOF_FACTOR
  const panelCount   = Math.floor(usableAreaM2 / PANEL_AREA_M2)
  const systemKwp    = (panelCount * PANEL_PEAK_WATTS) / 1000
  const annualKwh    = systemKwp * irradianceKwhM2y * PERFORMANCE_RATIO * orientationFactor
  return {
    panelCount,
    systemKwp:    +systemKwp.toFixed(2),
    usableAreaM2: +usableAreaM2.toFixed(1),
    annualKwh:    Math.round(annualKwh)
  }
}

/**
 * Full commercial solar calculation for one or more buildings on the same site.
 *
 * @param {object}   inputs
 * @param {Array}    inputs.buildings         - [{ roofAreaM2, orientationFactor, roofTiltDeg, compassDirection, name }]
 * @param {number}   inputs.irradianceKwhM2y  - PVGIS site irradiance kWh/m²/year
 * @param {number}   inputs.unitRatePence     - Customer grid rate p/kWh (e.g. 24.5)
 * @param {number}   [inputs.ppaDiscountPct]  - PPA discount off grid rate (default 20%)
 * @returns {object} Full results including capital and PPA models
 */
export function calculateSolar({ buildings, irradianceKwhM2y, unitRatePence, ppaDiscountPct = 20 }) {
  const unitRateGbp = unitRatePence / 100

  // ── Per-building results ────────────────────────────────────────────────
  const bldgResults = buildings.map((b, i) => ({
    name:             b.name || `Building ${i + 1}`,
    roofAreaM2:       b.roofAreaM2,
    compassDirection: b.compassDirection || 'S',
    roofTiltDeg:      b.roofTiltDeg ?? 35,
    orientationFactor: b.orientationFactor,
    ...calcBuilding(b, irradianceKwhM2y)
  }))

  // ── Site totals ─────────────────────────────────────────────────────────
  const totalPanelCount   = bldgResults.reduce((s, b) => s + b.panelCount, 0)
  const totalSystemKwp    = +bldgResults.reduce((s, b) => s + b.systemKwp, 0).toFixed(2)
  const totalUsableAreaM2 = +bldgResults.reduce((s, b) => s + b.usableAreaM2, 0).toFixed(1)
  const totalRoofAreaM2   = +buildings.reduce((s, b) => s + (b.roofAreaM2 || 0), 0).toFixed(1)
  const annualGenerationKwh = bldgResults.reduce((s, b) => s + b.annualKwh, 0)

  const selfConsumedKwh = annualGenerationKwh * SELF_CONSUMPTION
  const exportedKwh     = annualGenerationKwh * (1 - SELF_CONSUMPTION)
  const installCostGbp  = Math.round(totalSystemKwp * COST_PER_KWP)

  // ── Capital purchase model ──────────────────────────────────────────────
  // Primary saving: avoided grid purchase on self-consumed solar
  const annualSavings  = selfConsumedKwh * unitRateGbp
  // Additional benefit: Smart Export Guarantee (shown separately, NOT in main savings)
  const exportIncomeSEG = exportedKwh * (SEG_TARIFF_P / 100)
  // Total for payback calc includes export (it is real money)
  const totalAnnualBenefit = annualSavings + exportIncomeSEG
  const paybackYears = +(installCostGbp / totalAnnualBenefit).toFixed(1)

  // Year-by-year: grid rate escalates, generation degrades
  let capitalCumulative = -installCostGbp
  const capitalYearByYear = Array.from({ length: PROJECTION_YEARS }, (_, i) => {
    const year        = i + 1
    const degradation = Math.pow(1 - ANNUAL_DEGRADATION, i)
    const escalation  = Math.pow(1 + GRID_ESCALATION, i)
    const genKwh      = annualGenerationKwh * degradation
    const selfCon     = genKwh * SELF_CONSUMPTION
    const exported    = genKwh * (1 - SELF_CONSUMPTION)
    const benefit     = selfCon * unitRateGbp * escalation + exported * (SEG_TARIFF_P / 100)
    capitalCumulative += benefit
    return { year, annualBenefit: Math.round(benefit), cumulative: Math.round(capitalCumulative) }
  })

  const thirtyYearGross  = capitalYearByYear.reduce((s, y) => s + y.annualBenefit, 0)
  const thirtyYearProfit = thirtyYearGross - installCostGbp

  // ── PPA model ───────────────────────────────────────────────────────────
  // Developer funds install. Customer pays PPA rate (80% of grid) per kWh self-consumed.
  // Customer saves (grid_rate - ppa_rate) on self-consumed kWh.
  // Grid rate escalates over time → saving grows. PPA rate is fixed.
  const ppaRateGbp     = unitRateGbp * (1 - ppaDiscountPct / 100)
  const ppaAnnualSavingY1 = selfConsumedKwh * (unitRateGbp - ppaRateGbp)

  const PPA_DURATIONS = [10, 15, 20, 25]
  const ppaContracts  = {}

  for (const duration of PPA_DURATIONS) {
    let ppaCumulative = 0
    const yearByYear = Array.from({ length: duration }, (_, i) => {
      const year        = i + 1
      const degradation = Math.pow(1 - ANNUAL_DEGRADATION, i)
      const escalation  = Math.pow(1 + GRID_ESCALATION, i)
      const genKwh      = annualGenerationKwh * degradation
      const selfCon     = genKwh * SELF_CONSUMPTION
      // Grid rate escalates; PPA rate is fixed → saving grows each year
      const yearSaving  = Math.max(0, selfCon * (unitRateGbp * escalation - ppaRateGbp))
      ppaCumulative    += yearSaving
      return { year, annualSaving: Math.round(yearSaving), cumulative: Math.round(ppaCumulative) }
    })
    ppaContracts[duration] = { totalSaving: Math.round(ppaCumulative), yearByYear }
  }

  // ── Environment ─────────────────────────────────────────────────────────
  const annualCo2KgSaved = Math.round(annualGenerationKwh * CO2_KG_PER_KWH)
  const treesEquivalent  = Math.round(annualCo2KgSaved / 21)

  return {
    buildings:          bldgResults,
    buildingCount:      bldgResults.length,
    totalPanelCount,
    totalSystemKwp,
    totalUsableAreaM2,
    totalRoofAreaM2:    +totalRoofAreaM2,
    annualGenerationKwh: Math.round(annualGenerationKwh),
    selfConsumedKwh:    Math.round(selfConsumedKwh),
    exportedKwh:        Math.round(exportedKwh),
    capital: {
      unitRatePence,
      installCostGbp,
      annualSavings:      Math.round(annualSavings),
      exportIncomeSEG:    Math.round(exportIncomeSEG),
      totalAnnualBenefit: Math.round(totalAnnualBenefit),
      paybackYears,
      thirtyYearGross:    Math.round(thirtyYearGross),
      thirtyYearProfit:   Math.round(thirtyYearProfit),
      yearByYear:         capitalYearByYear
    },
    ppa: {
      unitRatePence,
      ppaRatePence:    Math.round(ppaRateGbp * 100 * 10) / 10,
      ppaDiscountPct,
      annualSavingY1:  Math.round(ppaAnnualSavingY1),
      contracts:       ppaContracts
    },
    annualCo2KgSaved,
    treesEquivalent
  }
}

export function formatGbp(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP', maximumFractionDigits: 0
  }).format(value)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(value)
}
