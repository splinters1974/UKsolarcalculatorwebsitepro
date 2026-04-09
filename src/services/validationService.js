/**
 * Input validation for the commercial solar calculator.
 */

export function validateRoofInputs({ roofAreaM2, irradianceKwhM2y, roofTiltDeg, orientationFactor }) {
  const errors   = []
  const warnings = []

  if (!roofAreaM2 || roofAreaM2 <= 0) {
    errors.push('Roof area must be greater than 0.')
  } else if (roofAreaM2 < 50) {
    warnings.push('Small roof area (under 50 m²) — commercial systems typically need at least 100 m² of usable roof space.')
  } else if (roofAreaM2 > 10000) {
    warnings.push('Very large roof area — a detailed site survey is recommended for sites of this scale.')
  }

  if (!irradianceKwhM2y || irradianceKwhM2y <= 0) {
    errors.push('Solar irradiance data is missing.')
  } else if (irradianceKwhM2y < 700 || irradianceKwhM2y > 1400) {
    warnings.push(`Unusual irradiance value (${irradianceKwhM2y} kWh/m²/yr) — typical UK range is 850–1,200.`)
  }

  if (roofTiltDeg === 0) {
    warnings.push('Flat roofs can be fitted with angled ballast frames to optimise panel tilt — standard practice for commercial flat roofs.')
  }

  if (orientationFactor < 0.65) {
    warnings.push('North-facing roofs generate significantly less energy. Consider the east or west elevation instead.')
  } else if (orientationFactor < 0.80) {
    warnings.push('This orientation is not optimal for solar. East/west-facing roofs typically yield 85% of south-facing output.')
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateUserForm(form) {
  const errors = {}
  if (!form.name?.trim())      errors.name      = 'Full name is required.'
  if (!form.email?.trim())     errors.email     = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address.'
  if (!form.company?.trim())   errors.company   = 'Company name is required.'
  if (!form.jobTitle?.trim())  errors.jobTitle  = 'Job title is required.'
  if (!form.telephone?.trim()) errors.telephone = 'Telephone number is required.'
  else if (!/^[\d\s\+\(\)\-]{7,}$/.test(form.telephone)) errors.telephone = 'Please enter a valid UK telephone number.'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateUnitRate(unitRatePence) {
  if (unitRatePence === null || unitRatePence === undefined || unitRatePence === '') {
    return { valid: false, error: 'Please enter your current electricity unit rate.' }
  }
  const v = Number(unitRatePence)
  if (isNaN(v) || v <= 0) {
    return { valid: false, error: 'Unit rate must be a positive number.' }
  }
  if (v < 5) {
    return { valid: false, error: 'Unit rate seems too low — typical commercial rates are 15–35p/kWh.' }
  }
  if (v > 100) {
    return { valid: false, error: 'Unit rate seems unusually high. Please check and re-enter.' }
  }
  return { valid: true, error: null }
}
