<template>
  <form @submit.prevent="submit" novalidate class="space-y-5">
    <div>
      <h2 class="text-xl font-bold text-gray-900">Your details</h2>
      <p class="text-sm text-gray-500 mt-1">
        We'll email your personalised solar report straight to your inbox.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Full name -->
      <div>
        <label class="form-label">Full name <span class="text-red-500">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'border-red-400 focus:ring-red-400': fieldErrors.name }"
          placeholder="Jane Smith"
          @blur="touch('name')"
        />
        <p v-if="fieldErrors.name" class="text-xs text-red-600 mt-1">{{ fieldErrors.name }}</p>
      </div>

      <!-- Email -->
      <div>
        <label class="form-label">Email address <span class="text-red-500">*</span></label>
        <input
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'border-red-400 focus:ring-red-400': fieldErrors.email }"
          placeholder="jane@example.com"
          @blur="touch('email')"
        />
        <p v-if="fieldErrors.email" class="text-xs text-red-600 mt-1">{{ fieldErrors.email }}</p>
      </div>

      <!-- Company -->
      <div>
        <label class="form-label">Company <span class="text-red-500">*</span></label>
        <input
          v-model="form.company"
          type="text"
          class="form-input"
          :class="{ 'border-red-400 focus:ring-red-400': fieldErrors.company }"
          placeholder="Acme Ltd"
          @blur="touch('company')"
        />
        <p v-if="fieldErrors.company" class="text-xs text-red-600 mt-1">{{ fieldErrors.company }}</p>
      </div>

      <!-- Job title -->
      <div>
        <label class="form-label">Job title <span class="text-red-500">*</span></label>
        <input
          v-model="form.jobTitle"
          type="text"
          class="form-input"
          :class="{ 'border-red-400 focus:ring-red-400': fieldErrors.jobTitle }"
          placeholder="Facilities Manager"
          @blur="touch('jobTitle')"
        />
        <p v-if="fieldErrors.jobTitle" class="text-xs text-red-600 mt-1">{{ fieldErrors.jobTitle }}</p>
      </div>

      <!-- Telephone -->
      <div class="sm:col-span-2">
        <label class="form-label">Telephone <span class="text-red-500">*</span></label>
        <input
          v-model="form.telephone"
          type="tel"
          class="form-input"
          :class="{ 'border-red-400 focus:ring-red-400': fieldErrors.telephone }"
          placeholder="07700 900000"
          @blur="touch('telephone')"
        />
        <p v-if="fieldErrors.telephone" class="text-xs text-red-600 mt-1">{{ fieldErrors.telephone }}</p>
      </div>
    </div>

    <!-- Additional info -->
    <div>
      <label class="form-label">
        Additional information
        <span class="text-gray-400 font-normal">(optional)</span>
      </label>
      <textarea
        v-model="form.additionalInfo"
        class="form-input resize-none"
        rows="3"
        placeholder="e.g. flat roof, planning constraints, battery storage interest, budget…"
      ></textarea>
    </div>

    <!-- Privacy notice -->
    <p class="text-xs text-gray-400 leading-relaxed">
      By submitting this form you consent to receiving your solar report and occasional relevant updates by email.
      We will not share your details with third parties. View our
      <a href="#" class="underline hover:text-gray-600">privacy policy</a>.
    </p>

    <!-- Submit error -->
    <div v-if="submitError" class="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
      <span class="text-lg leading-none">⚠️</span>
      <div>
        <p class="font-semibold">Something went wrong</p>
        <p class="mt-0.5">{{ submitError }}</p>
        <p class="mt-1 text-xs text-red-500">Your results are still shown below — you can download the PDF without submitting.</p>
      </div>
    </div>

    <!-- Dev mode notice (no Formspree key) -->
    <div v-if="isDevMode" class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
      <span>🔧</span>
      <span>Dev mode: Formspree endpoint not configured. Form will proceed without sending an email.</span>
    </div>

    <!-- Submit button -->
    <button
      type="submit"
      class="btn-primary w-full py-3 text-base"
      :disabled="submitting"
    >
      <span v-if="submitting" class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Sending your report…
      </span>
      <span v-else>Get my solar report →</span>
    </button>
  </form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { validateUserForm } from '@/services/validationService'
import { formatGbp, formatNumber } from '@/services/calculatorService'

const props = defineProps({
  calculationSummary: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['submitted'])

const submitting   = ref(false)
const submitError  = ref('')
const touched      = reactive({})

const form = reactive({
  name: '', email: '', company: '', jobTitle: '', telephone: '', additionalInfo: ''
})

const FORMSPREE = import.meta.env.VITE_FORMSPREE_ENDPOINT
const isDevMode = computed(() => !FORMSPREE || FORMSPREE.includes('PLACEHOLDER'))

// Validate only touched fields for inline errors
const fieldErrors = computed(() => {
  const { errors } = validateUserForm(form)
  const visible = {}
  Object.keys(errors).forEach(k => {
    if (touched[k]) visible[k] = errors[k]
  })
  return visible
})

function touch(field) {
  touched[field] = true
}

async function submit() {
  // Touch all fields to show any errors
  ;['name', 'email', 'company', 'jobTitle', 'telephone'].forEach(f => (touched[f] = true))

  const { valid } = validateUserForm(form)
  if (!valid) return

  submitting.value = true
  submitError.value = ''

  try {
    const s = props.calculationSummary

    // Build a rich payload — Formspree shows all fields in the email to us
    const payload = {
      // User details
      Name:          form.name,
      Email:         form.email,
      Company:       form.company,
      'Job Title':   form.jobTitle,
      Telephone:     form.telephone,
      Notes:         form.additionalInfo || '—',

      // Calculation results (for our records)
      '--- Solar Results ---':   '',
      'Roof Area':               `${Math.round(s.roofAreaM2 ?? 0)} m²`,
      'Roof Orientation':        s.compassDirection ?? '—',
      'Roof Pitch':              `${s.roofTiltDeg ?? 35}°`,
      'Irradiance':              `${s.irradianceKwhM2y ?? 0} kWh/m²/yr`,
      'System Size':             `${s.systemKwp ?? 0} kWp`,
      'Panel Count':             s.panelCount ?? 0,
      'Annual Generation':       `${formatNumber(s.annualGenerationKwh ?? 0)} kWh`,
      'Annual Benefit':          formatGbp(s.totalAnnualBenefit ?? 0),
      'Install Cost':            formatGbp(s.installCostGbp ?? 0),
      'Payback Period':          `${s.paybackYears ?? 0} years`,
      '30-Year Benefit':         formatGbp(s.twentyFiveYearBenefit ?? 0),
      'CO₂ Saved/Year':          `${formatNumber(s.annualCo2KgSaved ?? 0)} kg`,

      // Metadata
      'Submitted At':            new Date().toLocaleString('en-GB'),
      'Source':                  'UK Solar Calculator Pro',

      // Formspree directives
      _subject: `Solar Estimate — ${form.company} (${form.name})`,
      _replyto:  form.email
    }

    if (!isDevMode.value) {
      const res = await fetch(FORMSPREE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(payload)
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server responded with ${res.status}. Please try again.`)
      }
    } else {
      // Dev mode — log and continue
      console.log('[DEV] Formspree payload:', payload)
    }

    emit('submitted', { ...form })
  } catch (err) {
    submitError.value = err.message || 'An unexpected error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
