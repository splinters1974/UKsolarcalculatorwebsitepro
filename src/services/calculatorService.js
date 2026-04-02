/**
 * Solar Calculator Service
 * Core calculation logic for commercial & industrial solar output, savings and payback.
 * Figures aligned with uksolarcalculator.co.uk commercial methodology.
 */

// ── UK Commercial Solar Constants (2024) ──────────────────────────────────
const ELECTRICITY_UNIT_RATE = 0.245     // £/kWh — Ofgem business cap Q1 2024
const EXPORT_TARIFF = 0.15             // £/kWh — Smart Export Guarantee average
const PERFORMANCE_RATIO = 0.84         // System efficiency (inverter, wiring, temp losses)
                                        // Slightly higher than residential — commercial
                                        // inverters tend to be higher-spec
const USABLE_ROOF_FACTOR = 0.70        // 70% of drawn area usable (plant, rooflights, margins)
const PANEL_AREA_M2 = 2.0              // m² per panel — commercial uses larger 440–500W modules
const PANEL_PEAK_WATTS = 450           // Wp per panel — commercial-grade (450W bifacial)
const COST_PER_KWP = 800              // £/kWp — commercial bulk pricing incl. VAT
                                        // (site range: £600–900/kWp; mid-point used)
const SELF_CONSUMPTION_RATIO = 0.75   // 75% self-consumed on-site — commercial buildings
                                        // have high daytime loads (HVAC, machinery, lighting)
const ANNUAL_DEGRADATION = 0.005      // 0.5%/yr panel output degradation
const PROJECTION_YEARS = 30           // 30-year operational lifespan (per uksolarcalculator.co.uk)

/**
 * Run the full solar calculation.
 *
 * @param {object} inputs
 * @param {number} inputs.roofAreaM2         - Total drawn roof area in m²
 * @param {number} inputs.irradianceKwhM2y   - Solar irradiance kWh/m²/year from PVGIS
 * @param {number} inputs.orientationFactor  - 0–1 efficiency factor for roof direction
 * @param {number} inputs.roofTiltDeg        - Roof pitch in degrees
 * @param {number} inputs.annualBillGbp      - User's current annual electricity bill £
 * @param {number} [inputs.panelCountOverride] - Optional: user specifies panel count
 *
 * @returns {object} Full calculation results
 */
export function calculateSolar(inputs) {
  const {
    roofAreaM2,
    irradianceKwhM2y,
    orientationFactor = 0.95,
    roofTiltDeg = 35,
    annualBillGbp = 1200,
    panelCountOverride = null
  } = inputs

  // Usable roof area
  const usableAreaM2 = roofAreaM2 * USABLE_ROOF_FACTOR

  // Panel count
  const maxPanels = Math.floor(usableAreaM2 / PANEL_AREA_M2)
  const panelCount = panelCountOverride
    ? Math.min(panelCountOverride, maxPanels)
    : maxPanels

  // System size
  const systemKwp = (panelCount * PANEL_PEAK_WATTS) / 1000

  // Annual generation
  // Formula: kWp × irradiance × performance ratio × orientation factor
  const annualGenerationKwh = systemKwp * irradianceKwhM2y * PERFORMANCE_RATIO * orientationFactor

  // Financial
  const selfConsumedKwh = annualGenerationKwh * SELF_CONSUMPTION_RATIO
  const exportedKwh = annualGenerationKwh * (1 - SELF_CONSUMPTION_RATIO)

  const savingsFromSelfConsumption = selfConsumedKwh * ELECTRICITY_UNIT_RATE
  const exportIncome = exportedKwh * EXPORT_TARIFF
  const totalAnnualBenefit = savingsFromSelfConsumption + exportIncome

  // Bill reduction %
  const estimatedAnnualUsageKwh = annualBillGbp / ELECTRICITY_UNIT_RATE
  const billReductionPct = Math.min(
    Math.round((selfConsumedKwh / estimatedAnnualUsageKwh) * 100),
    100
  )

  // System cost
  const installCostGbp = systemKwp * COST_PER_KWP

  // Payback
  const paybackYears = installCostGbp / totalAnnualBenefit

  // 30-year projection (with degradation)
  const twentyFiveYearBenefit = Array.from({ length: PROJECTION_YEARS }, (_, i) => {
    const degraded = Math.pow(1 - ANNUAL_DEGRADATION, i)
    return totalAnnualBenefit * degraded
  }).reduce((a, b) => a + b, 0)

  // CO2 savings (UK grid average: 0.233 kg CO2/kWh)
  const annualCo2KgSaved = annualGenerationKwh * 0.233

  return {
    // System
    panelCount,
    systemKwp: +systemKwp.toFixed(2),
    usableAreaM2: +usableAreaM2.toFixed(1),

    // Generation
    annualGenerationKwh: Math.round(annualGenerationKwh),

    // Financial
    savingsFromSelfConsumption: +savingsFromSelfConsumption.toFixed(2),
    exportIncome: +exportIncome.toFixed(2),
    totalAnnualBenefit: +totalAnnualBenefit.toFixed(2),
    billReductionPct,
    installCostGbp: Math.round(installCostGbp),
    paybackYears: +paybackYears.toFixed(1),
    twentyFiveYearBenefit: Math.round(twentyFiveYearBenefit),

    // Environment
    annualCo2KgSaved: Math.round(annualCo2KgSaved),
    treesEquivalent: Math.round(annualCo2KgSaved / 21) // avg tree absorbs 21kg CO2/year
  }
}

/**
 * Format currency as GBP
 */
export function formatGbp(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
}

/**
 * Format a number with commas
 */
export function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(value)
}
