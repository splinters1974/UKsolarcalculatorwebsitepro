/**
 * Input validation for the solar calculator.
 * Returns { valid: bool, warnings: string[], errors: string[] }
 */

export function validateRoofInputs({ roofAreaM2, irradianceKwhM2y, roofTiltDeg, orientationFactor }) {
  const errors = []
  const warnings = []

  // Roof area
  if (!roofAreaM2 || roofAreaM2 <= 0) {
    errors.push('Roof area must be greater than 0.')
  } else if (roofAreaM2 < 8) {
    warnings.push('Very small roof area (under 8 m²) — you may only fit 1–2 panels.')
  } else if (roofAreaM2 > 3000) {
    warnings.push('Very large roof area — figures assume a standard roof. For large commercial sites, a professional survey is recommended.')
  }

  // Irradiance
  if (!irradianceKwhM2y || irradianceKwhM2y <= 0) {
    errors.push('Solar irradiance data is missing.')
  } else if (irradianceKwhM2y < 700 || irradianceKwhM2y > 1400) {
    warnings.push(`Unusual irradiance value (${irradianceKwhM2y} kWh/m²/yr) — UK range is typically 800–1,200.`)
  }

  // Roof tilt
  if (roofTiltDeg === 0) {
    warnings.push('Flat roofs can be fitted with angled mounting frames to optimise panel tilt — this is not reflected in the estimate.')
  }

  // Orientation
  if (orientationFactor < 0.65) {
    warnings.push('North-facing roofs generate significantly less energy. Consider whether the east or west slope is usable instead.')
  } else if (orientationFactor < 0.8) {
    warnings.push('This roof orientation is not ideal for solar. East or west-facing roofs typically capture 85% of south-facing output.')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
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

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateBillInput(annualBillGbp) {
  if (annualBillGbp === null || annualBillGbp === undefined || annualBillGbp === '') {
    return { valid: false, error: 'Please enter your annual electricity bill.' }
  }
  if (annualBillGbp < 0) {
    return { valid: false, error: 'Annual bill cannot be negative.' }
  }
  if (annualBillGbp > 100000) {
    return { valid: false, error: 'Annual bill seems unusually high — please check and re-enter.' }
  }
  return { valid: true, error: null }
}
